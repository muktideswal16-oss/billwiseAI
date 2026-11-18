# BillWise AI — Intelligent Document Processing Platform

> **Turn invoices, receipts, and purchase orders into clean, checked business records.**

A production-style, intelligent document processing web platform designed for small businesses, shopkeepers, retail operators, and accounting teams who manually maintain invoice records.

Built for the Hackathon theme: **AI, Automation & Intelligent Systems**  
Problem Statement: **Intelligent Document Processing for Small Businesses**

---

## 1. Core Architecture & Philosophy

BillWise AI is built around three core pillars:

1. **Intelligence**: Deep OCR text rastering and NLP field extraction that identifies vendors, dates, identifiers, line-item tables, and totals with field-level confidence scoring.
2. **Accuracy**: Rule-based validation engine checking mathematical formulas (`Subtotal + Tax - Discount = Grand Total`), line-item reconciliations, timeline sanity, and duplicate detection.
3. **Control**: Human-in-the-loop review. Records remain pending until a human explicitly reviews side-by-side previews, edits any discrepancy, and approves them prior to export.

---

## 2. Technology Stack

### Frontend
- **React.js 19** with **Vite**
- **Tailwind CSS v4** (Custom Emerald Fintech SaaS Theme)
- **Lucide React** for professional interface icons
- **Recharts** for monthly throughput and vendor spending analytics
- **React Router v7** for multi-page workspace routing
- **Canvas-Confetti** for celebration micro-interactions

### Backend
- **Python 3.14** with **FastAPI**
- **SQLAlchemy ORM** with **SQLite** (fully PostgreSQL compatible)
- **Pandas** for tabular dataset transformation and flat CSV generation
- **OpenPyXL** for formatted, styled Excel (`.xlsx`) workbooks with auto-fit columns
- **Pillow (PIL)** for contrast enhancement and image binarization
- **Tesseract OCR / PyPDF2** for native text recognition with heuristic fallbacks

---

## 3. Design System & Fintech SaaS Theme

- **Main Background**: `#080B0A`
- **Secondary Background**: `#101613`
- **Card Background**: `#151D19`
- **Primary Emerald**: `#20D69A`
- **Secondary Mint**: `#8AF0C7`
- **Main Text**: `#F4F7F5`
- **Muted Text**: `#929F98`
- **Warning**: `#F4B942`
- **Error / Discrepancy**: `#FF646D`
- **Success**: `#20D69A`

---

## 4. 10-Step Hackathon Live Demonstration Walkthrough

Judges can complete a full end-to-end evaluation in **3–5 minutes**:

1. **Landing Page (`/`)**: Review the hero, animated scanning laser effect on the live invoice preview, and the 6-stage automated pipeline.
2. **Dashboard Overview (`/dashboard`)**: Explore real-time metrics, throughput charts, document classification donut, and the recent ingestion queue.
3. **Document Ingestion (`/upload`)**: Click one of the 3 hackathon presets:
   - **Scenario 1 (Clean Valid)**: *Apex Cloud Solutions* (3 items, 10% tax, balanced total of $2,595.00).
   - **Scenario 2 (Calculation Mismatch)**: *Vanguard Office Supplies* (item sum $850.00 vs recorded subtotal $950.00).
   - **Scenario 3 (Duplicate Invoice)**: *Apex Cloud Duplicate* (matches invoice #INV-2024-0891).
4. **Processing Pipeline Animation**: Observe the 6-stage animated progress bar: Ingestion → Preprocessing → OCR → Extraction → Validation → Ready for Review.
5. **AI Extraction Centre (`/extraction/:id`)**: Inspect the split-screen view: document preview on left, organized editable fields with traffic-light confidence badges on right.
6. **Error Correction**: Edit any mismatched field directly. Notice confidence automatically updates to 100% (Human Verified).
7. **Validation Centre (`/validation/:id`)**: Review automated formula verification, expected vs actual discrepancy chips, and duplicate collision warnings.
8. **Duplicate Detection Centre (`/duplicates`)**: Side-by-side comparison of Document A vs Document B with matching reasons (identical invoice number, vendor, and amount). Option to mark as legitimate or confirm duplicate.
9. **Human Review & Approval (`/review/:id`)**: Add audit remarks, click **"Approve & Finalize Record"**, and enjoy the confetti celebration!
10. **Export Centre (`/export`)**: Select approved records and download a real generated Excel (`.xlsx`) or CSV file.

---

## 5. Quick Start & Execution Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### Running the Backend
```bash
# From workspace root
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
Backend runs at: `http://127.0.0.1:8000`  
Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`

### Running the Frontend
```bash
# Navigate to frontend folder
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
Frontend runs at: `http://127.0.0.1:5173`

---

## 6. OCR vs Demo Mode Transparency

To maintain technical integrity without fake claims:
- **Real OCR**: When Tesseract OCR binary or text-bearing PDFs are available on the host machine, text recognition is performed directly using `pytesseract` and `PyPDF2` with image contrast preprocessing.
- **Deterministic Demo Presets**: When evaluating without external API keys or when clicking the 3 hackathon preset buttons, deterministic sample extractions are provided. Every extraction clearly displays its engine tag (`AI_OCR_ENGINE`, `TESSERACT_OCR`, or `DEMO_DETERMINISTIC`).

