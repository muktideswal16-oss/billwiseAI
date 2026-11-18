import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CopyCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  FileText,
  ArrowRight,
  HelpCircle,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function DuplicatePage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const fetchDuplicates = async () => {
    setLoading(true);
    try {
      const data = await api.getDuplicates();
      setDuplicates(data);
      if (data.length > 0) {
        setSelectedMatch(data[0]);
      } else {
        setSelectedMatch(null);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuplicates();
  }, []);

  const handleResolve = async (matchId, resolution) => {
    try {
      await api.resolveDuplicate(matchId, resolution);
      addToast(
        resolution === 'confirm_duplicate'
          ? 'Confirmed duplicate: Flagged record rejected'
          : 'Marked as legitimate business record',
        'success'
      );
      fetchDuplicates();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F4F7F5] tracking-tight">
            Duplicate Invoice Detection Centre
          </h1>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F4B942]/20 text-[#F4B942] border border-[#F4B942]/30">
            {duplicates.length} Potential Collisions
          </span>
        </div>
        <p className="text-xs text-[#929F98] mt-1">
          Identifies cross-document collisions based on vendor names, invoice identifiers, and matching billing totals.
        </p>
      </div>

      {duplicates.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#151D19] border border-[#1D2B24] text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-[#20D69A] mx-auto" />
          <h3 className="text-sm font-bold text-[#F4F7F5]">No Duplicates Detected</h3>
          <p className="text-xs text-[#929F98] max-w-md mx-auto">
            All ingested records have distinct invoice identifiers, dates, and vendor profiles.
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="mt-2 px-4 py-2 rounded-xl bg-[#20D69A] text-[#080B0A] font-bold text-xs uppercase"
          >
            Upload More Invoices
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Matches List Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#929F98]">
              Flagged Document Pairs ({duplicates.length})
            </h3>
            <div className="space-y-2">
              {duplicates.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedMatch(m)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedMatch?.id === m.id
                      ? 'bg-[#18231E] border-[#20D69A]/40 shadow-[0_0_15px_rgba(32,214,154,0.1)]'
                      : 'bg-[#151D19] border-[#1D2B24] hover:bg-[#101613]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F4F7F5] truncate max-w-[180px]">
                      {m.doc_a.vendor}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        m.match_score >= 95
                          ? 'bg-[#FF646D]/20 text-[#FF646D]'
                          : 'bg-[#F4B942]/20 text-[#F4B942]'
                      }`}
                    >
                      {m.match_score}% Match
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] text-[#929F98] space-y-0.5">
                    <div>Doc #{m.doc_a.id} vs Doc #{m.doc_b.id}</div>
                    <div className="font-mono text-[#8AF0C7]">Inv #{m.doc_a.invoice_number}</div>
                    <div>Total: ${m.doc_a.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#1D2B24] flex items-center justify-between text-[10px]">
                    <span className="text-[#929F98]">Status: {m.status}</span>
                    <span className="text-[#20D69A] font-semibold flex items-center gap-1">
                      Compare <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side-by-Side Comparison Workspace */}
          {selectedMatch && (
            <div className="lg:col-span-8 space-y-6">
              {/* Match Reason Header */}
              <div className="p-5 rounded-2xl bg-[#1A1813] border border-[#F4B942]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-[#F4B942]" />
                    <h3 className="text-sm font-bold text-[#F4F7F5]">
                      Duplicate Candidate: {selectedMatch.match_score}% Identity Score
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#F4B942] uppercase">
                    Status: {selectedMatch.status}
                  </span>
                </div>

                <div className="text-xs text-[#929F98]">
                  <strong>Matching Criteria:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-[#F4F7F5]">
                    {selectedMatch.match_reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Side by Side Document Comparison Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Document A (Original) */}
                <div className="p-5 rounded-2xl bg-[#151D19] border border-[#1D2B24] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#1D2B24]">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#20D69A]">Doc A (First Record)</span>
                      <h4 className="text-xs font-bold text-[#F4F7F5] truncate max-w-[180px]">
                        {selectedMatch.doc_a.filename}
                      </h4>
                    </div>
                    <span className="text-xs font-mono text-[#929F98]">ID #{selectedMatch.doc_a.id}</span>
                  </div>

                  {selectedMatch.doc_a.preview_url && (
                    <div className="h-44 rounded-xl overflow-hidden bg-[#080B0A] border border-[#1D2B24] flex items-center justify-center p-1">
                      <img
                        src={selectedMatch.doc_a.preview_url}
                        alt="Doc A Preview"
                        className="h-full object-contain"
                      />
                    </div>
                  )}

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-[#1D2B24]">
                      <span className="text-[#929F98]">Vendor</span>
                      <span className="font-semibold text-[#F4F7F5]">{selectedMatch.doc_a.vendor}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1D2B24]">
                      <span className="text-[#929F98]">Invoice #</span>
                      <span className="font-mono font-bold text-[#8AF0C7]">{selectedMatch.doc_a.invoice_number}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1D2B24]">
                      <span className="text-[#929F98]">Invoice Date</span>
                      <span className="font-semibold text-[#F4F7F5]">{selectedMatch.doc_a.date}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1D2B24]">
                      <span className="text-[#929F98]">Grand Total</span>
                      <span className="font-black text-[#20D69A] text-sm">
                        ${selectedMatch.doc_a.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#929F98]">Approval Status</span>
                      <span className="font-semibold text-[#F4F7F5]">{selectedMatch.doc_a.approval_status}</span>
                    </div>
                  </div>
                </div>

                {/* Document B (Potential Duplicate) */}
                <div className="p-5 rounded-2xl bg-[#151D19] border border-[#FF646D]/30 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#1D2B24]">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#FF646D]">Doc B (Flagged Duplicate)</span>
                      <h4 className="text-xs font-bold text-[#F4F7F5] truncate max-w-[180px]">
                        {selectedMatch.doc_b.filename}
                      </h4>
                    </div>
                    <span className="text-xs font-mono text-[#929F98]">ID #{selectedMatch.doc_b.id}</span>
                  </div>

                  {selectedMatch.doc_b.preview_url && (
                    <div className="h-44 rounded-xl overflow-hidden bg-[#080B0A] border border-[#1D2B24] flex items-center justify-center p-1">
                      <img
                        src={selectedMatch.doc_b.preview_url}
                        alt="Doc B Preview"
                        className="h-full object-contain"
                      />
                    </div>
                  )}

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-[#1D2B24]">
                      <span className="text-[#929F98]">Vendor</span>
                      <span className="font-semibold text-[#F4F7F5]">{selectedMatch.doc_b.vendor}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1D2B24]">
                      <span className="text-[#929F98]">Invoice #</span>
                      <span className="font-mono font-bold text-[#FF646D]">{selectedMatch.doc_b.invoice_number}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1D2B24]">
                      <span className="text-[#929F98]">Invoice Date</span>
                      <span className="font-semibold text-[#F4F7F5]">{selectedMatch.doc_b.date}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1D2B24]">
                      <span className="text-[#929F98]">Grand Total</span>
                      <span className="font-black text-[#FF646D] text-sm">
                        ${selectedMatch.doc_b.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#929F98]">Approval Status</span>
                      <span className="font-semibold text-[#F4F7F5]">{selectedMatch.doc_b.approval_status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decision Resolution Actions */}
              <div className="p-5 rounded-2xl bg-[#101613] border border-[#1D2B24] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[#929F98]">
                  <span>Review the comparison above before making a resolution.</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleResolve(selectedMatch.id, 'mark_legitimate')}
                    className="px-4 py-2.5 rounded-xl bg-[#151D19] hover:bg-[#1D2B24] border border-[#1D2B24] text-xs font-semibold text-[#8AF0C7] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#20D69A]" />
                    <span>Mark as Legitimate (False Positive)</span>
                  </button>

                  <button
                    onClick={() => handleResolve(selectedMatch.id, 'confirm_duplicate')}
                    className="px-5 py-2.5 rounded-xl bg-[#FF646D]/15 hover:bg-[#FF646D]/25 border border-[#FF646D]/40 text-xs font-bold text-[#FF646D] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Confirm Duplicate (Reject Doc B)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

