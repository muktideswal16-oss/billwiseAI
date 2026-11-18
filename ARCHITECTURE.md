# BillWise AI — System Architecture & Technical Specifications

**Theme:** AI, Automation & Intelligent Systems  
**Domain:** Intelligent Document Processing (IDP) for Small Businesses  
**Revision:** 2.0.0 (Enterprise Hackathon Release)

---

## 1. High-Level System Architecture

BillWise AI utilizes a decoupled client-server architecture built for fast throughput, modular document processing, strict data isolation, and human-in-the-loop validation:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (SPA)                                  │
│   React 19 • Vite • Tailwind CSS v4 • React Router v7 • Recharts • Lucide   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS / JSON / Bearer JWT
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FASTAPI BACKEND REST API                          │
│                                                                             │
│  ┌───────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │ Authentication Module │  │  Upload & Ingestion  │  │ Settings Service │  │
│  │ Bcrypt + Signed JWT   │  │  15MB Max, UUID Safe │  │ User Preferences │  │
│  └───────────────────────┘  └──────────────────────┘  └──────────────────┘  │
│  ┌───────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │  OCR & IDP Pipeline   │  │ Validation Engine    │  │ Export Engine    │  │
│  │  PyPDF2 + Tesseract   │  │ Decimal Precision    │  │ OpenPyXL + CSV   │  │
│  └───────────────────────┘  └──────────────────────┘  └──────────────────┘  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ SQLAlchemy ORM
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATABASE & STORAGE                               │
│     SQLite (Local Hackathon Prototype) / PostgreSQL (Cloud Ready)           │
│     Local Secure Uploads Directory (/backend/uploads)                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Document Processing Pipeline (IDP Flow)

Every document ingested follows a deterministic, 7-stage processing lifecycle:

```
[ Upload File ]
       │
       ▼
1. Security & Validation (Check MIME, ensure extension in PDF/PNG/JPG, enforce <=15MB)
       │
       ▼
2. Ingestion & File Sanitization (UUID generation, path traversal protection, store to disk)
       │
       ▼
3. Text Extraction (PyPDF2 text stream extraction or Tesseract OCR on preprocessed image)
       │
       ▼
4. Structured Field Parsing (Regex & NLP entity extraction: Vendor, Inv#, Dates, Line Items)
       │
       ▼
5. Financial Decimal Validation (Subtotal + Tax - Discount == Grand Total, Duplicate check)
       │
       ▼
6. Human-in-the-Loop Review (Confidence badge display, inline correction, audit log)
       │
       ▼
7. Final Approval & Sanitized Export (Approved records compiled into Excel/CSV)
```

---

## 3. Database Schema & Entity Relationships

The relational data model consists of 8 core tables:

```
┌──────────────┐       1:N       ┌───────────────┐       1:1       ┌───────────────────┐
│    users     ├────────────────►│   documents   ├────────────────►│extracted_invoices │
└──────┬───────┘                 └───────┬───────┘                 └─────────┬─────────┘
       │                                 │                                   │
       │ 1:1                             │ 1:N                               │ 1:N
       ▼                                 ▼                                   ▼
┌──────────────┐                 ┌───────────────┐                 ┌───────────────────┐
│user_settings │                 │validation_    │                 │   invoice_items   │
└──────────────┘                 │    issues     │                 └───────────────────┘
                                 └───────────────┘
                                         │ 1:N
                                         ▼
                                 ┌───────────────┐
                                 │ duplicate_    │
                                 │    matches    │
                                 └───────────────┘
```

### Table Definitions:

