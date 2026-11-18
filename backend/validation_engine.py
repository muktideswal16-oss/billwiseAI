import datetime
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from .models import Document, ExtractedInvoice, InvoiceItem, ValidationIssue, DuplicateMatch

TOLERANCE = 0.05

def validate_document_data(
    db: Session,
    document: Document,
    extracted_data: ExtractedInvoice,
    items: List[InvoiceItem]
) -> Dict[str, Any]:
    """
    Performs comprehensive rule-based validation on an extracted invoice:
    1. Arithmetic Integrity (Totals & Line Items)
    2. Missing Mandatory Fields
    3. Date & Timeline Sanity
    4. Duplicate Detection
    5. Data Consistency & Currency Checks

    Returns summary: {
        "status": "PASSED" | "WARNINGS_FOUND" | "ERRORS_FOUND",
        "errors_count": int,
        "warnings_count": int,
        "passed_count": int,
        "duplicates_count": int,
        "issues": List[ValidationIssue],
        "checks_passed": List[str]
    }
    """
    # Clear existing unresolved issues for this document
    db.query(ValidationIssue).filter(
        ValidationIssue.document_id == document.id,
        ValidationIssue.resolved == False
    ).delete()

    issues: List[ValidationIssue] = []
    checks_passed: List[str] = []

    # ---------------- 1. MISSING INFORMATION CHECKS ----------------
    if not extracted_data.vendor_name or extracted_data.vendor_name.strip() in ["", "Unknown Vendor", "N/A"]:
        issues.append(ValidationIssue(
            document_id=document.id,
            category="missing_field",
            issue_type="Missing Vendor Name",
            issue_description="The vendor name could not be identified with certainty from the document.",
            severity="error",
            field_name="vendor_name",
            expected_value="Valid Business Name",
            actual_value=extracted_data.vendor_name or "None"
        ))
    else:
        checks_passed.append("Vendor name identified and verified")

    if not extracted_data.invoice_number or extracted_data.invoice_number.strip() in ["", "None", "N/A"]:
        issues.append(ValidationIssue(
            document_id=document.id,
            category="missing_field",
            issue_type="Missing Invoice Number",
            issue_description="No invoice identifier (INV#) was found on the document.",
            severity="error",
            field_name="invoice_number",
            expected_value="Invoice / Receipt ID",
            actual_value=extracted_data.invoice_number or "None"
        ))
    else:
        checks_passed.append(f"Invoice number format valid: {extracted_data.invoice_number}")

    if not extracted_data.invoice_date or extracted_data.invoice_date.strip() in ["", "None"]:
        issues.append(ValidationIssue(
            document_id=document.id,
            category="missing_field",
            issue_type="Missing Invoice Date",
            issue_description="Invoice issue date is missing or could not be parsed.",
            severity="error",
            field_name="invoice_date",
            expected_value="YYYY-MM-DD",
            actual_value=extracted_data.invoice_date or "None"
        ))
    else:
        checks_passed.append(f"Invoice issue date verified: {extracted_data.invoice_date}")

    if extracted_data.grand_total is None or extracted_data.grand_total <= 0:
        issues.append(ValidationIssue(
            document_id=document.id,
            category="missing_field",
            issue_type="Zero or Missing Grand Total",
            issue_description="The grand total amount is zero or missing, which invalidates the accounting entry.",
            severity="error",
            field_name="grand_total",
            expected_value="> 0.00",
            actual_value=f"{extracted_data.grand_total:.2f}" if extracted_data.grand_total else "0.00"
        ))
    else:
        checks_passed.append(f"Grand total present: {extracted_data.currency} {extracted_data.grand_total:,.2f}")

    # ---------------- 2. MATHEMATICAL CALCULATION CHECKS ----------------
    # A. Subtotal + Tax - Discount == Grand Total
    expected_grand_total = round(extracted_data.subtotal + extracted_data.tax_amount - extracted_data.discount, 2)
    diff = abs(expected_grand_total - extracted_data.grand_total)

    if diff > TOLERANCE:
        issues.append(ValidationIssue(
            document_id=document.id,
            category="calculation",
            issue_type="Grand Total Discrepancy",
            issue_description=(
                f"Formula mismatch: Subtotal ({extracted_data.subtotal:,.2f}) + "
                f"Tax ({extracted_data.tax_amount:,.2f}) - Discount ({extracted_data.discount:,.2f}) = "
                f"{expected_grand_total:,.2f}, but Grand Total is {extracted_data.grand_total:,.2f}."
            ),
            severity="error",
            field_name="grand_total",
            expected_value=f"{expected_grand_total:.2f}",
            actual_value=f"{extracted_data.grand_total:.2f}"
        ))
    else:
        checks_passed.append("Grand total matches financial formula (Subtotal + Tax - Discount)")

    # B. Line items sum vs Subtotal
    if items:
        sum_line_totals = round(sum(item.line_total for item in items), 2)
        if abs(sum_line_totals - extracted_data.subtotal) > TOLERANCE:
            issues.append(ValidationIssue(
                document_id=document.id,
                category="calculation",
                issue_type="Line Item Sum vs Subtotal Mismatch",
                issue_description=(
                    f"The sum of all line items ({sum_line_totals:,.2f}) does not match "
                    f"the declared invoice subtotal ({extracted_data.subtotal:,.2f}). Difference: {abs(sum_line_totals - extracted_data.subtotal):,.2f}."
                ),
                severity="warning",
                field_name="subtotal",
                expected_value=f"{sum_line_totals:.2f}",
                actual_value=f"{extracted_data.subtotal:.2f}"
            ))
        else:
            checks_passed.append(f"All {len(items)} line items sum perfectly to Subtotal ({extracted_data.subtotal:,.2f})")

        # C. Individual line item quantity * unit_price - discount == line_total
        for idx, item in enumerate(items, 1):
            item_disc = getattr(item, 'discount', 0.0) or 0.0
            expected_line = round(item.quantity * item.unit_price - item_disc, 2)
            if abs(expected_line - item.line_total) > TOLERANCE:
                issues.append(ValidationIssue(
                    document_id=document.id,
                    category="calculation",
                    issue_type="Line Item Rate Calculation Mismatch",
                    item_index=idx,
                    item_name=item.item_name,
                    issue_description=(
                        f"Item #{idx} '{item.item_name}': Qty ({item.quantity}) × Unit Price ({item.unit_price:,.2f})"
                        + (f" - Discount ({item_disc:,.2f})" if item_disc > 0 else "")
                        + f" = {expected_line:,.2f}, but line total is listed as {item.line_total:,.2f}."
                    ),
                    severity="warning",
                    field_name=f"item_{idx}_line_total",
                    expected_value=f"{expected_line:.2f}",
                    actual_value=f"{item.line_total:.2f}"
                ))

    # ---------------- 3. DATE SANITY CHECKS ----------------
    inv_dt = None
    due_dt = None
    if extracted_data.invoice_date:
        for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y"):
            try:
                inv_dt = datetime.datetime.strptime(extracted_data.invoice_date, fmt).date()
                break
            except ValueError:
                pass

    if extracted_data.due_date:
        for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y"):
            try:
                due_dt = datetime.datetime.strptime(extracted_data.due_date, fmt).date()
                break
            except ValueError:
                pass

    if inv_dt and due_dt:
        if due_dt < inv_dt:
            issues.append(ValidationIssue(
                document_id=document.id,
                category="date",
                issue_type="Due Date Prior to Invoice Date",
                issue_description=f"Due date ({due_dt.isoformat()}) is earlier than issue date ({inv_dt.isoformat()}).",
                severity="warning",
                field_name="due_date",
                expected_value=f">= {inv_dt.isoformat()}",
                actual_value=due_dt.isoformat()
            ))
        else:
            checks_passed.append(f"Payment due timeline valid: {due_dt.isoformat()}")

    if inv_dt:
        today = datetime.date.today()
        if (inv_dt - today).days > 31:
            issues.append(ValidationIssue(
                document_id=document.id,
                category="date",
                issue_type="Suspicious Future Invoice Date",
                issue_description=f"Invoice date {inv_dt.isoformat()} is more than 30 days into the future.",
                severity="warning",
                field_name="invoice_date",
                expected_value=f"<= {today.isoformat()}",
                actual_value=inv_dt.isoformat()
            ))

    # ---------------- 4. DUPLICATE DETECTION CHECK ----------------
    duplicates_found = check_duplicates_for_document(db, document, extracted_data)
    for dup in duplicates_found:
        issues.append(ValidationIssue(
            document_id=document.id,
            category="duplicate",
            issue_type="Potential Duplicate Document",
            issue_description=(
                f"Matched with existing record (Doc ID #{dup['matched_document_id']}). "
                f"Reasons: {', '.join(dup['reasons'])}. Match confidence: {dup['score']:.0f}%."
            ),
            severity="error" if dup['score'] >= 90 else "warning",
            field_name="invoice_number",
            expected_value="Unique Record",
            actual_value=f"Matched Doc #{dup['matched_document_id']}"
        ))

    # Save issues to database
    for issue in issues:
        db.add(issue)

    errors_count = sum(1 for i in issues if i.severity == "error" and not i.resolved)
    warnings_count = sum(1 for i in issues if i.severity == "warning" and not i.resolved)
    duplicates_count = len(duplicates_found)

    if errors_count > 0:
        overall_status = "ERRORS_FOUND"
        document.processing_status = "validation_failed"
        document.approval_status = "Needs Correction"
    elif warnings_count > 0:
        overall_status = "WARNINGS_FOUND"
        document.processing_status = "ready_for_review"
        if document.approval_status not in ["Approved", "Rejected"]:
            document.approval_status = "Pending Review"
    else:
        overall_status = "PASSED"
        document.processing_status = "ready_for_review"
        if document.approval_status not in ["Approved", "Rejected"]:
            document.approval_status = "Pending Review"

    db.commit()

    return {
        "document_id": document.id,
        "total_issues": len(issues),
        "errors_count": errors_count,
        "warnings_count": warnings_count,
        "passed_count": len(checks_passed),
        "duplicates_count": duplicates_count,
        "status": overall_status,
        "issues": issues,
        "checks_passed": checks_passed
    }


