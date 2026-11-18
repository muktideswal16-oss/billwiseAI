import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ConfidenceBadge from '../components/ConfidenceBadge';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function DocumentListPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [docType, setDocType] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const data = await api.getDocuments({
        search,
        document_type: docType,
        approval_status: statusFilter,
        sort_by: sortBy
      });
      setDocuments(data);
      setCurrentPage(1);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [search, docType, statusFilter, sortBy]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete document #${id}?`)) return;
    try {
      await api.deleteDocument(id);
      addToast(`Document #${id} deleted`, 'info');
      fetchDocs();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(documents.length / itemsPerPage) || 1;
  const paginatedDocs = documents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F4F7F5] tracking-tight">
            Document Repository & Library
          </h1>
          <p className="text-xs text-[#929F98] mt-1">
            Search, filter, inspect, and manage ingested financial documentation.
          </p>
        </div>

        <button
          onClick={() => navigate('/upload')}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#20D69A] to-[#16B580] text-[#080B0A] font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(32,214,154,0.25)] flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload New File</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#151D19] border border-[#1D2B24] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#929F98]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendor or invoice #..."
            className="w-full bg-[#101613] border border-[#1D2B24] rounded-lg pl-9 pr-3 py-2 text-[#F4F7F5] focus:outline-none focus:border-[#20D69A]/50"
          />
        </div>

        {/* Document Type Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#929F98] shrink-0" />
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="w-full bg-[#101613] border border-[#1D2B24] rounded-lg px-3 py-2 text-[#F4F7F5] focus:outline-none focus:border-[#20D69A]/50"
          >
            <option value="All">All Document Types</option>
            <option value="Invoice">Invoices</option>
            <option value="Receipt">Receipts</option>
            <option value="Purchase Order">Purchase Orders</option>
          </select>
        </div>

        {/* Approval Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-[#101613] border border-[#1D2B24] rounded-lg px-3 py-2 text-[#F4F7F5] focus:outline-none focus:border-[#20D69A]/50"
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Needs Correction">Needs Correction</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Sorting */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-[#929F98] shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-[#101613] border border-[#1D2B24] rounded-lg px-3 py-2 text-[#F4F7F5] focus:outline-none focus:border-[#20D69A]/50"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl bg-[#151D19] border border-[#1D2B24] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#101613] text-[#929F98] uppercase font-semibold text-[10px] tracking-wider border-b border-[#1D2B24]">
              <tr>
                <th className="py-3 px-5">ID</th>
                <th className="py-3 px-5">Document</th>
                <th className="py-3 px-5">Type</th>
                <th className="py-3 px-5">Vendor</th>
                <th className="py-3 px-5">Invoice #</th>
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-5">Grand Total</th>
                <th className="py-3 px-5">Confidence</th>
                <th className="py-3 px-5">Approval</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2B24]">
              {paginatedDocs.map((doc) => {
                const ext = doc.extracted_data;
                return (
                  <tr
                    key={doc.id}
                    onClick={() => navigate(`/review/${doc.id}`)}
                    className="hover:bg-[#1A2520]/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-5 font-mono text-[#929F98]">#{doc.id}</td>
                    <td className="py-3.5 px-5 font-medium text-[#F4F7F5]">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#20D69A] shrink-0" />
                        <span className="truncate max-w-[170px]">{doc.original_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-[#929F98]">{doc.document_type}</td>
                    <td className="py-3.5 px-5 font-semibold text-[#F4F7F5]">
                      {ext?.vendor_name || 'Processing...'}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[#929F98]">{ext?.invoice_number || 'N/A'}</td>
                    <td className="py-3.5 px-5 text-[#929F98]">
                      {ext?.invoice_date || new Date(doc.upload_date).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-[#F4F7F5]">
                      {ext?.grand_total ? `$${ext.grand_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="py-3.5 px-5">
                      <ConfidenceBadge score={ext?.confidence_score ?? 0.9} />
                    </td>
                    <td className="py-3.5 px-5">
                      <StatusBadge status={doc.approval_status} />
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/extraction/${doc.id}`);
                        }}
                        title="View Fields"
                        className="p-1.5 rounded hover:bg-[#1D2B24] text-[#929F98] hover:text-[#20D69A] transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(doc.id, e)}
                        title="Delete"
                        className="p-1.5 rounded hover:bg-[#FF646D]/20 text-[#929F98] hover:text-[#FF646D] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {paginatedDocs.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#929F98]">
                    No documents matching your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-[#1D2B24] bg-[#101613] flex items-center justify-between text-xs text-[#929F98]">
          <span>
            Showing {documents.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
            {Math.min(currentPage * itemsPerPage, documents.length)} of {documents.length} entries
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-[#151D19] border border-[#1D2B24] disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold text-[#F4F7F5]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-[#151D19] border border-[#1D2B24] disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

