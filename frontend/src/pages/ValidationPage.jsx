import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CopyCheck,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Edit3,
  FileText,
  Search,
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  Layers,
  Calculator,
  Calendar,
  Lock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Save,
  CheckSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';

export default function ValidationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [docList, setDocList] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(id ? parseInt(id) : null);
  const [documentData, setDocumentData] = useState(null);
  const [validationData, setValidationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revalidating, setRevalidating] = useState(false);
  const [approving, setApproving] = useState(false);

  // Active view tab: 'findings' (grouped accordions) or 'products' (50-100 line items)
  const [activeTab, setActiveTab] = useState('findings');

  // Accordion open/close states
  const [openSections, setOpenSections] = useState({
    errors: true,
    warnings: true,
    calculation: true,
    duplicates: true,
    missing: true,
    passed: false
  });

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All'); // 'All', 'unresolved', 'resolved'

  // Pagination for line items table (50-100 items)
  const [itemPage, setItemPage] = useState(1);
  const itemsPerPage = 10;

  // Selected finding details modal
  const [selectedFinding, setSelectedFinding] = useState(null);

  // Quick Inline Edit Drawer / Modal
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    subtotal: 0,
    tax_amount: 0,
    discount: 0,
    grand_total: 0,
    items: []
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Load document list
  const loadDocuments = async () => {
    try {
      const docs = await api.getDocuments();
      setDocList(docs);
      if (!selectedDocId && docs.length > 0) {
        // Prioritize doc with errors or garment bill or first doc
        const errorDoc = docs.find((d) => d.approval_status === 'Needs Correction');
        setSelectedDocId(errorDoc ? errorDoc.id : docs[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  // Fetch document details & run validation
  const fetchDocDetails = async (docId) => {
    setLoading(true);
    try {
      const [doc, valSummary] = await Promise.all([
        api.getDocumentById(docId),
        api.validateDocument(docId)
      ]);
      setDocumentData(doc);
      setValidationData(valSummary);

      const ext = doc.extracted_data;
      if (ext) {
        setEditForm({
          subtotal: ext.subtotal || 0,
          tax_amount: ext.tax_amount || 0,
          discount: ext.discount || 0,
          grand_total: ext.grand_total || 0,
          items: ext.items ? ext.items.map((it) => ({ ...it })) : []
        });
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDocId) {
      fetchDocDetails(selectedDocId);
      setItemPage(1);
    }
  }, [selectedDocId]);

  // Re-run validation action
  const handleRevalidate = async () => {
    if (!selectedDocId) return;
    setRevalidating(true);
    try {
      const summary = await api.validateDocument(selectedDocId);
      setValidationData(summary);
      const doc = await api.getDocumentById(selectedDocId);
      setDocumentData(doc);
      addToast('Validation engine re-executed! Results updated.', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setRevalidating(false);
    }
  };

  // Resolve an issue action
  const handleResolveIssue = async (issueId, e) => {
    if (e) e.stopPropagation();
    try {
      await api.resolveValidationIssue(issueId);
      addToast('Issue marked as resolved', 'success');
      // Refresh validation
      await fetchDocDetails(selectedDocId);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Mark all warnings as reviewed
  const handleMarkReviewed = async () => {
    try {
      await api.markReviewed(selectedDocId);
      addToast('Warnings acknowledged and document marked as reviewed', 'success');
      await fetchDocDetails(selectedDocId);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Save inline edit changes
  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      await api.updateExtraction(selectedDocId, editForm);
      addToast('Document data updated & re-validated successfully!', 'success');
      setEditDrawerOpen(false);
      await fetchDocDetails(selectedDocId);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  // Approve Document
  const handleApproveDocument = async () => {
    setApproving(true);
    try {
      await api.approveDocument(selectedDocId, 'Approved directly from Validation Centre');
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#20D69A', '#8AF0C7', '#ffffff']
      });
      addToast('Document Approved and finalized for general ledger export!', 'success');
      await fetchDocDetails(selectedDocId);
      loadDocuments();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setApproving(false);
    }
  };

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Derived counts and items
  const issuesList = validationData?.issues || [];
  const checksPassedList = validationData?.checks_passed || [];
  const extractedItems = documentData?.extracted_data?.items || [];

  // Dynamic calculated summary overview values
  const totalChecks = useMemo(() => {
    return checksPassedList.length + issuesList.length;
  }, [checksPassedList, issuesList]);

  const passedCount = checksPassedList.length;

  const criticalErrorsCount = useMemo(() => {
    return issuesList.filter((i) => i.severity === 'error' && !i.resolved).length;
  }, [issuesList]);

  const warningsCount = useMemo(() => {
    return issuesList.filter((i) => i.severity === 'warning' && !i.resolved).length;
  }, [issuesList]);

  const resolvedCount = useMemo(() => {
    return issuesList.filter((i) => i.resolved).length;
  }, [issuesList]);

  // Grouped issues
  const criticalErrors = useMemo(() => {
    return issuesList.filter((i) => i.severity === 'error');
  }, [issuesList]);

  const warnings = useMemo(() => {
    return issuesList.filter((i) => i.severity === 'warning');
  }, [issuesList]);

  const calculationIssues = useMemo(() => {
    return issuesList.filter((i) => i.category === 'calculation');
  }, [issuesList]);

  const duplicateIssues = useMemo(() => {
    return issuesList.filter((i) => i.category === 'duplicate');
  }, [issuesList]);

  const missingInfoIssues = useMemo(() => {
    return issuesList.filter((i) => i.category === 'missing_field');
  }, [issuesList]);

  // Filtered issues for the search and filter bar
  const filteredIssues = useMemo(() => {
    return issuesList.filter((iss) => {
      // Search
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        (iss.issue_type && iss.issue_type.toLowerCase().includes(searchLower)) ||
        (iss.issue_description && iss.issue_description.toLowerCase().includes(searchLower)) ||
        (iss.item_name && iss.item_name.toLowerCase().includes(searchLower)) ||
        (iss.field_name && iss.field_name.toLowerCase().includes(searchLower));

      // Severity
      const matchesSeverity =
        filterSeverity === 'All' ||
        iss.severity.toLowerCase() === filterSeverity.toLowerCase();

      // Category
      const matchesCategory =
        filterCategory === 'All' ||
        iss.category.toLowerCase() === filterCategory.toLowerCase();

      // Status
      const matchesStatus =
        filterStatus === 'All' ||
        (filterStatus === 'unresolved' && !iss.resolved) ||
        (filterStatus === 'resolved' && iss.resolved);

      return matchesSearch && matchesSeverity && matchesCategory && matchesStatus;
    });
  }, [issuesList, searchQuery, filterSeverity, filterCategory, filterStatus]);

  // Product-level line items validation logic
  const productValidationRows = useMemo(() => {
    return extractedItems.map((it, idx) => {
      const itemNum = idx + 1;
      const disc = it.discount || 0;
      const expectedTotal = Number((it.quantity * it.unit_price - disc).toFixed(2));
      const isMatched = Math.abs(expectedTotal - it.line_total) <= 0.05;
      return {
        index: itemNum,
        name: it.item_name,
        quantity: it.quantity,
        unitPrice: it.unit_price,
        discount: disc,
        lineTotal: it.line_total,
        expectedTotal,
        isMatched,
        confidence: it.confidence || 0.95
      };
    });
  }, [extractedItems]);

  const filteredProductRows = useMemo(() => {
    return productValidationRows.filter((row) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        row.name.toLowerCase().includes(q) ||
        `#${row.index}`.includes(q) ||
        row.index.toString() === q
      );
    });
  }, [productValidationRows, searchQuery]);

  // Pagination for product items
  const totalProductPages = Math.ceil(filteredProductRows.length / itemsPerPage) || 1;
  const paginatedProductRows = filteredProductRows.slice(
    (itemPage - 1) * itemsPerPage,
    itemPage * itemsPerPage
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* ---------------- 1. TOP HEADER & DOCUMENT SWITCHER ---------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#F4F7F5] tracking-tight">
              Validation Centre
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#20D69A]/15 text-[#20D69A] border border-[#20D69A]/30">
              AUDIT ENGINE
            </span>
          </div>
          <p className="text-xs text-[#929F98] mt-1">
            Real-time arithmetic checks, itemized product-level validations, duplicate detection, and approval gates.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setEditDrawerOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#151D19] border border-[#1D2B24] hover:border-[#8AF0C7]/40 text-xs font-semibold text-[#8AF0C7] flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Extracted Data</span>
          </button>

          <button
            onClick={handleRevalidate}
            disabled={revalidating}
            className="px-3.5 py-2 rounded-xl bg-[#151D19] border border-[#1D2B24] hover:border-[#20D69A]/40 text-xs font-semibold text-[#F4F7F5] flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#20D69A] ${revalidating ? 'animate-spin' : ''}`} />
            <span>Re-Run Validation</span>
          </button>

          {/* Conditional Approval Button */}
          <button
            onClick={handleApproveDocument}
            disabled={approving || criticalErrorsCount > 0 || documentData?.approval_status === 'Approved'}
            title={
              criticalErrorsCount > 0
                ? 'Approval blocked: Resolve critical errors first'
                : documentData?.approval_status === 'Approved'
                ? 'Document is already approved'
                : 'Approve and finalize record'
            }
            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              criticalErrorsCount > 0
                ? 'bg-[#1D1517] text-[#FF646D] border border-[#FF646D]/30 opacity-60 cursor-not-allowed'
                : documentData?.approval_status === 'Approved'
                ? 'bg-[#15241C] text-[#20D69A] border border-[#20D69A]/30 opacity-80 cursor-default'
                : 'bg-gradient-to-r from-[#20D69A] to-[#16B580] text-[#080B0A] shadow-[0_0_20px_rgba(32,214,154,0.3)] hover:shadow-[0_0_25px_rgba(32,214,154,0.45)]'
            }`}
          >
            {criticalErrorsCount > 0 ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Approval Blocked ({criticalErrorsCount} Errors)</span>
              </>
            ) : documentData?.approval_status === 'Approved' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Record Approved</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve & Finalize</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Document Selector & Details Strip */}
      <div className="p-4 rounded-xl bg-[#151D19] border border-[#1D2B24] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-[#929F98]">Active Document:</label>
          <select
            value={selectedDocId || ''}
            onChange={(e) => {
              setSelectedDocId(parseInt(e.target.value));
              navigate(`/validation/${e.target.value}`);
            }}
            className="bg-[#101613] border border-[#1D2B24] rounded-lg px-3 py-1.5 text-xs text-[#F4F7F5] font-semibold focus:outline-none focus:border-[#20D69A]/50"
          >
            {docList.map((d) => (
              <option key={d.id} value={d.id}>
                Doc #{d.id}: {d.original_name} ({d.approval_status})
              </option>
            ))}
          </select>
        </div>

        {documentData && (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-[#929F98]">Vendor:</span>
            <span className="font-bold text-[#F4F7F5]">
              {documentData.extracted_data?.vendor_name || 'N/A'}
            </span>
            <span className="text-[#929F98]">•</span>
            <span className="text-[#929F98]">Grand Total:</span>
            <span className="font-mono font-bold text-[#20D69A]">
              {documentData.extracted_data?.currency} {documentData.extracted_data?.grand_total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <StatusBadge status={documentData.approval_status} />
          </div>
        )}
      </div>

      {/* ---------------- 2. SUMMARY OVERVIEW CARDS (TOP OF PAGE) ---------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Checks */}
        <div className="p-5 rounded-2xl bg-[#151D19] border border-[#1D2B24] relative overflow-hidden group hover:border-[#20D69A]/30 transition-all">
          <div className="flex items-center justify-between text-xs text-[#929F98] font-medium uppercase tracking-wider">
            <span>Total Checks</span>
            <Calculator className="w-4 h-4 text-[#8AF0C7]" />
          </div>
          <div className="mt-3 text-3xl font-black text-[#F4F7F5] tracking-tight">{totalChecks}</div>
          <div className="mt-1 text-[11px] text-[#929F98]">
            Across formulas, {extractedItems.length} items & headers
          </div>
        </div>

        {/* Passed Checks */}
        <div className="p-5 rounded-2xl bg-[#151D19] border border-[#20D69A]/30 relative overflow-hidden group shadow-[0_0_15px_rgba(32,214,154,0.06)]">
          <div className="flex items-center justify-between text-xs text-[#20D69A] font-semibold uppercase tracking-wider">
            <span>Passed Checks</span>
            <CheckCircle2 className="w-4 h-4 text-[#20D69A]" />
          </div>
          <div className="mt-3 text-3xl font-black text-[#20D69A] tracking-tight">{passedCount}</div>
          <div className="mt-1 text-[11px] text-[#929F98]">
            Valid formulas & compliant fields
          </div>
        </div>

        {/* Warnings */}
        <div className="p-5 rounded-2xl bg-[#151D19] border border-[#F4B942]/30 relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs text-[#F4B942] font-semibold uppercase tracking-wider">
            <span>Warnings</span>
            <AlertTriangle className="w-4 h-4 text-[#F4B942]" />
          </div>
          <div className="mt-3 text-3xl font-black text-[#F4B942] tracking-tight">{warningsCount}</div>
          <div className="mt-1 text-[11px] text-[#929F98]">
            Non-blocking notices & timeline warnings
          </div>
        </div>

        {/* Critical Errors */}
        <div className={`p-5 rounded-2xl border relative overflow-hidden group transition-all ${
          criticalErrorsCount > 0 ? 'bg-[#1D1517] border-[#FF646D]/40' : 'bg-[#151D19] border-[#1D2B24]'
        }`}>
          <div className="flex items-center justify-between text-xs text-[#FF646D] font-semibold uppercase tracking-wider">
            <span>Critical Errors</span>
            <ShieldAlert className="w-4 h-4 text-[#FF646D]" />
          </div>
          <div className={`mt-3 text-3xl font-black tracking-tight ${criticalErrorsCount > 0 ? 'text-[#FF646D]' : 'text-[#F4F7F5]'}`}>
            {criticalErrorsCount}
          </div>
          <div className="mt-1 text-[11px] text-[#929F98]">
            {criticalErrorsCount > 0 ? 'Blocks approval until corrected' : 'No blocking calculation errors'}
          </div>
        </div>
      </div>

      {/* ---------------- 3. VIEW MODE TAB SELECTOR ---------------- */}
      <div className="flex items-center justify-between border-b border-[#1D2B24] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('findings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'findings'
                ? 'bg-[#20D69A] text-[#080B0A] shadow-[0_0_15px_rgba(32,214,154,0.3)]'
                : 'bg-[#151D19] text-[#929F98] hover:text-[#F4F7F5] border border-[#1D2B24]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Grouped Validation Findings ({issuesList.length + checksPassedList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'products'
                ? 'bg-[#20D69A] text-[#080B0A] shadow-[0_0_15px_rgba(32,214,154,0.3)]'
                : 'bg-[#151D19] text-[#929F98] hover:text-[#F4F7F5] border border-[#1D2B24]'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Product-Level Validation ({extractedItems.length} Line Items)</span>
          </button>
        </div>

        {/* Quick Mark Reviewed for Warnings */}
        {warningsCount > 0 && criticalErrorsCount === 0 && (
          <button
            onClick={handleMarkReviewed}
            className="text-xs font-semibold text-[#8AF0C7] hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <CheckSquare className="w-4 h-4 text-[#20D69A]" />
            <span>Acknowledge All Warnings & Mark Ready</span>
          </button>
        )}
      </div>

      {/* ---------------- 4. SEARCH AND FILTERS BAR ---------------- */}
      <div className="p-4 rounded-xl bg-[#151D19] border border-[#1D2B24] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#929F98]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'products' ? "Search product name or item #..." : "Search findings & descriptions..."}
            className="w-full bg-[#101613] border border-[#1D2B24] rounded-lg pl-9 pr-3 py-2 text-[#F4F7F5] focus:outline-none focus:border-[#20D69A]/50"
          />
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#929F98] shrink-0" />
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="w-full bg-[#101613] border border-[#1D2B24] rounded-lg px-3 py-2 text-[#F4F7F5] focus:outline-none focus:border-[#20D69A]/50"
          >
            <option value="All">All Severities</option>
            <option value="error">Critical Errors ({criticalErrors.length})</option>
            <option value="warning">Warnings ({warnings.length})</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-[#101613] border border-[#1D2B24] rounded-lg px-3 py-2 text-[#F4F7F5] focus:outline-none focus:border-[#20D69A]/50"
          >
            <option value="All">All Categories</option>
            <option value="calculation">Calculation ({calculationIssues.length})</option>
            <option value="duplicate">Duplicate Detection ({duplicateIssues.length})</option>
            <option value="missing_field">Missing Information ({missingInfoIssues.length})</option>
            <option value="date">Date Sanity</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-[#101613] border border-[#1D2B24] rounded-lg px-3 py-2 text-[#F4F7F5] focus:outline-none focus:border-[#20D69A]/50"
          >
            <option value="All">All Statuses</option>
            <option value="unresolved">Unresolved ({criticalErrorsCount + warningsCount})</option>
            <option value="resolved">Resolved ({resolvedCount})</option>
          </select>
        </div>
      </div>

      {/* ---------------- 5. VIEW A: GROUPED VALIDATION FINDINGS ---------------- */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          {/* Section A: Critical Errors */}
          <div className="rounded-2xl bg-[#151D19] border border-[#1D2B24] overflow-hidden">
            <button
              onClick={() => toggleSection('errors')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-[#1A2520]/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FF646D]/20 text-[#FF646D] flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F4F7F5]">A. Critical Errors</h3>
                  <p className="text-[11px] text-[#929F98]">
                    Mathematical discrepancies and missing mandatory fields blocking ledger approval
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  criticalErrors.length > 0 ? 'bg-[#FF646D]/20 text-[#FF646D] border border-[#FF646D]/30' : 'bg-[#1D2B24] text-[#929F98]'
                }`}>
                  {criticalErrors.length}
                </span>
                {openSections.errors ? <ChevronUp className="w-4 h-4 text-[#929F98]" /> : <ChevronDown className="w-4 h-4 text-[#929F98]" />}
              </div>
            </button>

            {openSections.errors && (
              <div className="p-4 pt-0 border-t border-[#1D2B24] space-y-3">
                {criticalErrors.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#20D69A] flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>No critical errors detected. Accounting ledger integrity is preserved.</span>
                  </div>
                ) : (
                  criticalErrors.map((issue) => (
                    <IssueItemCard
                      key={issue.id}
                      issue={issue}
                      onSelectFinding={() => setSelectedFinding(issue)}
                      onResolve={() => handleResolveIssue(issue.id)}
                      onEdit={() => setEditDrawerOpen(true)}
                    />
                  ))
                )}
              </div>
            )}
          </div>

          {/* Section B: Warnings */}
          <div className="rounded-2xl bg-[#151D19] border border-[#1D2B24] overflow-hidden">
            <button
              onClick={() => toggleSection('warnings')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-[#1A2520]/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F4B942]/20 text-[#F4B942] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F4F7F5]">B. Warnings & Notice Discrepancies</h3>
                  <p className="text-[11px] text-[#929F98]">
                    Line rate adjustments, date notices, and non-blocking variance alerts
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  warnings.length > 0 ? 'bg-[#F4B942]/20 text-[#F4B942] border border-[#F4B942]/30' : 'bg-[#1D2B24] text-[#929F98]'
                }`}>
                  {warnings.length}
                </span>
                {openSections.warnings ? <ChevronUp className="w-4 h-4 text-[#929F98]" /> : <ChevronDown className="w-4 h-4 text-[#929F98]" />}
              </div>
            </button>

            {openSections.warnings && (
              <div className="p-4 pt-0 border-t border-[#1D2B24] space-y-3">
                {warnings.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#20D69A] flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>No warning notices flagged for this document.</span>
                  </div>
                ) : (
                  warnings.map((issue) => (
                    <IssueItemCard
                      key={issue.id}
                      issue={issue}
                      onSelectFinding={() => setSelectedFinding(issue)}
                      onResolve={() => handleResolveIssue(issue.id)}
                      onEdit={() => setEditDrawerOpen(true)}
                    />
                  ))
                )}
              </div>
            )}
          </div>

          {/* Section C: Duplicate Detection */}
          <div className="rounded-2xl bg-[#151D19] border border-[#1D2B24] overflow-hidden">
            <button
              onClick={() => toggleSection('duplicates')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-[#1A2520]/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#8AF0C7]/20 text-[#8AF0C7] flex items-center justify-center shrink-0">
                  <CopyCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F4F7F5]">C. Duplicate Collision Detection</h3>
                  <p className="text-[11px] text-[#929F98]">
                    Cross-referencing invoice identifiers, vendor profiles, and grand totals across repository
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  duplicateIssues.length > 0 ? 'bg-[#FF646D]/20 text-[#FF646D] border border-[#FF646D]/30' : 'bg-[#1D2B24] text-[#929F98]'
                }`}>
                  {duplicateIssues.length}
                </span>
                {openSections.duplicates ? <ChevronUp className="w-4 h-4 text-[#929F98]" /> : <ChevronDown className="w-4 h-4 text-[#929F98]" />}
              </div>
            </button>

            {openSections.duplicates && (
              <div className="p-4 pt-0 border-t border-[#1D2B24] space-y-3">
                {duplicateIssues.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#20D69A] flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>No duplicate submissions found. Record is unique.</span>
                  </div>
                ) : (
                  duplicateIssues.map((issue) => (
                    <IssueItemCard
                      key={issue.id}
                      issue={issue}
                      onSelectFinding={() => setSelectedFinding(issue)}
                      onResolve={() => handleResolveIssue(issue.id)}
                      onEdit={() => navigate('/duplicates')}
                    />
                  ))
                )}
              </div>
            )}
          </div>

          {/* Section D: Passed Checks */}
          <div className="rounded-2xl bg-[#151D19] border border-[#1D2B24] overflow-hidden">
            <button
              onClick={() => toggleSection('passed')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-[#1A2520]/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#20D69A]/20 text-[#20D69A] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F4F7F5]">D. Verified & Passed Checks</h3>
                  <p className="text-[11px] text-[#929F98]">
                    Successfully matched rules and verified calculations
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#20D69A]/20 text-[#20D69A] border border-[#20D69A]/30">
                  {checksPassedList.length}
                </span>
                {openSections.passed ? <ChevronUp className="w-4 h-4 text-[#929F98]" /> : <ChevronDown className="w-4 h-4 text-[#929F98]" />}
              </div>
            </button>

            {openSections.passed && (
              <div className="p-4 pt-0 border-t border-[#1D2B24]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {checksPassedList.map((chk, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-[#101613] border border-[#1D2B24]">
                      <div className="w-4 h-4 rounded-full bg-[#20D69A]/20 text-[#20D69A] flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="text-[#F4F7F5]">{chk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- 6. VIEW B: PRODUCT-LEVEL LINE ITEMS VALIDATION ---------------- */}
      {activeTab === 'products' && (
        <div className="rounded-2xl bg-[#151D19] border border-[#1D2B24] overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#F4F7F5] flex items-center gap-2">
                <span>Product-Level Arithmetic Validation Ledger</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#20D69A]/15 text-[#20D69A]">
                  {extractedItems.length} Products Accounted
                </span>
              </h3>
              <p className="text-xs text-[#929F98] mt-0.5">
                Every line item is audited: <code className="text-[#8AF0C7]">Quantity × Unit Rate - Discount = Line Total</code>
              </p>
            </div>

            <div className="text-xs text-[#929F98]">
              Showing {filteredProductRows.length} matching products
            </div>
          </div>

          {/* Line items table */}
          <div className="overflow-x-auto rounded-xl border border-[#1D2B24]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#101613] text-[#929F98] uppercase text-[10px] font-semibold border-b border-[#1D2B24]">
                <tr>
                  <th className="py-2.5 px-3 text-center w-12">#</th>
                  <th className="py-2.5 px-3">Product Name / Description</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Rate</th>
                  <th className="py-2.5 px-3 text-right">Discount</th>
                  <th className="py-2.5 px-3 text-right">Extracted Total</th>
                  <th className="py-2.5 px-3 text-center">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D2B24]">
                {paginatedProductRows.map((row) => (
                  <tr key={row.index} className="hover:bg-[#1A2520]/50 transition-colors">
                    <td className="py-2.5 px-3 text-center font-mono text-[#929F98]">{row.index}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#F4F7F5]">
                      <div className="truncate max-w-[280px]">{row.name}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center text-[#F4F7F5]">{row.quantity}</td>
                    <td className="py-2.5 px-3 text-right text-[#929F98]">
                      {row.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#20D69A]">
                      {row.discount > 0 ? `-${row.discount.toFixed(2)}` : '0.00'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#F4F7F5]">
                      {row.lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {row.isMatched ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#20D69A]/15 text-[#20D69A] border border-[#20D69A]/30">
                          <Check className="w-3 h-3 stroke-[3]" /> Balanced
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF646D]/15 text-[#FF646D] border border-[#FF646D]/30">
                          <AlertTriangle className="w-3 h-3" /> Mismatch
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between text-xs text-[#929F98] pt-2">
            <span>
              Page {itemPage} of {totalProductPages} ({filteredProductRows.length} items)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setItemPage((p) => Math.max(p - 1, 1))}
                disabled={itemPage === 1}
                className="p-1.5 rounded-lg bg-[#101613] border border-[#1D2B24] disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-[#F4F7F5]">{itemPage}</span>
              <button
                onClick={() => setItemPage((p) => Math.min(p + 1, totalProductPages))}
                disabled={itemPage === totalProductPages}
                className="p-1.5 rounded-lg bg-[#101613] border border-[#1D2B24] disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- 7. FINDING DETAILS MODAL ---------------- */}
      {selectedFinding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#151D19] border border-[#1D2B24] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-[#1D2B24]">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  selectedFinding.severity === 'error' ? 'bg-[#FF646D]/20 text-[#FF646D]' : 'bg-[#F4B942]/20 text-[#F4B942]'
                }`}>
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F4F7F5]">{selectedFinding.issue_type}</h3>
                  <span className="text-[10px] text-[#929F98] uppercase">Category: {selectedFinding.category}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedFinding(null)}
                className="text-[#929F98] hover:text-[#F4F7F5] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#929F98] font-semibold">Explanation:</span>
                <p className="text-[#F4F7F5] mt-1 leading-relaxed bg-[#101613] p-3 rounded-xl border border-[#1D2B24]">
                  {selectedFinding.issue_description}
                </p>
              </div>

              {selectedFinding.item_name && (
                <div className="p-3 rounded-xl bg-[#101613] border border-[#1D2B24] flex items-center justify-between">
                  <span className="text-[#929F98]">Associated Line Item:</span>
                  <span className="font-semibold text-[#8AF0C7]">
                    #{selectedFinding.item_index}: {selectedFinding.item_name}
                  </span>
                </div>
              )}

              {(selectedFinding.expected_value || selectedFinding.actual_value) && (
                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="p-3 rounded-xl bg-[#101613] border border-[#20D69A]/30">
                    <span className="text-[10px] text-[#929F98] uppercase">Expected Value</span>
                    <p className="text-sm font-bold text-[#20D69A] mt-0.5">{selectedFinding.expected_value}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#101613] border border-[#FF646D]/30">
                    <span className="text-[10px] text-[#929F98] uppercase">Extracted Value</span>
                    <p className="text-sm font-bold text-[#FF646D] mt-0.5">{selectedFinding.actual_value}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1D2B24]">
              <button
                onClick={() => setSelectedFinding(null)}
                className="px-4 py-2 rounded-xl text-xs text-[#929F98] hover:text-[#F4F7F5]"
              >
                Close
              </button>
              {!selectedFinding.resolved && (
                <button
                  onClick={() => {
                    handleResolveIssue(selectedFinding.id);
                    setSelectedFinding(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#20D69A] text-[#080B0A] font-bold text-xs uppercase cursor-pointer"
                >
                  Mark as Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- 8. QUICK EDIT DATA DRAWER / MODAL ---------------- */}
      {editDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-[#151D19] border border-[#1D2B24] shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#1D2B24]">
              <div>
                <h3 className="text-base font-bold text-[#F4F7F5]">Correct Document Figures</h3>
                <p className="text-xs text-[#929F98]">Update extracted totals to resolve mathematical discrepancies</p>
              </div>
              <button
                onClick={() => setEditDrawerOpen(false)}
                className="text-[#929F98] hover:text-[#F4F7F5] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="text-[#929F98] font-semibold mb-1 block">Subtotal</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.subtotal}
                  onChange={(e) => setEditForm({ ...editForm, subtotal: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#101613] border border-[#1D2B24] rounded-lg px-3 py-2 text-[#F4F7F5] font-semibold"
                />
              </div>

              <div>
                <label className="text-[#929F98] font-semibold mb-1 block">Tax Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.tax_amount}
                  onChange={(e) => setEditForm({ ...editForm, tax_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#101613] border border-[#1D2B24] rounded-lg px-3 py-2 text-[#F4F7F5] font-semibold"
                />
              </div>

              <div>
                <label className="text-[#929F98] font-semibold mb-1 block">Discount</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.discount}
                  onChange={(e) => setEditForm({ ...editForm, discount: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#101613] border border-[#1D2B24] rounded-lg px-3 py-2 text-[#20D69A] font-semibold"
                />
              </div>

              <div>
                <label className="text-[#929F98] font-semibold mb-1 block font-bold text-[#20D69A]">Grand Total</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.grand_total}
                  onChange={(e) => setEditForm({ ...editForm, grand_total: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#101613] border border-[#20D69A]/40 rounded-lg px-3 py-2 text-[#20D69A] font-black text-sm"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#101613] border border-[#1D2B24] text-xs font-mono text-[#929F98]">
              Expected Formula: Subtotal ({editForm.subtotal}) + Tax ({editForm.tax_amount}) - Discount ({editForm.discount}) ={' '}
              <strong className="text-[#20D69A]">
                {(editForm.subtotal + editForm.tax_amount - editForm.discount).toFixed(2)}
              </strong>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1D2B24]">
              <button
                onClick={() => setEditDrawerOpen(false)}
                className="px-4 py-2 text-xs text-[#929F98] hover:text-[#F4F7F5]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#20D69A] to-[#16B580] text-[#080B0A] font-bold text-xs uppercase flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(32,214,154,0.3)]"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingEdit ? 'Saving & Re-validating...' : 'Save & Re-run Validation'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Finding / Issue Card Component
function IssueItemCard({ issue, onSelectFinding, onResolve, onEdit }) {
  return (
    <div
      onClick={onSelectFinding}
      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        issue.resolved
          ? 'bg-[#101613]/60 border-[#1D2B24] opacity-60'
          : issue.severity === 'error'
          ? 'bg-[#1A1214] border-[#FF646D]/30 hover:border-[#FF646D]/50'
          : 'bg-[#1A1712] border-[#F4B942]/30 hover:border-[#F4B942]/50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
            issue.resolved
              ? 'bg-[#20D69A]/20 text-[#20D69A]'
              : issue.severity === 'error'
              ? 'bg-[#FF646D]/20 text-[#FF646D]'
              : 'bg-[#F4B942]/20 text-[#F4B942]'
          }`}
        >
          {issue.resolved ? (
            <Check className="w-4 h-4 stroke-[3]" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#F4F7F5]">{issue.issue_type}</span>
            {issue.item_name && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#101613] text-[#8AF0C7] border border-[#1D2B24]">
                Item #{issue.item_index}: {issue.item_name}
              </span>
            )}
            <span
              className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                issue.resolved
                  ? 'bg-[#20D69A]/20 text-[#20D69A]'
                  : issue.severity === 'error'
                  ? 'bg-[#FF646D]/20 text-[#FF646D]'
                  : 'bg-[#F4B942]/20 text-[#F4B942]'
              }`}
            >
              {issue.resolved ? 'RESOLVED' : issue.severity}
            </span>
          </div>

          <p className="text-xs text-[#929F98] leading-relaxed line-clamp-2">
            {issue.issue_description}
          </p>

          {(issue.expected_value || issue.actual_value) && (
            <div className="flex items-center gap-3 text-[11px] font-mono pt-1">
              <span className="text-[#929F98]">Expected: <strong className="text-[#20D69A]">{issue.expected_value}</strong></span>
              <span className="text-[#929F98]">vs</span>
              <span className="text-[#929F98]">Found: <strong className="text-[#FF646D]">{issue.actual_value}</strong></span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="px-2.5 py-1.5 rounded-lg bg-[#151D19] border border-[#1D2B24] hover:border-[#8AF0C7]/40 text-[11px] font-semibold text-[#8AF0C7]"
        >
          Fix Data
        </button>

        {!issue.resolved && (
          <button
            onClick={onResolve}
            className="px-2.5 py-1.5 rounded-lg bg-[#20D69A]/15 hover:bg-[#20D69A]/25 border border-[#20D69A]/30 text-[11px] font-bold text-[#20D69A]"
          >
            Resolve
          </button>
        )}
      </div>
    </div>
  );
}
