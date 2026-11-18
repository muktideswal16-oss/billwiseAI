from typing import List, Optional, Dict, Any
from pydantic import BaseModel, field_validator
import datetime

# ----------------- User Schemas -----------------
class UserBase(BaseModel):
    name: str
    email: str
    business_name: Optional[str] = "Acme Corp"
    currency: Optional[str] = "USD"
    role: Optional[str] = "Owner"

class UserCreate(UserBase):
    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class AuthToken(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ----------------- Item Schemas -----------------
class InvoiceItemBase(BaseModel):
    item_name: str
    description: Optional[str] = None
    quantity: float = 1.0
    unit_price: float = 0.0
    discount: float = 0.0
    tax: float = 0.0
    line_total: float = 0.0
    confidence: float = 0.95

class InvoiceItemCreate(InvoiceItemBase):
    pass

class InvoiceItemResponse(InvoiceItemBase):
    id: int
    invoice_id: int

    class Config:
        from_attributes = True

# ----------------- Extracted Invoice Schemas -----------------
class ExtractedInvoiceBase(BaseModel):
    vendor_name: Optional[str] = None
    vendor_address: Optional[str] = None
    vendor_phone: Optional[str] = None
    vendor_tax_id: Optional[str] = None
    invoice_number: Optional[str] = None
    invoice_date: Optional[str] = None
    due_date: Optional[str] = None
    purchase_order_number: Optional[str] = None
    payment_terms: Optional[str] = "Net 30"
    subtotal: float = 0.0
    tax_amount: float = 0.0
    discount: float = 0.0
    grand_total: float = 0.0
    currency: str = "USD"
    confidence_score: float = 0.90
    field_confidences: Dict[str, float] = {}
    raw_ocr_text: Optional[str] = None
    extraction_method: str = "AI_OCR_ENGINE"

class ExtractedInvoiceUpdate(BaseModel):
    vendor_name: Optional[str] = None
    vendor_address: Optional[str] = None
    vendor_phone: Optional[str] = None
    vendor_tax_id: Optional[str] = None
    invoice_number: Optional[str] = None
    invoice_date: Optional[str] = None
    due_date: Optional[str] = None
    purchase_order_number: Optional[str] = None
    payment_terms: Optional[str] = None
    subtotal: Optional[float] = None
    tax_amount: Optional[float] = None
    discount: Optional[float] = None
    grand_total: Optional[float] = None
    currency: Optional[str] = None
    items: Optional[List[InvoiceItemBase]] = None

class ExtractedInvoiceResponse(ExtractedInvoiceBase):
    id: int
    document_id: int
    items: List[InvoiceItemResponse] = []

    class Config:
        from_attributes = True

# ----------------- Validation Issue Schemas -----------------
class ValidationIssueResponse(BaseModel):
    id: int
    document_id: int
    category: str
    issue_type: str
    issue_description: str
    severity: str
    field_name: Optional[str] = None
    item_index: Optional[int] = None
    item_name: Optional[str] = None
    expected_value: Optional[str] = None
    actual_value: Optional[str] = None
    resolved: bool = False
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ValidationSummaryResponse(BaseModel):
    document_id: int
    total_issues: int
    errors_count: int
    warnings_count: int
    passed_count: int
    duplicates_count: int
    status: str # "PASSED", "WARNINGS_FOUND", "ERRORS_FOUND"
    issues: List[ValidationIssueResponse] = []
    checks_passed: List[str] = []

# ----------------- Document Schemas -----------------
class DocumentBase(BaseModel):
    filename: str
    original_name: str
    document_type: str = "Invoice"
    file_path: str
    preview_url: Optional[str] = None
    file_size: int = 0
    mime_type: str = "application/pdf"
    processing_status: str = "uploaded"
    approval_status: str = "Pending Review"
    notes: Optional[str] = None
    is_demo_sample: bool = False
    demo_scenario: Optional[str] = None

class DocumentResponse(DocumentBase):
    id: int
    user_id: Optional[int] = None
    upload_date: datetime.datetime
    extracted_data: Optional[ExtractedInvoiceResponse] = None
    validation_issues: List[ValidationIssueResponse] = []

    class Config:
        from_attributes = True

# ----------------- Duplicate Schemas -----------------
class DuplicateMatchResponse(BaseModel):
    id: int
    document_id: int
    matched_document_id: int
    match_score: float
    match_reasons: List[str]
    status: str
    created_at: datetime.datetime
    current_doc: Optional[DocumentResponse] = None
    matched_doc: Optional[DocumentResponse] = None

    class Config:
        from_attributes = True

class DuplicateResolutionRequest(BaseModel):
    resolution: str # "mark_legitimate" or "confirm_duplicate"
    notes: Optional[str] = None

# ----------------- Approval Schemas -----------------
class ApprovalRequest(BaseModel):
    action: str # "Approved" or "Rejected"
    comments: Optional[str] = None
    reviewer_name: Optional[str] = "Owner"

class ApprovalLogResponse(BaseModel):
    id: int
    document_id: int
    reviewer_name: str
    action: str
    comments: Optional[str] = None
    timestamp: datetime.datetime

    class Config:
        from_attributes = True

# ----------------- Analytics Schemas -----------------
class AnalyticsOverviewResponse(BaseModel):
    total_documents: int
    total_invoiced_value: float
    successfully_validated: int
    pending_review: int
    issues_detected: int
    approved_documents: int
    rejected_documents: int
    duplicate_count: int
    monthly_activity: List[Dict[str, Any]]
    spending_by_vendor: List[Dict[str, Any]]
    status_distribution: List[Dict[str, Any]]
    type_distribution: List[Dict[str, Any]]

# ----------------- Settings Schemas -----------------
class UserSettingsBase(BaseModel):
    name: Optional[str] = "Alex Rivera"
    email: Optional[str] = None
    business_name: Optional[str] = "Nova Retail Logistics"
    tax_id: Optional[str] = "US-EIN-94-2819034"
    currency: Optional[str] = "USD"
    ocr_engine: Optional[str] = "HYBRID_AI"
    confidence_threshold: Optional[int] = 85
    auto_validate: Optional[bool] = True
    default_export_format: Optional[str] = "excel"

class UserSettingsUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    business_name: Optional[str] = None
    tax_id: Optional[str] = None
    currency: Optional[str] = None
    ocr_engine: Optional[str] = None
    confidence_threshold: Optional[int] = None
    auto_validate: Optional[bool] = None
    default_export_format: Optional[str] = None

class UserSettingsResponse(UserSettingsBase):
    id: int
    user_id: int
    updated_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True


