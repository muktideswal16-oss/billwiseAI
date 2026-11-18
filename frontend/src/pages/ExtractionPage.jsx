import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Save,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Plus,
  Trash2,
  RefreshCw,
  Cpu,
  FileSpreadsheet,
  CheckCircle2,
  HelpCircle,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import ConfidenceBadge from '../components/ConfidenceBadge';
import StatusBadge from '../components/StatusBadge';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function ExtractionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [docList, setDocList] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(id ? parseInt(id) : null);
  const [documentData, setDocumentData] = useState(null);
  const [formData, setFormData] = useState({
    vendor_name: '',
    invoice_number: '',
    invoice_date: '',
    due_date: '',
    purchase_order_number: '',
    payment_terms: 'Net 30',
    subtotal: 0,
    tax_amount: 0,
    discount: 0,
    grand_total: 0,
    currency: 'USD',
    items: []
  });
  const [fieldConfidences, setFieldConfidences] = useState({});
  const [overallConfidence, setOverallConfidence] = useState(0.9);
  const [extractionMethod, setExtractionMethod] = useState('AI_OCR_ENGINE');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Load document list for picker
  useEffect(() => {
    api.getDocuments()
      .then((docs) => {
        setDocList(docs);
        if (!selectedDocId && docs.length > 0) {
          setSelectedDocId(docs[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // When selectedDocId changes, load its details
  useEffect(() => {
    if (!selectedDocId) return;
    setLoading(true);
    api.getDocumentById(selectedDocId)
      .then((doc) => {
        setDocumentData(doc);
        const ext = doc.extracted_data;
        if (ext) {
          setFormData({
            vendor_name: ext.vendor_name || '',
            invoice_number: ext.invoice_number || '',
            invoice_date: ext.invoice_date || '',
            due_date: ext.due_date || '',
            purchase_order_number: ext.purchase_order_number || '',
            payment_terms: ext.payment_terms || 'Net 30',
            subtotal: ext.subtotal || 0,
            tax_amount: ext.tax_amount || 0,
            discount: ext.discount || 0,
            grand_total: ext.grand_total || 0,
            currency: ext.currency || 'USD',
            items: ext.items ? ext.items.map(it => ({
              item_name: it.item_name,
              description: it.description || '',
              quantity: it.quantity,
              unit_price: it.unit_price,
              tax: it.tax,
              line_total: it.line_total,
              confidence: it.confidence || 0.95
            })) : []
          });
          setFieldConfidences(ext.field_confidences || {});
          setOverallConfidence(ext.confidence_score || 0.9);
          setExtractionMethod(ext.extraction_method || 'AI_OCR_ENGINE');
        }
      })
      .catch((err) => addToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [selectedDocId]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index] = { ...updated[index], [field]: value };
    // Recalculate line total if qty or unit price changed
    if (field === 'quantity' || field === 'unit_price') {
      const q = parseFloat(field === 'quantity' ? value : updated[index].quantity) || 0;
      const u = parseFloat(field === 'unit_price' ? value : updated[index].unit_price) || 0;
      updated[index].line_total = parseFloat((q * u).toFixed(2));
    }
    setFormData((prev) => ({ ...prev, items: updated }));
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          item_name: 'New Line Item',
          description: 'Description',
          quantity: 1,
          unit_price: 0,
          tax: 0,
          line_total: 0,
          confidence: 1.0
        }
      ]
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      await api.updateExtraction(selectedDocId, formData);
      addToast('Extraction changes saved & confidence updated to 100% human-verified', 'success');
      // Reload document data
      const doc = await api.getDocumentById(selectedDocId);
      setDocumentData(doc);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRunValidation = async () => {
    setSaving(true);
    try {
      await api.updateExtraction(selectedDocId, formData);
      const val = await api.validateDocument(selectedDocId);
      if (val.status === 'PASSED') {
        addToast('Validation Passed! All formulas and checksums match perfectly.', 'success');
      } else {
        addToast(`Validation: ${val.errors_count} errors, ${val.warnings_count} warnings detected.`, 'warning');
      }
      navigate(`/validation/${selectedDocId}`);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#151D19] border border-[#1D2B24]">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-[#929F98]">Select Ingested Document:</label>
          <select
            value={selectedDocId || ''}
            onChange={(e) => {
              setSelectedDocId(parseInt(e.target.value));
              navigate(`/extraction/${e.target.value}`);
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

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#929F98] hidden md:inline">
            Extraction Engine:
          </span>
          <span className="px-2.5 py-1 rounded bg-[#20D69A]/15 text-[#20D69A] border border-[#20D69A]/30 text-xs font-bold font-mono">
            {extractionMethod}
          </span>
          <ConfidenceBadge score={overallConfidence} label="Overall Score" />
        </div>
      </div>

      {/* Split Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Document Preview */}
        <div className="lg:col-span-5 flex flex-col rounded-2xl bg-[#151D19] border border-[#1D2B24] overflow-hidden sticky top-20 max-h-[85vh]">
          {/* Preview Toolbar */}
          <div className="p-3 border-b border-[#1D2B24] bg-[#101613] flex items-center justify-between text-xs text-[#929F98]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#20D69A]" />
              <span className="font-semibold text-[#F4F7F5] truncate max-w-[200px]">
                {documentData?.original_name || 'Document Preview'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 15, 60))}
                className="p-1.5 rounded hover:bg-[#1D2B24] text-[#929F98] hover:text-[#F4F7F5]"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 15, 160))}
                className="p-1.5 rounded hover:bg-[#1D2B24] text-[#929F98] hover:text-[#F4F7F5]"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Document Content Box */}
          <div className="flex-1 p-4 overflow-auto bg-[#080B0A]/80 flex items-center justify-center">
            {documentData?.preview_url ? (
              <div
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                className="transition-transform duration-150 w-full"
              >
                <img
                  src={documentData.preview_url}
                  alt="Invoice Document Preview"
                  className="w-full rounded-lg shadow-2xl border border-[#1D2B24]"
                />
              </div>
            ) : (
              <div className="text-center p-8 text-xs text-[#929F98]">
                <FileText className="w-10 h-10 mx-auto text-[#20D69A] mb-2 opacity-60" />
                <span>Text-based record stream available in right panel</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Structured Extracted Fields */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Document Information */}
          <div className="p-6 rounded-2xl bg-[#151D19] border border-[#1D2B24] space-y-4">
            <div className="flex items-center justify-between border-b border-[#1D2B24] pb-3">
              <h3 className="text-sm font-bold text-[#F4F7F5] uppercase tracking-wider flex items-center gap-2">
                <span>1. Document Information</span>
              </h3>
              <span className="text-[11px] text-[#929F98]">Click any field to edit</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#929F98] font-semibold">Vendor Name</label>
                  <ConfidenceBadge score={fieldConfidences.vendor_name ?? 0.95} />
                </div>
                <input
                  type="text"
                  value={formData.vendor_name}
                  onChange={(e) => handleFieldChange('vendor_name', e.target.value)}
                  className="w-full bg-[#101613] border border-[#1D2B24] rounded-lg px-3 py-2 text-[#F4F7F5] font-semibold focus:outline-none focus:border-[#20D69A]/50"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#929F98] font-semibold">Invoice Number</label>
                  <ConfidenceBadge score={fieldConfidences.invoice_number ?? 0.95} />
                </div>
                <input
                  type="text"
                  value={formData.invoice_number}
                  onChange={(e) => handleFieldChange('invoice_number', e.target.value)}
                  className="w-full bg-[#101613] border border-[#1D2B24] rounded-lg px-3 py-2 text-[#F4F7F5] font-mono font-semibold focus:outline-none focus:border-[#20D69A]/50"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#929F98] font-semibold">Invoice Date</label>
                  <ConfidenceBadge score={fieldConfidences.invoice_date ?? 0.94} />
                </div>
                <input
                  type="date"
                  value={formData.invoice_date}
                  onChange={(e) => handleFieldChange('invoice_date', e.target.value)}
                  className="w-full bg-[#101613] border border-[#1D2B24] rounded-lg px-3 py-2 text-[#F4F7F5] focus:outline-none focus:border-[#20D69A]/50"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#929F98] font-semibold">Due Date</label>
                  <ConfidenceBadge score={fieldConfidences.due_date ?? 0.92} />
                </div>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => handleFieldChange('due_date', e.target.value)}
                  className="w-full bg-[#101613] border border-[#1D2B24] rounded-lg px-3 py-2 text-[#F4F7F5] focus:outline-none focus:border-[#20D69A]/50"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#929F98] font-semibold">Purchase Order (PO#)</label>
                  <ConfidenceBadge score={fieldConfidences.purchase_order_number ?? 0.9} />
                </div>
                <input
                  type="text"
                  value={formData.purchase_order_number}
                  onChange={(e) => handleFieldChange('purchase_order_number', e.target.value)}
                  placeholder="PO-XXXXX"
                  className="w-full bg-[#101613] border border-[#1D2B24] rounded-lg px-3 py-2 text-[#F4F7F5] font-mono focus:outline-none focus:border-[#20D69A]/50"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#929F98] font-semibold">Payment Terms</label>
                  <ConfidenceBadge score={0.99} />
                </div>
                <input
                  type="text"
                  value={formData.payment_terms}
                  onChange={(e) => handleFieldChange('payment_terms', e.target.value)}
                  className="w-full bg-[#101613] border border-[#1D2B24] rounded-lg px-3 py-2 text-[#F4F7F5] focus:outline-none focus:border-[#20D69A]/50"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Item Information */}
          <div className="p-6 rounded-2xl bg-[#151D19] border border-[#1D2B24] space-y-4">
            <div className="flex items-center justify-between border-b border-[#1D2B24] pb-3">
              <h3 className="text-sm font-bold text-[#F4F7F5] uppercase tracking-wider">
                2. Itemized Line Entries ({formData.items.length})
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-2.5 py-1 rounded bg-[#20D69A]/15 text-[#20D69A] border border-[#20D69A]/30 text-xs font-semibold flex items-center gap-1 hover:bg-[#20D69A]/25 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.items.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#101613] border border-[#1D2B24] space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={item.item_name}
                      onChange={(e) => handleItemChange(idx, 'item_name', e.target.value)}
                      placeholder="Item name / service"
                      className="flex-1 bg-[#151D19] border border-[#1D2B24] rounded-lg px-2.5 py-1 text-xs text-[#F4F7F5] font-semibold"
                    />
                    <ConfidenceBadge score={item.confidence ?? 0.95} />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 rounded text-[#929F98] hover:text-[#FF646D]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={item.description || ''}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                    placeholder="Item description / details"
                    className="w-full bg-[#151D19] border border-[#1D2B24] rounded-lg px-2.5 py-1 text-[11px] text-[#929F98]"
                  />

                  <div className="grid grid-cols-4 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-[#929F98] uppercase">Qty</span>
                      <input
                        type="number"
                        step="any"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#151D19] border border-[#1D2B24] rounded px-2 py-1 text-[#F4F7F5]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#929F98] uppercase">Rate</span>
                      <input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#151D19] border border-[#1D2B24] rounded px-2 py-1 text-[#F4F7F5]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#929F98] uppercase">Tax</span>
                      <input
                        type="number"
                        step="0.01"
                        value={item.tax}
                        onChange={(e) => handleItemChange(idx, 'tax', parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#151D19] border border-[#1D2B24] rounded px-2 py-1 text-[#F4F7F5]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#929F98] uppercase">Total</span>
                      <input
                        type="number"
                        step="0.01"
                        value={item.line_total}
                        onChange={(e) => handleItemChange(idx, 'line_total', parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#151D19] border border-[#1D2B24] rounded px-2 py-1 text-[#20D69A] font-bold"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Financial Totals */}
          <div className="p-6 rounded-2xl bg-[#151D19] border border-[#1D2B24] space-y-4">
            <div className="flex items-center justify-between border-b border-[#1D2B24] pb-3">
              <h3 className="text-sm font-bold text-[#F4F7F5] uppercase tracking-wider">
                3. Financial Summary & Totals
              </h3>
              <span className="text-xs font-semibold text-[#8AF0C7]">Currency: {formData.currency}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#929F98]">Subtotal</span>
                  <ConfidenceBadge score={fieldConfidences.subtotal ?? 0.95} />
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={formData.subtotal}
                  onChange={(e) => handleFieldChange('subtotal', parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#101613] border border-[#1D2B24] rounded-lg px-3 py-2 text-[#F4F7F5] font-semibold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#929F98]">Tax Amount</span>
                  <ConfidenceBadge score={fieldConfidences.tax_amount ?? 0.9} />
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={formData.tax_amount}
                  onChange={(e) => handleFieldChange('tax_amount', parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#101613] border border-[#1D2B24] rounded-lg px-3 py-2 text-[#F4F7F5] font-semibold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#929F98]">Discount</span>
                  <ConfidenceBadge score={fieldConfidences.discount ?? 0.9} />
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={formData.discount}
                  onChange={(e) => handleFieldChange('discount', parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#101613] border border-[#1D2B24] rounded-lg px-3 py-2 text-[#20D69A] font-semibold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#929F98] font-bold">Grand Total</span>
                  <ConfidenceBadge score={fieldConfidences.grand_total ?? 0.98} />
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={formData.grand_total}
                  onChange={(e) => handleFieldChange('grand_total', parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#101613] border border-[#20D69A]/40 rounded-lg px-3 py-2 text-[#20D69A] font-extrabold text-sm"
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#151D19] border border-[#1D2B24]">
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl bg-[#101613] hover:bg-[#1D2B24] border border-[#1D2B24] text-xs font-semibold text-[#F4F7F5] flex items-center gap-2 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4 text-[#8AF0C7]" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRunValidation}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#20D69A] to-[#16B580] text-[#080B0A] font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(32,214,154,0.3)] hover:shadow-[0_0_25px_rgba(32,214,154,0.45)] flex items-center gap-2 cursor-pointer transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Run Validation Engine</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

