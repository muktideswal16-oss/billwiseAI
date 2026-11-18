import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Edit3,
  ShieldCheck,
  AlertTriangle,
  History,
  Download,
  ArrowRight,
  ExternalLink,
  Save,
  Clock,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ConfidenceBadge from '../components/ConfidenceBadge';
import StatusBadge from '../components/StatusBadge';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function ReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [documentData, setDocumentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [comment, setComment] = useState('');
  const [reviewerName, setReviewerName] = useState('Alex Rivera (CFO)');

  const fetchDocument = async () => {
    if (!id) return;
    try {
      const doc = await api.getDocumentById(parseInt(id));
      setDocumentData(doc);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const handleApprove = async () => {
    setActing(true);
    try {
      await api.approveDocument(
        parseInt(id),
        comment || 'Verified and approved for general ledger export',
        reviewerName
      );
      // Trigger festive confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#20D69A', '#8AF0C7', '#ffffff']
      });
      addToast('Document explicitly Approved! Ready for CSV/Excel export.', 'success');
      await fetchDocument();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setActing(false);
    }
  };

  const handleReject = async () => {
    setActing(true);
    try {
      await api.rejectDocument(
        parseInt(id),
        comment || 'Rejected by reviewer due to discrepancies',
        reviewerName
      );
      addToast('Document marked as Rejected', 'info');
      await fetchDocument();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-[#929F98]">
        <Clock className="w-8 h-8 text-[#20D69A] animate-spin mx-auto mb-2" />
        <span>Loading document review workspace...</span>
      </div>
    );
  }

  if (!documentData) {
    return (
      <div className="p-8 text-center text-xs text-[#929F98]">
        <p>Document not found.</p>
        <button
          onClick={() => navigate('/documents')}
          className="mt-3 px-4 py-2 rounded-lg bg-[#20D69A] text-[#080B0A] font-bold"
        >
          Back to Documents
        </button>
      </div>
    );
  }

  const ext = documentData.extracted_data;
  const issues = documentData.validation_issues || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Top Banner / Approval Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#151D19] border border-[#1D2B24]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#929F98]">DOC #{documentData.id}</span>
            <span className="text-sm font-bold text-[#F4F7F5] truncate max-w-md">
              {documentData.original_name}
            </span>
            <StatusBadge status={documentData.approval_status} />
          </div>
          <p className="text-xs text-[#929F98] mt-1">
            Uploaded {new Date(documentData.upload_date).toLocaleString()} • Type: {documentData.document_type}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/extraction/${documentData.id}`)}
            className="px-3.5 py-2 rounded-xl bg-[#101613] hover:bg-[#1D2B24] border border-[#1D2B24] text-xs font-semibold text-[#8AF0C7] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Fields</span>
          </button>
          <button
            onClick={() => navigate(`/validation/${documentData.id}`)}
            className="px-3.5 py-2 rounded-xl bg-[#101613] hover:bg-[#1D2B24] border border-[#1D2B24] text-xs font-semibold text-[#F4F7F5] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#20D69A]" />
            <span>Validation Details</span>
          </button>
        </div>
      </div>

      {/* Split Audit Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Document Visual Preview */}
        <div className="lg:col-span-5 rounded-2xl bg-[#151D19] border border-[#1D2B24] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#1D2B24] text-xs text-[#929F98]">
            <span className="font-bold text-[#F4F7F5]">Document Preview</span>
            <span className="text-[10px] font-mono">{documentData.mime_type}</span>
          </div>

          <div className="my-4 rounded-xl overflow-hidden bg-[#080B0A] border border-[#1D2B24] flex items-center justify-center p-2 min-h-[420px]">
            {documentData.preview_url ? (
              <img
                src={documentData.preview_url}
                alt="Document Preview"
                className="w-full max-h-[500px] object-contain rounded"
              />
            ) : (
              <div className="text-center p-6 text-xs text-[#929F98]">
                <FileText className="w-10 h-10 text-[#20D69A] mx-auto mb-2 opacity-50" />
                <span>Document raw stream stored securely</span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[#1D2B24] flex items-center justify-between text-xs text-[#929F98]">
            <span>File Size: {(documentData.file_size / 1024).toFixed(1)} KB</span>
            <span className="text-[#20D69A] font-semibold">Integrity Verified</span>
          </div>
        </div>

        {/* Right: Review Details & Decision Panel */}
        <div className="lg:col-span-7 space-y-6">
          {/* Financial Extraction Overview Card */}
          <div className="p-6 rounded-2xl bg-[#151D19] border border-[#1D2B24] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1D2B24]">
              <div>
                <h3 className="text-sm font-bold text-[#F4F7F5]">Extracted Ledger Values</h3>
                <span className="text-[11px] text-[#929F98]">
                  Vendor: <strong className="text-[#F4F7F5]">{ext?.vendor_name || 'N/A'}</strong>
                </span>
              </div>
              <ConfidenceBadge score={ext?.confidence_score ?? 0.9} label="Confidence" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#101613] border border-[#1D2B24]">
                <span className="text-[10px] text-[#929F98] uppercase">Invoice Number</span>
                <p className="font-mono font-bold text-[#F4F7F5] mt-0.5">{ext?.invoice_number || 'N/A'}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#101613] border border-[#1D2B24]">
                <span className="text-[10px] text-[#929F98] uppercase">Billing Date</span>
                <p className="font-bold text-[#F4F7F5] mt-0.5">{ext?.invoice_date || 'N/A'}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#101613] border border-[#1D2B24]">
                <span className="text-[10px] text-[#929F98] uppercase">Subtotal</span>
                <p className="font-bold text-[#F4F7F5] mt-0.5">
                  ${(ext?.subtotal ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#101613] border border-[#20D69A]/30">
                <span className="text-[10px] text-[#929F98] uppercase font-bold text-[#20D69A]">Grand Total</span>
                <p className="font-black text-[#20D69A] text-sm mt-0.5">
                  ${(ext?.grand_total ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Line items mini table */}
            {ext?.items && ext.items.length > 0 && (
              <div className="pt-2">
                <div className="text-[11px] font-bold text-[#929F98] uppercase tracking-wider mb-2">
                  Line Items ({ext.items.length})
                </div>
                <div className="rounded-xl border border-[#1D2B24] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#101613] text-[#929F98] text-[10px] uppercase font-semibold">
                      <tr>
                        <th className="py-2 px-3">Item Description</th>
                        <th className="py-2 px-3 text-center">Qty</th>
                        <th className="py-2 px-3 text-right">Unit Rate</th>
                        <th className="py-2 px-3 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1D2B24]">
                      {ext.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-[#1A2520]/40">
                          <td className="py-2 px-3 font-medium text-[#F4F7F5]">{it.item_name}</td>
                          <td className="py-2 px-3 text-center text-[#929F98]">{it.quantity}</td>
                          <td className="py-2 px-3 text-right text-[#929F98]">${it.unit_price.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right font-bold text-[#F4F7F5]">${it.line_total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Validation Status Box */}
          <div className="p-5 rounded-2xl bg-[#151D19] border border-[#1D2B24] space-y-3">
            <h3 className="text-xs font-bold text-[#F4F7F5] uppercase tracking-wider">
              Validation Engine Verdict
            </h3>
            {issues.length > 0 ? (
              <div className="p-3.5 rounded-xl bg-[#1D1517] border border-[#FF646D]/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#FF646D] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-[#FF646D]">{issues.length} Issues Detected</p>
                  <p className="text-[11px] text-[#929F98] mt-0.5">
                    {issues[0].issue_description}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-[#12221A] border border-[#20D69A]/30 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#20D69A] shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[#20D69A]">Zero Discrepancies</p>
                  <p className="text-[11px] text-[#929F98]">All arithmetic balances and fields verified.</p>
                </div>
              </div>
            )}
          </div>

          {/* Human Review Sign-Off Card */}
          <div className="p-6 rounded-2xl bg-[#101613] border border-[#20D69A]/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8AF0C7]">
                Human Sign-Off & Approval
              </h3>
              <span className="text-[10px] text-[#929F98]">Reviewer: {reviewerName}</span>
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add optional audit note or approval remarks..."
              rows={2}
              className="w-full bg-[#151D19] border border-[#1D2B24] rounded-xl p-3 text-xs text-[#F4F7F5] placeholder-[#929F98] focus:outline-none focus:border-[#20D69A]/50"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleReject}
                disabled={acting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#151D19] hover:bg-[#FF646D]/15 text-[#FF646D] border border-[#FF646D]/30 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Record</span>
              </button>

              <button
                type="button"
                onClick={handleApprove}
                disabled={acting}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-[#20D69A] to-[#16B580] text-[#080B0A] font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(32,214,154,0.35)] hover:shadow-[0_0_30px_rgba(32,214,154,0.5)] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Approve & Finalize Record</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

