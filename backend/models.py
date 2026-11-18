import datetime
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text, JSON
)
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    business_name = Column(String(200), default="Acme Corp")
    currency = Column(String(10), default="USD")
    role = Column(String(50), default="Owner")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    filename = Column(String(255), nullable=False)
    original_name = Column(String(255), nullable=False)
    document_type = Column(String(50), default="Invoice") # Invoice, Receipt, Purchase Order
    file_path = Column(String(500), nullable=False)
    preview_url = Column(String(500), nullable=True)
    file_size = Column(Integer, default=0) # in bytes
    mime_type = Column(String(100), default="application/pdf")
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Statuses
    # processing_status: "uploaded", "processing", "extracted", "validation_failed", "ready_for_review", "error"
    processing_status = Column(String(50), default="uploaded")
    # approval_status: "Pending Review", "Needs Correction", "Approved", "Rejected"
    approval_status = Column(String(50), default="Pending Review")
    
    notes = Column(Text, nullable=True)
    is_demo_sample = Column(Boolean, default=False)
    demo_scenario = Column(String(50), nullable=True) # "clean_valid", "incorrect_total", "duplicate_invoice"

    user = relationship("User", back_populates="documents")
    extracted_data = relationship("ExtractedInvoice", back_populates="document", uselist=False, cascade="all, delete-orphan")
    validation_issues = relationship("ValidationIssue", back_populates="document", cascade="all, delete-orphan")
    approval_logs = relationship("ApprovalLog", back_populates="document", cascade="all, delete-orphan")


class ExtractedInvoice(Base):
    __tablename__ = "extracted_invoices"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, unique=True)
    
    # Header Info
    vendor_name = Column(String(255), nullable=True)
    vendor_address = Column(String(500), nullable=True)
    vendor_phone = Column(String(100), nullable=True)
    vendor_tax_id = Column(String(100), nullable=True)
    invoice_number = Column(String(100), nullable=True, index=True)
    invoice_date = Column(String(50), nullable=True)
    due_date = Column(String(50), nullable=True)
    purchase_order_number = Column(String(100), nullable=True)
    payment_terms = Column(String(100), default="Net 30")

    # Financial Information
    subtotal = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    grand_total = Column(Float, default=0.0)
    currency = Column(String(10), default="USD")

    # OCR / Extraction Metadata
    confidence_score = Column(Float, default=0.92) # 0.0 - 1.0 overall score
    field_confidences = Column(JSON, default=dict) # {"vendor_name": 0.98, "grand_total": 0.95, ...}
    raw_ocr_text = Column(Text, nullable=True)
    extraction_method = Column(String(100), default="AI_OCR_ENGINE") # "TESSERACT_OCR", "PYPDF_TEXT", "DEMO_DETERMINISTIC"

    document = relationship("Document", back_populates="extracted_data")
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")


class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("extracted_invoices.id"), nullable=False)
    
    item_name = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)
    quantity = Column(Float, default=1.0)
    unit_price = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    tax = Column(Float, default=0.0)
    line_total = Column(Float, default=0.0)
    confidence = Column(Float, default=0.95)

    invoice = relationship("ExtractedInvoice", back_populates="items")


class ValidationIssue(Base):
    __tablename__ = "validation_issues"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    
    category = Column(String(50), default="calculation") # calculation, missing_field, date, duplicate, data_consistency
    issue_type = Column(String(100), nullable=False)
    issue_description = Column(Text, nullable=False)
    severity = Column(String(20), default="warning") # error, warning, info
    field_name = Column(String(100), nullable=True)
    item_index = Column(Integer, nullable=True) # e.g. line item #1..50
    item_name = Column(String(255), nullable=True) # e.g. "Men's Cotton Casual Shirt - White / M"
    expected_value = Column(String(100), nullable=True)
    actual_value = Column(String(100), nullable=True)
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    document = relationship("Document", back_populates="validation_issues")


class DuplicateMatch(Base):
    __tablename__ = "duplicate_matches"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    matched_document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    
    match_score = Column(Float, default=100.0) # Percentage 0 - 100
    match_reasons = Column(JSON, default=list) # ["Matching Invoice Number", "Matching Vendor Name", ...]
    status = Column(String(50), default="detected") # detected, confirmed_duplicate, marked_legitimate
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class ApprovalLog(Base):
    __tablename__ = "approval_logs"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    reviewer_name = Column(String(120), default="Owner (Demo)")
    action = Column(String(50), nullable=False) # "Approved", "Rejected", "Edited", "Re-validated"
    comments = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    document = relationship("Document", back_populates="approval_logs")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=True)
    entity_id = Column(Integer, nullable=True)
    details = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    name = Column(String(120), default="Alex Rivera")
    business_name = Column(String(200), default="Nova Retail Logistics")
    tax_id = Column(String(100), default="US-EIN-94-2819034")
    currency = Column(String(10), default="USD")
    ocr_engine = Column(String(50), default="HYBRID_AI")
    confidence_threshold = Column(Integer, default=85)
    auto_validate = Column(Boolean, default=True)
    default_export_format = Column(String(20), default="excel")
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="settings")


