# BillWise AI — Intelligent Document Processing Platform

> **Turn invoices, receipts, and purchase orders into clean, checked, and export-ready business records.**

BillWise AI is a full-stack, enterprise-grade Intelligent Document Processing (IDP) platform designed for small business owners, retail operators, shopkeepers, and accounting teams who manually enter financial documents into spreadsheets.

Built for the Hackathon theme: **AI, Automation & Intelligent Systems**  
Problem Statement: **Intelligent Document Processing for Small Businesses**

---

## 1. Product Vision & Core Architecture

Small businesses spend hours each week manually typing invoice details into spreadsheets. Manual data entry introduces three critical problems:
1. **Arithmetic Errors**: Incorrect subtotals, wrong tax rates, and unbalanced grand totals.
2. **Missing Metadata**: Incomplete invoice identifiers, unparsed dates, and missing tax IDs.
3. **Duplicate Invoices**: Paying the same invoice twice due to uncoordinated submissions.

BillWise AI communicates three core values:
- **Intelligence**: Native OCR text rastering and structured field extraction that identifies vendors, dates, line items, and totals with field-level confidence scoring.
- **Accuracy**: Python `Decimal` financial validation checking formulas (`Subtotal + Tax - Discount = Grand Total`), line-item reconciliations, timeline sanity, and duplicate detection.
- **Control**: Human-in-the-loop review. Records require explicit human sign-off before being finalized and exported to formatted Excel and CSV files.

---

## 2. Technology Stack

### Frontend
- **React.js 19** with **Vite 8**
- **Tailwind CSS v4** (Custom Emerald Fintech SaaS Design System)
- **Lucide React** for enterprise interface icons
- **Recharts** for monthly throughput and vendor spending data visualizations
- **React Router v7** with authenticated `ProtectedRoute` route guards
- **Canvas-Confetti** for approval celebration micro-interactions

### Backend
- **Python 3.14 / 3.10+** with **FastAPI**
- **Bcrypt & PyJWT** for password hashing and signed RFC 7519 JWT access tokens
- **SQLAlchemy ORM** with **SQLite** (compatible with PostgreSQL)
- **Pandas** for tabular dataset transformation and flat CSV generation
- **OpenPyXL** for formatted, styled Excel (`.xlsx`) workbooks with emerald headers
- **Pillow (PIL)** for contrast enhancement, noise sharpening, and image binarization
- **Tesseract OCR & PyPDF2** for native text recognition with structured pattern fallbacks

---

## 3. Design System — Emerald Fintech SaaS

- **Main Background**: `#080B0A`
- **Secondary Background**: `#101613`
- **Card Background**: `#151D19`
- **Primary Emerald**: `#20D69A`
- **Secondary Mint**: `#8AF0C7`
- **Main Text**: `#F4F7F5`
- **Muted Text**: `#929F98`
- **Warning**: `#F4B942`
- **Error**: `#FF646D`
- **Success**: `#20D69A`

---

## 4. Security & Data Integrity Features

1. **Bcrypt Password Encryption**: Salted bcrypt hashing with 12 rounds of key derivation. Minimum 8-character password enforcement.
2. **Cryptographic JWT Tokens**: Signed tokens using HS256 with user identity claims and expiration checks.
3. **User-Level Data Isolation**: Authenticated requests are scoped to the active token's `user_id`. One business cannot view, edit, approve, or export another business's invoices.
4. **Spreadsheet Formula Injection Defense**: All exported cells in CSV and Excel are sanitized against DDE/formula attacks by prefixing strings starting with `=`, `+`, `-`, `@`, `\t`, or `\r` with a single apostrophe (`'`).
5. **Upload Boundary Defense**: Strict 15 MB payload streaming limit, whitelisted extensions (`.pdf`, `.png`, `.jpg`, `.jpeg`), and rejection of dangerous SVG/executable payloads.
6. **Decimal Precision**: Financial calculations use Python's `decimal.Decimal` with 2-decimal half-up rounding, eliminating floating-point arithmetic errors.

