import React, { useState, useEffect } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  Filter,
  ShieldCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function ExportPage() {
  const { addToast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [onlyApproved, setOnlyApproved] = useState(true);
  const [format, setFormat] = useState('excel'); // 'excel' or 'csv'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDocuments({ approval_status: onlyApproved ? 'Approved' : 'All' })
      .then((docs) => {
        setDocuments(docs);
        // Default select all
        setSelectedIds(docs.map((d) => d.id));
      })
      .catch((err) => addToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [onlyApproved]);

  const handleToggleSelectAll = () => {
    if (selectedIds.length === documents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(documents.map((d) => d.id));
    }
  };

  const handleToggleDoc = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    } else {
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  const handleDownload = async () => {
    if (selectedIds.length === 0) {
      addToast('Please select at least one document to export', 'warning');
      return;
    }

    const exportUrl = api.getExportUrl(format, onlyApproved, selectedIds);
    try {
      addToast(`Generating ${format.toUpperCase()} export...`, 'info');
      const token = localStorage.getItem('billwise_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(exportUrl, { headers });
      if (!res.ok) {
        throw new Error('Export generation failed');
      }
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `billwise_export_${Date.now()}.${format === 'excel' ? 'xlsx' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      // Confetti celebration
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#20D69A', '#8AF0C7', '#ffffff']
      });

      addToast(
        `Export generated! Downloaded ${selectedIds.length} records in ${format.toUpperCase()} format.`,
        'success'
      );
    } catch (err) {
      addToast(`Export failed: ${err.message}`, 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#F4F7F5] tracking-tight">
          Export & Reporting Hub
        </h1>
        <p className="text-xs text-[#929F98] mt-1">
          Export validated and approved document records into standardized Excel (.xlsx) and CSV files.
        </p>
      </div>

      {/* Configuration Box */}
      <div className="p-6 rounded-2xl bg-[#151D19] border border-[#1D2B24] space-y-6">
        <h3 className="text-sm font-bold text-[#F4F7F5] uppercase tracking-wider">
          Export Preferences
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Format selection */}
          <div
            onClick={() => setFormat('excel')}
            className={`p-5 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${format === 'excel'
                ? 'bg-[#18231E] border-[#20D69A] shadow-[0_0_20px_rgba(32,214,154,0.15)]'
                : 'bg-[#101613] border-[#1D2B24] hover:border-[#20D69A]/40'
              }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#20D69A]/15 text-[#20D69A] flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#F4F7F5]">Excel Spreadsheet (.xlsx)</span>
                {format === 'excel' && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#20D69A] text-[#080B0A]">
                    SELECTED
                  </span>
                )}
              </div>
              <p className="text-xs text-[#929F98] mt-1 leading-relaxed">
                Includes styled emerald headers, currency formatting, formula integrity, and auto-adjusted columns.
              </p>
            </div>
          </div>

          <div
            onClick={() => setFormat('csv')}
            className={`p-5 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${format === 'csv'
                ? 'bg-[#18231E] border-[#20D69A] shadow-[0_0_20px_rgba(32,214,154,0.15)]'
                : 'bg-[#101613] border-[#1D2B24] hover:border-[#20D69A]/40'
              }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#8AF0C7]/15 text-[#8AF0C7] flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#F4F7F5]">Universal Flat CSV (.csv)</span>
                {format === 'csv' && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#20D69A] text-[#080B0A]">
                    SELECTED
                  </span>
                )}
              </div>
              <p className="text-xs text-[#929F98] mt-1 leading-relaxed">
                Universal comma-separated text table ready for direct import into QuickBooks, Xero, or PostgreSQL.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#1D2B24] text-xs">
          <label className="flex items-center gap-2 text-[#F4F7F5] cursor-pointer">
            <input
              type="checkbox"
              checked={onlyApproved}
              onChange={(e) => setOnlyApproved(e.target.checked)}
              className="rounded border-[#1D2B24] bg-[#101613] text-[#20D69A] focus:ring-[#20D69A]"
            />
            <span className="font-semibold">Only export approved business records (exclude unreviewed)</span>
          </label>

          <span className="text-[#929F98]">
            Selected: <strong className="text-[#20D69A]">{selectedIds.length}</strong> of {documents.length} records
          </span>
        </div>
      </div>

      {/* Document Selector Table */}
      <div className="rounded-2xl bg-[#151D19] border border-[#1D2B24] overflow-hidden">
        <div className="p-4 border-b border-[#1D2B24] flex items-center justify-between text-xs">
          <button
            onClick={handleToggleSelectAll}
            className="text-[#20D69A] font-semibold hover:underline"
          >
            {selectedIds.length === documents.length ? 'Deselect All' : 'Select All'}
          </button>
          <span className="text-[#929F98]">
            Included columns: Vendor, Inv #, Date, Due Date, Items, Unit Rate, Subtotal, Tax, Discount, Total
          </span>
        </div>

        <div className="overflow-x-auto max-h-72 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#101613] text-[#929F98] uppercase text-[10px] sticky top-0">
              <tr>
                <th className="py-2.5 px-4 w-10">Select</th>
                <th className="py-2.5 px-4">Document</th>
                <th className="py-2.5 px-4">Vendor</th>
                <th className="py-2.5 px-4">Invoice #</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Total</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2B24]">
              {documents.map((doc) => {
                const ext = doc.extracted_data;
                const isSelected = selectedIds.includes(doc.id);
                return (
                  <tr
                    key={doc.id}
                    onClick={() => handleToggleDoc(doc.id)}
                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-[#18231E]/60' : 'hover:bg-[#101613]'
                      }`}
                  >
                    <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleDoc(doc.id)}
                        className="rounded border-[#1D2B24] bg-[#101613] text-[#20D69A]"
                      />
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-[#F4F7F5] truncate max-w-[180px]">
                      {doc.original_name}
                    </td>
                    <td className="py-2.5 px-4 text-[#F4F7F5]">{ext?.vendor_name || 'N/A'}</td>
                    <td className="py-2.5 px-4 font-mono text-[#929F98]">{ext?.invoice_number || 'N/A'}</td>
                    <td className="py-2.5 px-4 text-[#929F98]">{ext?.invoice_date || 'N/A'}</td>
                    <td className="py-2.5 px-4 font-bold text-[#20D69A]">
                      ${(ext?.grand_total ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#20D69A]/15 text-[#20D69A]">
                        {doc.approval_status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Download Trigger Bar */}
        <div className="p-4 border-t border-[#1D2B24] bg-[#101613] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#929F98]">
            <CheckCircle2 className="w-4 h-4 text-[#20D69A]" />
            <span>Files are dynamically generated on server via Pandas and OpenPyXL</span>
          </div>

          <button
            onClick={handleDownload}
            disabled={selectedIds.length === 0}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-[#20D69A] to-[#16B580] text-[#080B0A] font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(32,214,154,0.3)] hover:shadow-[0_0_25px_rgba(32,214,154,0.45)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Download {format === 'excel' ? 'Excel (.xlsx)' : 'CSV (.csv)'} File</span>
          </button>
        </div>
      </div>
    </div>
  );
}

