# BillWise AI — 3–5 Minute Hackathon Presentation & Demonstration Guide

**Project:** BillWise AI — Intelligent Document Processing Platform  
**Target Audience:** Hackathon Judges, Angel Evaluators, Small Business Owners

---

## 1. Executive Pitch (30 Seconds)

> *"Small businesses waste hours every week manually typing invoices into accounting spreadsheets. Manual data entry causes three expensive problems: incorrect totals, missing invoice fields, and accidental duplicate payments.*
>
> *BillWise AI solves this with an end-to-end Intelligent Document Processing platform that extracts data from invoices using OCR, checks mathematical and duplicate integrity using rule-based validation, and empowers human reviewers to approve records before exporting them to Excel and CSV."*

---

## 2. Live Demo Script (3–5 Minutes)

### Step 1: 1-Click Fast Track Login (15 Seconds)
1. Open the application at `http://localhost:5173`.
2. Click **"Sign In"** in the top navigation or go to `/login`.
3. Point out the **"Hackathon Evaluator Access"** box and click **"Launch Instant Demo Mode"**.
4. **Key talking point:** *"We built instant 1-click evaluator access that generates a genuine, cryptographically signed JWT session for CFO Alex Rivera without typing credentials."*

### Step 2: Live Executive Dashboard (30 Seconds)
1. You land on `/dashboard`. Show the metrics:
   - **Total Documents Ingested**
   - **Total Invoiced Value** (real database sum)
   - **Approved Documents** vs **Needs Correction**
2. Point out the **Monthly Throughput Chart** and **Vendor Spending Breakdown**.
3. **Key talking point:** *"Every number on this dashboard is backed by actual relational records in our database—no hardcoded fake statistics."*

### Step 3: Scenario 1 — Clean & Balanced Invoice (45 Seconds)
1. Navigate to **Upload** (`/upload`) in the left sidebar.
2. In the "1-Click Hackathon Evaluation Presets" section, click **"Clean Valid Invoice (Apex Cloud)"**.
3. Watch the visual processing animation. The app automatically navigates to `/extraction/:id`.
4. Point out the split screen:
   - Left side: High-resolution document preview with zoom controls.
   - Right side: Extracted vendor, invoice number, dates, line items, and traffic-light confidence badges.
5. Click **"Run Automated Validation"**.
6. **Result**: Shows **7 Checks Passed**, **0 Critical Errors**, **0 Warnings**.
7. Click **"Approve & Finalize Record"**. Confetti fires!
8. **Key talking point:** *"When an invoice has valid math and no collisions, BillWise AI verifies it instantly and clears it for approval."*

### Step 4: Scenario 2 — Calculation Mismatch Detection (60 Seconds)
1. Click **Upload** in sidebar again.
2. Under presets, click **"Calculation Error Sample (Vanguard Supplies)"**.
3. The system processes the document and routes to extraction.
4. Notice that Vanguard recorded subtotal as `$950.00`, but the line items sum to `$850.00` ($500 + $200 + $150).
5. Click **"Validation Centre"** in the sidebar or bottom button.
6. Observe the clear error breakdown:
   - **Critical Error**: Grand Total Discrepancy (Subtotal + Tax - Discount != Grand Total).
   - **Warning**: Line Item Sum vs Subtotal Mismatch.
   - Notice the **"Approve"** button is **disabled and blocked**.
7. Click **"Quick Fix / Edit Discrepancy"** (or go to Extraction).
8. Change Subtotal to `850.00` and Grand Total to `922.00`. Click **"Save Changes"**.
9. The validation engine reruns automatically: **Status flips to PASSED**.
10. The Approve button unlocks!
11. **Key talking point:** *"BillWise AI strictly blocks human approval while critical financial errors exist, preventing bad data from entering the accounting pipeline."*

### Step 5: Scenario 3 — Duplicate Invoice Detection (45 Seconds)
1. Click **Upload** and click **"Duplicate Invoice Sample (Apex Cloud Duplicate)"**.
2. Navigate to **"Duplicate Centre"** (`/duplicates`) from the sidebar.
3. Show the side-by-side comparison:
   - **Document A** vs **Document B**
   - Matching reasons: *Identical Invoice Number 'INV-2024-0891'*, *Identical Vendor 'Apex Cloud'*, *100% Match Confidence*.
4. Show the two actions:
   - **"Confirm Duplicate"**: Automatically marks the duplicate invoice as `Rejected`.
   - **"Mark as Legitimate"**: Allows an exceptional re-billing and resolves the duplicate alert.
5. **Key talking point:** *"Small businesses lose thousands of dollars each year paying the same invoice twice. Our multi-signal duplicate engine detects collisions instantly."*

### Step 6: Export Centre (30 Seconds)
1. Click **Export** (`/export`) in sidebar.
2. Select **"Excel Spreadsheet (.xlsx)"** or **"CSV (.csv)"**.
3. Toggle "Only Export Approved Records".
4. Click **"Generate & Download Export"**.
5. The styled Excel spreadsheet downloads with emerald fintech headers, formatted currency columns, and spreadsheet formula injection protection.
6. **Key talking point:** *"All approved records are now ready for import into QuickBooks, Xero, or Excel."*

---

## 3. How to Reset Demo Data During the Presentation

If you want to demonstrate the entire flow again from a blank, pristine state:

1. Click **Settings** in the bottom of the sidebar (`/settings`).
2. Scroll to the red **"Hackathon Presentation Reset"** card.
3. Click **"Reset Demo Data to Pristine State"** and confirm.
4. The database is wiped and re-seeded with the original clean state in under 1 second.

Alternatively, execute in PowerShell:
```powershell
python -c "import requests; requests.post('http://127.0.0.1:8000/api/demo/reset')"
```

---

## 4. Key Answers for Judge Questions

- **"Is AI real or fake in this demo?"**  
  *"We use real OCR via PyPDF2 and Tesseract OCR with intelligent regex pattern recognition. In demo mode, our 3 presets load deterministic real-world scenarios so you can test error handling reliably without API outages."*
- **"How do you handle floating point rounding errors?"**  
  *"All calculations in our validation engine run on Python's `decimal.Decimal` with 2-decimal half-up rounding, completely eliminating floating-point rounding bugs."*
- **"How do you prevent CSV injection attacks?"**  
  *"Our export engine sanitizes every text cell that begins with `=`, `+`, `-`, `@`, `\t`, or `\r` by prefixing a single apostrophe (`'`), preventing malicious macro execution in Excel."*
- **"Can users steal each other's data?"**  
  *"No. Every request carries an RFC 7519 signed JWT Bearer token, and all document queries are strictly filtered by the authenticated `user_id`."*