---

## 5. Quick Start (Windows PowerShell)

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)

### Step 1: Clone & Configure Environment
```powershell
# Navigate to repository root
cd c:\Users\varun\OneDrive\Desktop\billwiseAI

# Copy environment template
Copy-Item .env.example .env
```

### Step 2: Install Dependencies
```powershell
# Install backend Python dependencies
python -m pip install -r requirements.txt

# Install frontend Node dependencies
cd frontend
npm install
cd ..
```

### Step 3: Run the Application

Open two PowerShell terminal windows:

**Terminal 1 — Backend API Server:**
```powershell
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
- API Base URL: `http://127.0.0.1:8000`
- Interactive OpenAPI Documentation: `http://127.0.0.1:8000/docs`

**Terminal 2 — Frontend Dev Server:**
```powershell
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
- Web Application: `http://127.0.0.1:5173`

---

## 6. Running Automated Tests

Execute the comprehensive 26-module test suite covering security, OCR accuracy, duplicate resolution, financial decimals, and export generation:

```powershell
python backend/test_suite.py
```

Expected output:
```text
======================================================================
   BILLWISE AI — COMPREHENSIVE AUTOMATED QA TEST SUITE
======================================================================
✓ [1/26] User Registration: Success
✓ [2/26] Valid Login: Authenticated and issued genuine signed JWT
...
✓ [26/26] Settings Persistence: GET/PUT /api/settings persisted to database
======================================================================
🎉 ALL 26/26 COMPREHENSIVE QA TEST MODULES PASSED SUCCESSFULLY!
======================================================================
```

To run the frontend production build audit:
```powershell
cd frontend
npm run build
```

---

## 7. 3-Minute Hackathon Live Demonstration Flow

For live judging and evaluations:

1. **Instant Demo Login**: Go to `http://localhost:5173/login` and click **"Launch Instant Demo Mode"**.
2. **Executive Dashboard**: Inspect live metrics, throughput charts, and vendor breakdowns at `/dashboard`.
3. **Scenario 1 (Clean Valid)**: In `/upload`, load **"Clean Valid Invoice"**. View split-screen extraction at `/extraction/:id`, click **"Run Automated Validation"** (all 7 checks pass), and approve the document.
4. **Scenario 2 (Calculation Error)**: In `/upload`, load **"Calculation Error Sample"**. Notice the math error ($850 item sum vs $950 subtotal) and blocked approval. Correct the subtotal to 850, and watch the status flip to PASSED.
5. **Scenario 3 (Duplicate Invoice)**: In `/upload`, load **"Duplicate Invoice Sample"**. Inspect the collision in `/duplicates` and resolve it by clicking **"Mark as Legitimate"**.
6. **Export**: Go to `/export`, choose Excel (`.xlsx`) or CSV, and download the verified accounting records.

See [DEMO_GUIDE.md](file:///c:/Users/varun/OneDrive/Desktop/billwiseAI/DEMO_GUIDE.md) for the exact word-for-word presentation script.

---

## 8. Documentation Index

- [QA_REPORT.md](file:///c:/Users/varun/OneDrive/Desktop/billwiseAI/QA_REPORT.md) — Comprehensive QA audit and defect resolution breakdown
- [ARCHITECTURE.md](file:///c:/Users/varun/OneDrive/Desktop/billwiseAI/ARCHITECTURE.md) — System architecture, pipeline diagrams, and entity-relationship specifications
- [DEMO_GUIDE.md](file:///c:/Users/varun/OneDrive/Desktop/billwiseAI/DEMO_GUIDE.md) — Step-by-step 3–5 minute presentation guide for hackathon judges
- [.env.example](file:///c:/Users/varun/OneDrive/Desktop/billwiseAI/.env.example) — Safe environment variable template