1. **`users`**:
   - `id`: Integer (Primary Key)
   - `name`: String (User's legal or professional name)
   - `email`: String (Unique business email)
   - `password_hash`: String (Argon2/Bcrypt salted hash)
   - `business_name`: String
   - `currency`: String (USD, EUR, GBP, INR, etc.)
   - `role`: String (Owner, Finance Director, Reviewer)

2. **`user_settings`**:
   - `id`: Integer (Primary Key)
   - `user_id`: Integer (ForeignKey -> users.id)
   - `ocr_engine`: String (`HYBRID_AI`, `TESSERACT_STRICT`)
   - `confidence_threshold`: Integer (e.g., 85%)
   - `auto_validate`: Boolean
   - `default_export_format`: String (`excel`, `csv`)

3. **`documents`**:
   - `id`: Integer (Primary Key)
   - `user_id`: Integer (ForeignKey -> users.id)
   - `filename`: String (Server-side sanitized UUID filename)
   - `original_name`: String (Original client-provided name)
   - `document_type`: String (`Invoice`, `Receipt`, `Purchase Order`)
   - `file_path`: String (Absolute disk storage path)
   - `file_size`: Integer (bytes)
   - `processing_status`: String (`processing`, `extracted`, `validation_failed`, `ready_for_review`)
   - `approval_status`: String (`Pending Review`, `Needs Correction`, `Approved`, `Rejected`)
   - `is_demo_sample`: Boolean
   - `demo_scenario`: String (`clean_valid`, `incorrect_total`, `duplicate_invoice`)

4. **`extracted_invoices`**:
   - `id`: Integer (Primary Key)
   - `document_id`: Integer (ForeignKey -> documents.id)
   - `vendor_name`, `invoice_number`, `invoice_date`, `due_date`, `purchase_order_number`
   - `subtotal`, `tax_amount`, `discount`, `grand_total`: Float (financial values)
   - `confidence_score`: Float (0.0 to 1.0)
   - `field_confidences`: JSON object mapping fields to individual confidence scores
   - `extraction_method`: String (`PDF_TEXT_EXTRACTION`, `TESSERACT_OCR`, `DEMO_DETERMINISTIC`)

5. **`invoice_items`**:
   - `id`: Integer (Primary Key)
   - `invoice_id`: Integer (ForeignKey -> extracted_invoices.id)
   - `item_name`, `description`: String
   - `quantity`, `unit_price`, `discount`, `tax`, `line_total`: Float
   - `confidence`: Float

6. **`validation_issues`**:
   - `id`: Integer (Primary Key)
   - `document_id`: Integer (ForeignKey -> documents.id)
   - `category`: String (`calculation`, `missing_field`, `date`, `duplicate`)
   - `issue_type`: String (Human-readable title)
   - `severity`: String (`error`, `warning`, `info`)
   - `expected_value`, `actual_value`: String
   - `resolved`: Boolean

7. **`duplicate_matches`**:
   - `id`: Integer (Primary Key)
   - `document_id`: Integer (Subject document)
   - `matched_document_id`: Integer (Colliding document)
   - `match_score`: Float (75.0 to 100.0%)
   - `match_reasons`: JSON Array
   - `status`: String (`detected`, `confirmed_duplicate`, `marked_legitimate`)

8. **`approval_logs`**:
   - `id`: Integer (Primary Key)
   - `document_id`: Integer (ForeignKey -> documents.id)
   - `reviewer_name`: String
   - `action`: String (`Approved`, `Rejected`, `Edited`)
   - `comments`: Text
   - `timestamp`: DateTime

---

## 4. Security Architecture

1. **Password Storage**: Passwords are encrypted using standard `bcrypt` key derivation with 12 rounds of salting. Passwords must be at least 8 characters long.
2. **Authentication Tokens**: Authenticated sessions utilize signed JSON Web Tokens (JWT) containing standard claims (`sub`, `email`, `role`, `exp`, `iat`) signed with a secure secret via HS256.
3. **Frontend Bearer Authorization**: The frontend API client automatically injects the `Authorization: Bearer <token>` header for all API communications.
4. **Data Isolation**: Database queries for documents, extractions, validations, and exports are scoped to the active token's user identity (`user_id`).
5. **Spreadsheet Formula Injection Defense**: All exported text cells in CSV and Excel are sanitized: any cell beginning with `=`, `+`, `-`, `@`, `\t`, or `\r` is automatically prepended with a single apostrophe (`'`).
6. **Upload Boundary Defense**:
   - Rejection of non-whitelisted formats (SVG, HTML, EXE, JS, etc.)
   - Rejection of oversized payloads (> 15 MB)
   - Rejection of empty documents (0 bytes)
   - Filename sanitization using alphanumeric normalization and UUID prefixes.

---

## 5. Validation & Decimal Precision Logic

Financial accounting rules require decimal exactness. Floating point IEEE 754 representations cause inaccuracies (e.g., `0.1 + 0.2 = 0.30000000000000004`).

BillWise AI performs all calculations via Python's `decimal.Decimal` with a `0.05` financial tolerance threshold:

1. **Formula Check**:
   $$\text{Subtotal} + \text{Tax} - \text{Discount} == \text{Grand Total}$$
2. **Line Item Sum Check**:
   $$\sum_{i=1}^{n} (\text{Line Total}_i) == \text{Subtotal}$$
3. **Item Unit Rate Check**:
   $$(\text{Quantity}_i \times \text{Unit Price}_i) - \text{Discount}_i == \text{Line Total}_i$$
4. **Approval Gate**: If any check results in a severity of `error` (`unresolved == True`), the approval endpoint terminates with an `HTTP 400 Bad Request`, preventing incorrect records from reaching production accounting sheets.
