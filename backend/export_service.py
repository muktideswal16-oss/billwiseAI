import os
import io
import datetime
from typing import List, Optional
import pandas as pd
from sqlalchemy.orm import Session
from .models import Document, ExtractedInvoice, InvoiceItem

def generate_export_dataframe(
    db: Session,
    document_ids: Optional[List[int]] = None,
    only_approved: bool = True
) -> pd.DataFrame:
    """
    Builds a flattened tabular DataFrame ready for CSV/Excel export.
    Joins Document, ExtractedInvoice, and InvoiceItem.
    """
    query = db.query(Document).join(ExtractedInvoice, Document.id == ExtractedInvoice.document_id)

    if only_approved:
        query = query.filter(Document.approval_status == "Approved")

    if document_ids:
        query = query.filter(Document.id.in_(document_ids))

    docs = query.all()

    rows = []
    for doc in docs:
        ext = doc.extracted_data
        if not ext:
            continue

        items = ext.items
        if items:
            for item in items:
                rows.append({
                    "Document ID": doc.id,
                    "Filename": doc.filename,
                    "Document Type": doc.document_type,
                    "Vendor Name": ext.vendor_name or "N/A",
                    "Invoice Number": ext.invoice_number or "N/A",
                    "Invoice Date": ext.invoice_date or "N/A",
                    "Due Date": ext.due_date or "N/A",
                    "Purchase Order": ext.purchase_order_number or "N/A",
                    "Item Name": item.item_name,
                    "Item Description": item.description or "",
                    "Quantity": item.quantity,
                    "Unit Price": item.unit_price,
                    "Item Tax": item.tax,
                    "Line Total": item.line_total,
                    "Subtotal": ext.subtotal,
                    "Invoice Tax Total": ext.tax_amount,
                    "Discount": ext.discount,
                    "Grand Total": ext.grand_total,
                    "Currency": ext.currency,
                    "Approval Status": doc.approval_status,
                    "Confidence Score": f"{ext.confidence_score * 100:.1f}%",
                    "Extraction Method": ext.extraction_method,
                    "Processed At": doc.upload_date.strftime("%Y-%m-%d %H:%M") if doc.upload_date else ""
                })
        else:
            rows.append({
                "Document ID": doc.id,
                "Filename": doc.filename,
                "Document Type": doc.document_type,
                "Vendor Name": ext.vendor_name or "N/A",
                "Invoice Number": ext.invoice_number or "N/A",
                "Invoice Date": ext.invoice_date or "N/A",
                "Due Date": ext.due_date or "N/A",
                "Purchase Order": ext.purchase_order_number or "N/A",
                "Item Name": "Summary Entry",
                "Item Description": "Consolidated record",
                "Quantity": 1.0,
                "Unit Price": ext.subtotal,
                "Item Tax": ext.tax_amount,
                "Line Total": ext.subtotal,
                "Subtotal": ext.subtotal,
                "Invoice Tax Total": ext.tax_amount,
                "Discount": ext.discount,
                "Grand Total": ext.grand_total,
                "Currency": ext.currency,
                "Approval Status": doc.approval_status,
                "Confidence Score": f"{ext.confidence_score * 100:.1f}%",
                "Extraction Method": ext.extraction_method,
                "Processed At": doc.upload_date.strftime("%Y-%m-%d %H:%M") if doc.upload_date else ""
            })

    if not rows:
        # Return empty dataframe with standard columns
        return pd.DataFrame(columns=[
            "Document ID", "Filename", "Document Type", "Vendor Name", "Invoice Number",
            "Invoice Date", "Due Date", "Purchase Order", "Item Name", "Item Description",
            "Quantity", "Unit Price", "Item Tax", "Line Total", "Subtotal", "Invoice Tax Total",
            "Discount", "Grand Total", "Currency", "Approval Status", "Confidence Score",
            "Extraction Method", "Processed At"
        ])

    return pd.DataFrame(rows)


def export_to_csv(df: pd.DataFrame) -> io.BytesIO:
    """Exports DataFrame to in-memory CSV file buffer."""
    buf = io.BytesIO()
    df.to_csv(buf, index=False, encoding='utf-8-sig')
    buf.seek(0)
    return buf


def export_to_excel(df: pd.DataFrame) -> io.BytesIO:
    """Exports DataFrame to styled Excel (.xlsx) buffer with professional styling."""
    buf = io.BytesIO()
    
    with pd.ExcelWriter(buf, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name="BillWise Records", index=False)
        workbook = writer.book
        worksheet = writer.sheets["BillWise Records"]

        try:
            from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
            from openpyxl.utils import get_column_letter

            # Header Style: Emerald primary (#20D69A)
            header_fill = PatternFill(start_color="15803D", end_color="15803D", fill_type="solid")
            header_font = Font(name="Arial", size=11, bold=True, color="FFFFFF")
            header_alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

            thin_border = Border(
                left=Side(style='thin', color='DDDDDD'),
                right=Side(style='thin', color='DDDDDD'),
                top=Side(style='thin', color='DDDDDD'),
                bottom=Side(style='thin', color='DDDDDD')
            )

            for col_num, col_name in enumerate(df.columns, 1):
                cell = worksheet.cell(row=1, column=col_num)
                cell.fill = header_fill
                cell.font = header_font
                cell.alignment = header_alignment

            # Auto-fit column widths
            for col in worksheet.columns:
                max_len = 0
                col_letter = get_column_letter(col[0].column)
                for cell in col:
                    cell.border = thin_border
                    val_str = str(cell.value or "")
                    if len(val_str) > max_len:
                        max_len = len(val_str)
                worksheet.column_dimensions[col_letter].width = min(max(max_len + 3, 12), 40)
                
            worksheet.row_dimensions[1].height = 28
        except Exception as e:
            print(f"Excel styling error: {e}")

    buf.seek(0)
    return buf