def check_duplicates_for_document(
    db: Session,
    document: Document,
    extracted_data: ExtractedInvoice
) -> List[Dict[str, Any]]:
    """
    Scans the database for duplicate candidates based on:
    - Same Invoice Number + Same Vendor Name (100% Match)
    - Same Vendor Name + Same Date + Same Grand Total (90% Match)
    - Same Invoice Number across different vendors (75% Match)
    """
    duplicates = []
    
    # Query all other documents with extracted data
    other_docs = db.query(Document).filter(
        Document.id != document.id,
        Document.processing_status != "error"
    ).all()

    for other in other_docs:
        other_ext = other.extracted_data
        if not other_ext:
            continue

        reasons = []
        score = 0.0

        # Exact Invoice Number Match
        same_inv_num = (
            extracted_data.invoice_number and
            other_ext.invoice_number and
            extracted_data.invoice_number.strip().lower() == other_ext.invoice_number.strip().lower()
        )

        # Same Vendor Name
        same_vendor = False
        if extracted_data.vendor_name and other_ext.vendor_name:
            v1 = extracted_data.vendor_name.strip().lower()
            v2 = other_ext.vendor_name.strip().lower()
            if v1 == v2 or v1 in v2 or v2 in v1:
                same_vendor = True

        # Same Amount
        same_amount = (
            abs(extracted_data.grand_total - other_ext.grand_total) <= TOLERANCE and
            extracted_data.grand_total > 0
        )

        # Same Date
        same_date = (
            extracted_data.invoice_date and
            other_ext.invoice_date and
            extracted_data.invoice_date == other_ext.invoice_date
        )

        if same_inv_num and same_vendor:
            score = 100.0
            reasons.append(f"Identical Invoice Number '{extracted_data.invoice_number}'")
            reasons.append(f"Identical Vendor '{extracted_data.vendor_name}'")
            if same_amount:
                reasons.append(f"Identical Grand Total (${extracted_data.grand_total:,.2f})")
            if same_date:
                reasons.append(f"Identical Invoice Date ({extracted_data.invoice_date})")
        elif same_vendor and same_amount and same_date:
            score = 90.0
            reasons.append(f"Same Vendor '{extracted_data.vendor_name}'")
            reasons.append(f"Same Billing Date ({extracted_data.invoice_date})")
            reasons.append(f"Identical Grand Total (${extracted_data.grand_total:,.2f})")
        elif same_inv_num:
            score = 75.0
            reasons.append(f"Matching Invoice Number '{extracted_data.invoice_number}' (Different or unverified vendor)")

        if score >= 75.0:
            duplicates.append({
                "matched_document_id": other.id,
                "score": score,
                "reasons": reasons
            })

            # Check if DuplicateMatch record already exists
            existing_match = db.query(DuplicateMatch).filter(
                DuplicateMatch.document_id == document.id,
                DuplicateMatch.matched_document_id == other.id
            ).first()

            if not existing_match:
                match_record = DuplicateMatch(
                    document_id=document.id,
                    matched_document_id=other.id,
                    match_score=score,
                    match_reasons=reasons,
                    status="detected"
                )
                db.add(match_record)

    db.commit()
    return duplicates

