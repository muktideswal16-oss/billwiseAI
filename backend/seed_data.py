import os
import datetime
from sqlalchemy.orm import Session
from .database import Base, engine, SessionLocal
from .models import User, Document, ExtractedInvoice, InvoiceItem, ValidationIssue, DuplicateMatch, ApprovalLog, UserSettings
from .ocr_engine import DEMO_SAMPLES
from .validation_engine import validate_document_data
from .auth import hash_password

# Ensure uploads directory exists
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
SAMPLES_DIR = os.path.join(UPLOAD_DIR, "samples")
os.makedirs(SAMPLES_DIR, exist_ok=True)


def create_invoice_svg(title: str, inv_num: str, vendor: str, date: str, total: str, warning_badge: str = "") -> str:
    """Generates a crisp visual SVG invoice for previewing in the document split-screen."""
    badge_svg = ""
    if warning_badge:
        badge_svg = f"""
        <rect x="420" y="30" width="220" height="32" rx="6" fill="#FF646D" fill-opacity="0.2" stroke="#FF646D" stroke-width="1.5"/>
        <text x="530" y="51" fill="#FF646D" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">{warning_badge}</text>
        """

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 920" width="100%" height="100%">
  <rect width="680" height="920" fill="#0E1411" rx="12"/>
  <rect x="24" y="24" width="632" height="872" fill="#151D19" stroke="#1E2B25" stroke-width="1.5" rx="8"/>
  
  <!-- Header Banner -->
  <path d="M 24 32 Q 24 24 32 24 L 648 24 Q 656 24 656 32 L 656 90 L 24 90 Z" fill="#111915"/>
  <circle cx="65" cy="57" r="18" fill="#20D69A" fill-opacity="0.15" stroke="#20D69A" stroke-width="2"/>
  <text x="65" y="63" fill="#20D69A" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle">BW</text>
  <text x="96" y="63" fill="#F4F7F5" font-family="Arial, sans-serif" font-size="20" font-weight="bold">{vendor}</text>
  
  {badge_svg}

  <!-- Invoice Meta Grid -->
  <rect x="50" y="115" width="580" height="100" rx="6" fill="#18231E" stroke="#22332B"/>
  
  <text x="75" y="145" fill="#929F98" font-family="Arial, sans-serif" font-size="12">DOCUMENT TYPE</text>
  <text x="75" y="170" fill="#20D69A" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Commercial Invoice</text>
  
  <text x="240" y="145" fill="#929F98" font-family="Arial, sans-serif" font-size="12">INVOICE NUMBER</text>
  <text x="240" y="170" fill="#F4F7F5" font-family="Arial, sans-serif" font-size="16" font-weight="bold">{inv_num}</text>

  <text x="430" y="145" fill="#929F98" font-family="Arial, sans-serif" font-size="12">ISSUE DATE</text>
  <text x="430" y="170" fill="#F4F7F5" font-family="Arial, sans-serif" font-size="16">{date}</text>

  <!-- Parties -->
  <text x="50" y="245" fill="#929F98" font-family="Arial, sans-serif" font-size="12" font-weight="bold">ISSUED BY:</text>
  <text x="50" y="270" fill="#F4F7F5" font-family="Arial, sans-serif" font-size="15" font-weight="bold">{vendor}</text>
  <text x="50" y="292" fill="#929F98" font-family="Arial, sans-serif" font-size="13">Technology Park, Innovation District</text>
  <text x="50" y="312" fill="#929F98" font-family="Arial, sans-serif" font-size="13">Tax ID: US-EIN-94-2819034</text>

  <text x="360" y="245" fill="#929F98" font-family="Arial, sans-serif" font-size="12" font-weight="bold">BILLED TO:</text>
  <text x="360" y="270" fill="#F4F7F5" font-family="Arial, sans-serif" font-size="15" font-weight="bold">Nova Retail Logistics LLC</text>
  <text x="360" y="292" fill="#929F98" font-family="Arial, sans-serif" font-size="13">742 Evergreen Terrace, Suite 400</text>
  <text x="360" y="312" fill="#929F98" font-family="Arial, sans-serif" font-size="13">Accounts Payable Dept</text>

  <!-- Table Header -->
  <rect x="50" y="350" width="580" height="38" rx="4" fill="#1D2B24"/>
  <text x="65" y="374" fill="#8AF0C7" font-family="Arial, sans-serif" font-size="12" font-weight="bold">DESCRIPTION</text>
  <text x="380" y="374" fill="#8AF0C7" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">QTY</text>
  <text x="470" y="374" fill="#8AF0C7" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">UNIT RATE</text>
  <text x="600" y="374" fill="#8AF0C7" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="end">AMOUNT</text>

  <!-- Line Item 1 -->
  <text x="65" y="420" fill="#F4F7F5" font-family="Arial, sans-serif" font-size="13" font-weight="bold">Dedicated Cloud Infrastructure Cluster</text>
  <text x="65" y="438" fill="#929F98" font-family="Arial, sans-serif" font-size="11">Production 32 vCPU compute node monthly billing</text>
  <text x="380" y="425" fill="#F4F7F5" font-family="Arial, sans-serif" font-size="13" text-anchor="middle">1</text>
  <text x="470" y="425" fill="#F4F7F5" font-family="Arial, sans-serif" font-size="13" text-anchor="middle">$1,450.00</text>
  <text x="600" y="425" fill="#F4F7F5" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="end">$1,450.00</text>
  <line x1="50" y1="455" x2="630" y2="455" stroke="#1D2B24" stroke-width="1"/>

  <!-- Line Item 2 -->
  <text x="65" y="485" fill="#F4F7F5" font-family="Arial, sans-serif" font-size="13" font-weight="bold">AI Inference API Gateway Tier 2</text>
  <text x="65" y="503" fill="#929F98" font-family="Arial, sans-serif" font-size="11">High throughput model processing endpoints</text>
  <text x="380" y="490" fill="#F4F7F5" font-family="Arial, sans-serif" font-size="13" text-anchor="middle">2</text>
  <text x="470" y="490" fill="#F4F7F5" font-family="Arial, sans-serif" font-size="13" text-anchor="middle">$350.00</text>
  <text x="600" y="490" fill="#F4F7F5" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="end">$700.00</text>
  <line x1="50" y1="520" x2="630" y2="520" stroke="#1D2B24" stroke-width="1"/>

  <!-- Line Item 3 -->
  <text x="65" y="550" fill="#F4F7F5" font-family="Arial, sans-serif" font-size="13" font-weight="bold">Enterprise SLA Priority Support</text>
  <text x="65" y="568" fill="#929F98" font-family="Arial, sans-serif" font-size="11">24/7 dedicated engineering response channel</text>
  <text x="380" y="555" fill="#F4F7F5" font-family="Arial, sans-serif" font-size="13" text-anchor="middle">1</text>
  <text x="470" y="555" fill="#F4F7F5" font-family="Arial, sans-serif" font-size="13" text-anchor="middle">$300.00</text>
  <text x="600" y="555" fill="#F4F7F5" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="end">$300.00</text>
  <line x1="50" y1="585" x2="630" y2="585" stroke="#1D2B24" stroke-width="1"/>

  <!-- Calculation Summary Box -->
  <rect x="360" y="620" width="270" height="180" rx="8" fill="#18231E" stroke="#22332B"/>
  
  <text x="380" y="650" fill="#929F98" font-family="Arial, sans-serif" font-size="13">Subtotal:</text>
  <text x="610" y="650" fill="#F4F7F5" font-family="Arial, sans-serif" font-size="13" text-anchor="end">$2,450.00</text>

  <text x="380" y="680" fill="#929F98" font-family="Arial, sans-serif" font-size="13">Tax (10%):</text>
  <text x="610" y="680" fill="#F4F7F5" font-family="Arial, sans-serif" font-size="13" text-anchor="end">$245.00</text>

  <text x="380" y="710" fill="#929F98" font-family="Arial, sans-serif" font-size="13">Special Discount:</text>
  <text x="610" y="710" fill="#20D69A" font-family="Arial, sans-serif" font-size="13" text-anchor="end">-$100.00</text>

  <line x1="380" y1="730" x2="610" y2="730" stroke="#22332B" stroke-width="1"/>

  <text x="380" y="765" fill="#F4F7F5" font-family="Arial, sans-serif" font-size="15" font-weight="bold">Grand Total:</text>
  <text x="610" y="765" fill="#20D69A" font-family="Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="end">{total}</text>

  <!-- Footer security verification stamp -->
  <rect x="50" y="820" width="580" height="50" rx="6" fill="#111915" stroke="#1D2B24"/>
  <circle cx="75" cy="845" r="10" fill="#20D69A" fill-opacity="0.2"/>
  <circle cx="75" cy="845" r="4" fill="#20D69A"/>
  <text x="96" y="842" fill="#F4F7F5" font-family="Arial, sans-serif" font-size="12" font-weight="bold">BillWise Intelligent Verification Stamp</text>
  <text x="96" y="857" fill="#929F98" font-family="Arial, sans-serif" font-size="10">OCR Checksum SHA256-verified • Digitally audited document</text>
