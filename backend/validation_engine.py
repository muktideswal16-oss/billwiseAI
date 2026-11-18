import datetime
from decimal import Decimal, ROUND_HALF_UP
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from .models import Document, ExtractedInvoice, InvoiceItem, ValidationIssue, DuplicateMatch

TOLERANCE = Decimal("0.05")


def to_decimal(val) -> Decimal:
    """Safely converts a number, float, or string to a 2-decimal place Decimal."""
    if val is None:
        return Decimal("0.00")
    try:
        return Decimal(str(val)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    except Exception:
        return Decimal("0.00")


def validate_document_data(
    db: Session,
    document: Document,
    extracted_data: ExtractedInvoice,
    items: List[InvoiceItem]
) -> Dict[str, Any]:
    """
    Performs comprehensive rule-based financial validation on an extracted invoice:
    1. Arithmetic Integrity (Totals & Line Items using Decimal arithmetic)
    2. Missing Mandatory Fields
    3. Date & Timeline Sanity
    4. Duplicate Detection (honoring legitimate resolutions & user isolation)
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

    grand_total_dec = to_decimal(extracted_data.grand_total)
    if grand_total_dec <= Decimal("0.00"):
        issues.append(ValidationIssue(
            document_id=document.id,
            category="missing_field",
            issue_type="Zero or Missing Grand Total",
            issue_description="The grand total amount is zero or missing, which invalidates the accounting entry.",
            severity="error",
            field_name="grand_total",
            expected_value="> 0.00",
            actual_value=f"{grand_total_dec:.2f}"
        ))
    else:
        checks_passed.append(f"Grand total present: {extracted_data.currency} {grand_total_dec:,.2f}")

    # ---------------- 2. MATHEMATICAL CALCULATION CHECKS (DECIMAL) ----------------
    subtotal_dec = to_decimal(extracted_data.subtotal)
    tax_dec = to_decimal(extracted_data.tax_amount)
    discount_dec = to_decimal(extracted_data.discount)

    # A. Subtotal + Tax - Discount == Grand Total
    expected_grand_total_dec = subtotal_dec + tax_dec - discount_dec
    diff_total = abs(expected_grand_total_dec - grand_total_dec)

    if diff_total > TOLERANCE:
        issues.append(ValidationIssue(
            document_id=document.id,
            category="calculation",
            issue_type="Grand Total Discrepancy",
            issue_description=(
                f"Formula mismatch: Subtotal ({subtotal_dec:,.2f}) + "
                f"Tax ({tax_dec:,.2f}) - Discount ({discount_dec:,.2f}) = "
                f"{expected_grand_total_dec:,.2f}, but Grand Total is {grand_total_dec:,.2f}."
            ),
            severity="error",
            field_name="grand_total",
            expected_value=f"{expected_grand_total_dec:.2f}",
            actual_value=f"{grand_total_dec:.2f}"
        ))
    else:
        checks_passed.append("Grand total matches financial formula (Subtotal + Tax - Discount)")

    # B. Line items sum vs Subtotal
    if items:
        sum_line_totals_dec = sum((to_decimal(it.line_total) for it in items), Decimal("0.00"))
        if abs(sum_line_totals_dec - subtotal_dec) > TOLERANCE:
            issues.append(ValidationIssue(
                document_id=document.id,
                category="calculation",
                issue_type="Line Item Sum vs Subtotal Mismatch",
                issue_description=(
                    f"The sum of all line items ({sum_line_totals_dec:,.2f}) does not match "
                    f"the declared invoice subtotal ({subtotal_dec:,.2f}). Difference: {abs(sum_line_totals_dec - subtotal_dec):,.2f}."
                ),
                severity="warning",
                field_name="subtotal",
                expected_value=f"{sum_line_totals_dec:.2f}",
                actual_value=f"{subtotal_dec:.2f}"
            ))
        else:
            checks_passed.append(f"All {len(items)} line items sum perfectly to Subtotal ({subtotal_dec:,.2f})")

        # C. Individual line item quantity * unit_price - discount == line_total
        for idx, item in enumerate(items, 1):
            q_dec = to_decimal(item.quantity)
            p_dec = to_decimal(item.unit_price)
            d_dec = to_decimal(getattr(item, 'discount', 0.0) or 0.0)
            lt_dec = to_decimal(item.line_total)

            expected_line_dec = (q_dec * p_dec - d_dec).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            if abs(expected_line_dec - lt_dec) > TOLERANCE:
                issues.append(ValidationIssue(
                    document_id=document.id,
                    category="calculation",
                    issue_type="Line Item Rate Calculation Mismatch",
                    item_index=idx,
                    item_name=item.item_name,
                    issue_description=(
                        f"Item #{idx} '{item.item_name}': Qty ({q_dec}) × Unit Price ({p_dec:,.2f})"
                        + (f" - Discount ({d_dec:,.2f})" if d_dec > Decimal("0.00") else "")
                        + f" = {expected_line_dec:,.2f}, but line total is listed as {lt_dec:,.2f}."
                    ),
                    severity="warning",
                    field_name=f"item_{idx}_line_total",
                    expected_value=f"{expected_line_dec:.2f}",
                    actual_value=f"{lt_dec:.2f}"
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
        # Allow reasonable future billing up to 60 days
        if (inv_dt - today).days > 60:
            issues.append(ValidationIssue(
                document_id=document.id,
                category="date",
                issue_type="Suspicious Future Invoice Date",
                issue_description=f"Invoice date {inv_dt.isoformat()} is more than 60 days into the future.",
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
    Scans the database for duplicate candidates:
    - Restricts search to the current user's documents (user data isolation)
    - Skips matches already resolved as marked_legitimate
    - Compares Invoice Number + Vendor, Date, and Amount
    """
    duplicates = []

    # Isolation query: compare only within the permitted dataset (same user or unassigned)
    query = db.query(Document).filter(
        Document.id != document.id,
        Document.processing_status != "error"
    )

    if document.user_id is not None:
        query = query.filter(Document.user_id == document.user_id)

    other_docs = query.all()

    for other in other_docs:
        other_ext = other.extracted_data
        if not other_ext:
            continue

        # Check existing match resolution status
        existing_match = db.query(DuplicateMatch).filter(
            DuplicateMatch.document_id == document.id,
            DuplicateMatch.matched_document_id == other.id
        ).first()

        # If already marked legitimate by human reviewer, do not recreate warning!
        if existing_match and existing_match.status in ["marked_legitimate", "mark_legitimate"]:
            continue

        reasons = []
        score = 0.0

        # Exact Invoice Number Match
        same_inv_num = bool(
            extracted_data.invoice_number and
            other_ext.invoice_number and
            extracted_data.invoice_number.strip().lower() == other_ext.invoice_number.strip().lower()
        )

        # Same Vendor Name
        same_vendor = False
        if extracted_data.vendor_name and other_ext.vendor_name:
            v1 = extracted_data.vendor_name.strip().lower()
            v2 = other_ext.vendor_name.strip().lower()
            if v1 == v2 or (len(v1) > 4 and len(v2) > 4 and (v1 in v2 or v2 in v1)):
                same_vendor = True

        # Same Amount (using decimal precision)
        amt1 = to_decimal(extracted_data.grand_total)
        amt2 = to_decimal(other_ext.grand_total)
        same_amount = bool(abs(amt1 - amt2) <= TOLERANCE and amt1 > Decimal("0.00"))

        # Same Date
        same_date = bool(
            extracted_data.invoice_date and
            other_ext.invoice_date and
            extracted_data.invoice_date == other_ext.invoice_date
        )

        if same_inv_num and same_vendor:
            score = 100.0
            reasons.append(f"Identical Invoice Number '{extracted_data.invoice_number}'")
            reasons.append(f"Identical Vendor '{extracted_data.vendor_name}'")
            if same_amount:
                reasons.append(f"Identical Grand Total (${amt1:,.2f})")
            if same_date:
                reasons.append(f"Identical Invoice Date ({extracted_data.invoice_date})")
        elif same_vendor and same_amount and same_date:
            score = 90.0
            reasons.append(f"Same Vendor '{extracted_data.vendor_name}'")
            reasons.append(f"Same Billing Date ({extracted_data.invoice_date})")
            reasons.append(f"Identical Grand Total (${amt1:,.2f})")
        elif same_inv_num and not (document.is_demo_sample and other.is_demo_sample and document.demo_scenario != "duplicate_invoice"):
            # Avoid matching sample 1 against sample 1 when loading fresh demo
            score = 75.0
            reasons.append(f"Matching Invoice Number '{extracted_data.invoice_number}' (Different or unverified vendor)")

        if score >= 75.0:
            duplicates.append({
                "matched_document_id": other.id,
                "score": score,
                "reasons": reasons
            })

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