</svg>"""
    return svg


def write_sample_files():
    """Generates the 3 sample files on disk so they can be previewed or downloaded."""
    s1_path = os.path.join(SAMPLES_DIR, "sample_1_apex_valid.svg")
    s2_path = os.path.join(SAMPLES_DIR, "sample_2_vanguard_error.svg")
    s3_path = os.path.join(SAMPLES_DIR, "sample_3_apex_duplicate.svg")

    with open(s1_path, "w", encoding="utf-8") as f:
        f.write(create_invoice_svg(
            title="Clean Balanced Invoice",
            inv_num="INV-2024-0891",
            vendor="Apex Cloud & Software Solutions",
            date="2024-11-05",
            total="$2,595.00 USD"
        ))

    with open(s2_path, "w", encoding="utf-8") as f:
        f.write(create_invoice_svg(
            title="Calculation Discrepancy Sample",
            inv_num="INV-2024-7742",
            vendor="Vanguard Logistics & Office Supplies",
            date="2024-11-10",
            total="$1,022.00 USD",
            warning_badge="CALCULATION MISMATCH"
        ))

    with open(s3_path, "w", encoding="utf-8") as f:
        f.write(create_invoice_svg(
            title="Duplicate Submission Sample",
            inv_num="INV-2024-0891",
            vendor="Apex Cloud & Software Solutions",
            date="2024-11-05",
            total="$2,595.00 USD",
            warning_badge="DUPLICATE INVOICE"
        ))

    return s1_path, s2_path, s3_path


def seed_database():
    """Seeds the database with initial user, sample invoices, and historical records."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        existing_user = db.query(User).filter(User.email == "demo@billwise.ai").first()
        if existing_user:
            return

        print("Seeding BillWise AI database with demo records...")
        s1_file, s2_file, s3_file = write_sample_files()

        # 1. Create Default Demo User with secure bcrypt password
        user = User(
            name="Alex Rivera",
            email="demo@billwise.ai",
            password_hash=hash_password("demo1234"),
            business_name="Nova Retail Logistics",
            currency="USD",
            role="Finance Director"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Create persistent demo UserSettings
        settings = UserSettings(
            user_id=user.id,
            name="Alex Rivera",
            business_name="Nova Retail Logistics",
            tax_id="US-EIN-94-2819034",
            currency="USD",
            ocr_engine="HYBRID_AI",
            confidence_threshold=85,
            auto_validate=True,
            default_export_format="excel"
        )
        db.add(settings)
        db.commit()

        # 2. Add Pre-existing Approved Records for Analytics & Realistic Dashboard
        historical_records = [
            {
                "vendor": "Stripe Payments Inc",
                "inv_num": "STR-2024-1029",
                "date": "2024-10-15",
                "amount": 420.50,
                "type": "Receipt",
                "status": "Approved"
            },
            {
                "vendor": "Amazon Web Services",
                "inv_num": "AWS-8829103",
                "date": "2024-10-28",
                "amount": 1845.20,
                "type": "Invoice",
                "status": "Approved"
            },
            {
                "vendor": "OfficeMax Global Supplies",
                "inv_num": "OMX-99201",
                "date": "2024-11-01",
                "amount": 310.00,
                "type": "Purchase Order",
                "status": "Approved"
            },
            {
                "vendor": "Twilio Telecommunications",
                "inv_num": "TW-448102",
                "date": "2024-11-02",
                "amount": 195.40,
                "type": "Invoice",
                "status": "Approved"
            }
        ]

        for h in historical_records:
            doc = Document(
                user_id=user.id,
                filename=f"{h['inv_num']}.pdf",
                original_name=f"{h['vendor']} - {h['inv_num']}.pdf",
                document_type=h["type"],
                file_path=os.path.join(UPLOAD_DIR, f"{h['inv_num']}.pdf"),
                preview_url=f"/api/documents/preview/{h['inv_num']}",
                file_size=142800,
                processing_status="extracted",
                approval_status=h["status"],
                upload_date=datetime.datetime.strptime(h["date"], "%Y-%m-%d")
            )
            db.add(doc)
            db.commit()
            db.refresh(doc)

            ext = ExtractedInvoice(
                document_id=doc.id,
                vendor_name=h["vendor"],
                invoice_number=h["inv_num"],
                invoice_date=h["date"],
                due_date=(datetime.datetime.strptime(h["date"], "%Y-%m-%d") + datetime.timedelta(days=30)).strftime("%Y-%m-%d"),
                subtotal=round(h["amount"] * 0.9, 2),
                tax_amount=round(h["amount"] * 0.1, 2),
                discount=0.0,
                grand_total=h["amount"],
                currency="USD",
                confidence_score=0.97,
                field_confidences={"vendor_name": 0.99, "grand_total": 0.98, "invoice_number": 0.96},
                extraction_method="AI_OCR_ENGINE"
            )
            db.add(ext)
            db.commit()
            db.refresh(ext)

            item = InvoiceItem(
                invoice_id=ext.id,
                item_name=f"{h['type']} Services - {h['vendor']}",
                description="Standard operational recurring account billing",
                quantity=1.0,
                unit_price=round(h["amount"] * 0.9, 2),
                tax=round(h["amount"] * 0.1, 2),
                line_total=round(h["amount"] * 0.9, 2),
                confidence=0.96
            )
            db.add(item)

            log = ApprovalLog(
                document_id=doc.id,
                reviewer_name="Alex Rivera",
                action="Approved",
                comments="Pre-approved standard business operating expense",
                timestamp=doc.upload_date + datetime.timedelta(hours=2)
            )
            db.add(log)
            db.commit()

        # 3. Seed Sample 1: Apex Cloud (Clean Valid)
        doc1 = Document(
            user_id=user.id,
            filename="sample_1_apex_valid.svg",
            original_name="Apex_Cloud_Solutions_INV-2024-0891.pdf",
            document_type="Invoice",
            file_path=s1_file,
            preview_url="/uploads/samples/sample_1_apex_valid.svg",
            file_size=248500,
            mime_type="image/svg+xml",
            processing_status="ready_for_review",
            approval_status="Pending Review",
            is_demo_sample=True,
            demo_scenario="clean_valid",
            notes="Demo Sample 1: Clean, balanced invoice with 10% tax and $100 discount"
        )
        db.add(doc1)
        db.commit()
        db.refresh(doc1)

        s1_data = DEMO_SAMPLES["clean_valid"]
        ext1 = ExtractedInvoice(
            document_id=doc1.id,
            vendor_name=s1_data["vendor_name"],
            vendor_address=s1_data["vendor_address"],
            vendor_phone=s1_data["vendor_phone"],
            vendor_tax_id=s1_data["vendor_tax_id"],
            invoice_number=s1_data["invoice_number"],
            invoice_date=s1_data["invoice_date"],
            due_date=s1_data["due_date"],
            purchase_order_number=s1_data["purchase_order_number"],
            payment_terms=s1_data["payment_terms"],
            subtotal=s1_data["subtotal"],
            tax_amount=s1_data["tax_amount"],
            discount=s1_data["discount"],
            grand_total=s1_data["grand_total"],
            currency=s1_data["currency"],
            confidence_score=s1_data["confidence_score"],
            field_confidences=s1_data["field_confidences"],
            raw_ocr_text=s1_data["raw_ocr_text"],
            extraction_method="DEMO_DETERMINISTIC"
        )
        db.add(ext1)
        db.commit()
        db.refresh(ext1)

        items1 = []
        for item_dict in s1_data["items"]:
            clean_item = dict(item_dict)
            clean_item.setdefault("discount", 0.0)
            item = InvoiceItem(invoice_id=ext1.id, **clean_item)
            db.add(item)
            items1.append(item)
        db.commit()

        # Run validation on Sample 1
        validate_document_data(db, doc1, ext1, items1)

        # 4. Seed Sample 2: Vanguard Logistics (Incorrect Total Error)
        doc2 = Document(
            user_id=user.id,
            filename="sample_2_vanguard_error.svg",
            original_name="Vanguard_Supplies_INV-2024-7742.pdf",
            document_type="Invoice",
            file_path=s2_file,
            preview_url="/uploads/samples/sample_2_vanguard_error.svg",
            file_size=194200,
            mime_type="image/svg+xml",
            processing_status="validation_failed",
            approval_status="Needs Correction",
            is_demo_sample=True,
            demo_scenario="incorrect_total",
            notes="Demo Sample 2: Item sum is $850.00 but invoice recorded subtotal $950.00!"
        )
        db.add(doc2)
        db.commit()
        db.refresh(doc2)

        s2_data = DEMO_SAMPLES["incorrect_total"]
        ext2 = ExtractedInvoice(
            document_id=doc2.id,
            vendor_name=s2_data["vendor_name"],
            vendor_address=s2_data["vendor_address"],
            vendor_phone=s2_data["vendor_phone"],
            vendor_tax_id=s2_data["vendor_tax_id"],
            invoice_number=s2_data["invoice_number"],
            invoice_date=s2_data["invoice_date"],
            due_date=s2_data["due_date"],
            purchase_order_number=s2_data["purchase_order_number"],
            payment_terms=s2_data["payment_terms"],
            subtotal=s2_data["subtotal"],
            tax_amount=s2_data["tax_amount"],
            discount=s2_data["discount"],
            grand_total=s2_data["grand_total"],
            currency=s2_data["currency"],
            confidence_score=s2_data["confidence_score"],
            field_confidences=s2_data["field_confidences"],
            raw_ocr_text=s2_data["raw_ocr_text"],
            extraction_method="DEMO_DETERMINISTIC"
        )
        db.add(ext2)
        db.commit()
        db.refresh(ext2)

        items2 = []
        for item_dict in s2_data["items"]:
            clean_item = dict(item_dict)
            clean_item.setdefault("discount", 0.0)
            item = InvoiceItem(invoice_id=ext2.id, **clean_item)
            db.add(item)
            items2.append(item)
        db.commit()

        # Run validation on Sample 2 to trigger mathematical discrepancy warnings
        validate_document_data(db, doc2, ext2, items2)

        # 5. Seed Sample 3: Apex Cloud (Duplicate Invoice)
        doc3 = Document(
            user_id=user.id,
            filename="sample_3_apex_duplicate.svg",
            original_name="Apex_Cloud_INV-2024-0891_Duplicate.pdf",
            document_type="Invoice",
            file_path=s3_file,
            preview_url="/uploads/samples/sample_3_apex_duplicate.svg",
            file_size=248500,
            mime_type="image/svg+xml",
            processing_status="validation_failed",
            approval_status="Needs Correction",
            is_demo_sample=True,
            demo_scenario="duplicate_invoice",
            notes="Demo Sample 3: Duplicate submission of INV-2024-0891"
        )
        db.add(doc3)
        db.commit()
        db.refresh(doc3)

        s3_data = DEMO_SAMPLES["duplicate_invoice"]
        ext3 = ExtractedInvoice(
            document_id=doc3.id,
            vendor_name=s3_data["vendor_name"],
            vendor_address=s3_data["vendor_address"],
            vendor_phone=s3_data["vendor_phone"],
            vendor_tax_id=s3_data["vendor_tax_id"],
            invoice_number=s3_data["invoice_number"],
            invoice_date=s3_data["invoice_date"],
            due_date=s3_data["due_date"],
            purchase_order_number=s3_data["purchase_order_number"],
            payment_terms=s3_data["payment_terms"],
            subtotal=s3_data["subtotal"],
            tax_amount=s3_data["tax_amount"],
            discount=s3_data["discount"],
            grand_total=s3_data["grand_total"],
            currency=s3_data["currency"],
            confidence_score=s3_data["confidence_score"],
            field_confidences=s3_data["field_confidences"],
            raw_ocr_text=s3_data["raw_ocr_text"],
            extraction_method="DEMO_DETERMINISTIC"
        )
        db.add(ext3)
        db.commit()
        db.refresh(ext3)

        items3 = []
        for item_dict in s3_data["items"]:
            clean_item = dict(item_dict)
            clean_item.setdefault("discount", 0.0)
            item = InvoiceItem(invoice_id=ext3.id, **clean_item)
            db.add(item)
            items3.append(item)
        db.commit()

        # Run validation on Sample 3 to trigger Duplicate detection against doc1
        validate_document_data(db, doc3, ext3, items3)

        print("Database seeded successfully with users, historical records, and 3 test scenarios!")

    finally:
        db.close()

