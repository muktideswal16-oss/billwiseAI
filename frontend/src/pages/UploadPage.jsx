import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  X,
  FileCheck2,
  Scan,
  Cpu,
  Layers,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function UploadPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState('Invoice');
  const [uploading, setUploading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);

  const pipelineSteps = [
    { title: 'Ingesting File', desc: 'Secure payload streaming' },
    { title: 'Preprocessing Image', desc: 'Contrast & Otsu noise filter' },
    { title: 'OCR Recognition', desc: 'Tesseract & text rastering' },
    { title: 'Intelligent Extraction', desc: 'Entity regex & field mapping' },
    { title: 'Rule-Based Validation', desc: 'Math formula & duplicate test' },
    { title: 'Human Review Ready', desc: 'Prepared for verification' },
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|png|jpe?g|svg)$/i)) {
      addToast('Invalid file format. Please upload PDF, PNG, JPG, or JPEG.', 'error');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      addToast('File exceeds 15MB limit.', 'error');
      return;
    }
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const simulatePipeline = async (docId) => {
    for (let step = 0; step < pipelineSteps.length; step++) {
      setActiveStep(step);
      await new Promise((r) => setTimeout(r, 450));
    }
    addToast('Document processed and validated successfully!', 'success');
    navigate(`/extraction/${docId}`);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('document_type', docType);

      const res = await api.uploadDocument(formData);
      await simulatePipeline(res.id);
    } catch (err) {
      addToast(err.message, 'error');
      setUploading(false);
    }
  };

  const handleLoadSample = async (sampleKey, label) => {
    setUploading(true);
    try {
      addToast(`Loading sample invoice: ${label}...`, 'info');
      const res = await api.loadSample(sampleKey);
      await simulatePipeline(res.id);
    } catch (err) {
      addToast(err.message, 'error');
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#F4F7F5] tracking-tight">
          Document Ingestion Centre
        </h1>
        <p className="text-xs text-[#929F98] mt-1">
          Upload commercial invoices, receipts, and purchase orders for automated OCR and validation.
        </p>
      </div>

      {/* ---------------- HACKATHON SAMPLE SHOWCASE BUTTONS ---------------- */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#14231B] via-[#101814] to-[#14231B] border border-[#20D69A]/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#20D69A]" />
            <span className="text-sm font-bold text-[#F4F7F5]">
              Quick-Load Hackathon Test Scenarios
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#20D69A]/20 text-[#20D69A]">
            Deterministic Judge Presets
          </span>
        </div>
        <p className="text-xs text-[#929F98]">
          Click any preset below to demonstrate instant OCR, math error detection, or duplicate flagging without preparing a file:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <button
            onClick={() => handleLoadSample('clean_valid', 'Apex Cloud Solutions')}
            disabled={uploading}
            className="p-4 rounded-xl bg-[#151D19] border border-[#1D2B24] hover:border-[#20D69A]/60 text-left transition-all hover:bg-[#1A2520] group cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-bold text-[#20D69A]">
              <span>Scenario 1: Clean & Valid</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs font-bold text-[#F4F7F5] mt-1">Apex Cloud Solutions</p>
            <p className="text-[11px] text-[#929F98] mt-0.5">
              3 items, 10% tax, perfectly balanced grand total ($2,595.00).
            </p>
          </button>

          <button
            onClick={() => handleLoadSample('incorrect_total', 'Vanguard Supplies')}
            disabled={uploading}
            className="p-4 rounded-xl bg-[#151D19] border border-[#1D2B24] hover:border-[#F4B942]/60 text-left transition-all hover:bg-[#1A2520] group cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-bold text-[#F4B942]">
              <span>Scenario 2: Math Discrepancy</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs font-bold text-[#F4F7F5] mt-1">Vanguard Office Supplies</p>
            <p className="text-[11px] text-[#929F98] mt-0.5">
              Item sum is $850.00 but invoice recorded $950.00. Triggers warning!
            </p>
          </button>

          <button
            onClick={() => handleLoadSample('duplicate_invoice', 'Apex Duplicate')}
            disabled={uploading}
            className="p-4 rounded-xl bg-[#151D19] border border-[#1D2B24] hover:border-[#FF646D]/60 text-left transition-all hover:bg-[#1A2520] group cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-bold text-[#FF646D]">
              <span>Scenario 3: Duplicate Record</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs font-bold text-[#F4F7F5] mt-1">Apex Cloud (Duplicate)</p>
            <p className="text-[11px] text-[#929F98] mt-0.5">
              Matches INV-2024-0891. Duplicate detector flags 100% collision!
            </p>
          </button>
        </div>
      </div>

      {/* ---------------- DRAG & DROP UPLOAD ZONE ---------------- */}
      <div className="p-8 rounded-2xl bg-[#151D19] border border-[#1D2B24] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-[#929F98]">Document Type:</label>
            <div className="flex rounded-lg bg-[#101613] p-1 border border-[#1D2B24]">
              {['Invoice', 'Receipt', 'Purchase Order'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setDocType(type)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    docType === type ? 'bg-[#20D69A] text-[#080B0A] font-bold' : 'text-[#929F98]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <span className="text-[11px] text-[#929F98]">Supported: PDF, PNG, JPG, JPEG (Max 15MB)</span>
        </div>

        {/* Drop Zone Box */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[220px] ${
            dragActive
              ? 'border-[#20D69A] bg-[#20D69A]/5 scale-[1.01]'
              : 'border-[#1D2B24] hover:border-[#20D69A]/40 bg-[#101613]/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.svg"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelected(e.target.files[0]);
              }
            }}
          />

          {uploading ? (
            /* Animated Scanner Effect */
            <div className="space-y-4 w-full max-w-md">
              <div className="relative w-full h-32 rounded-xl bg-[#151D19] border border-[#20D69A]/40 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#20D69A] to-transparent shadow-[0_0_15px_#20D69A] animate-scanner" />
                <div className="flex flex-col items-center gap-2">
                  <Scan className="w-8 h-8 text-[#20D69A] animate-pulse" />
                  <span className="text-xs font-mono text-[#8AF0C7]">ANALYZING DOCUMENT MATRIX...</span>
                </div>
              </div>

              {/* Pipeline Step Progress */}
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between text-xs font-bold text-[#F4F7F5]">
                  <span>{pipelineSteps[activeStep]?.title}</span>
                  <span className="text-[#20D69A]">{Math.round(((activeStep + 1) / pipelineSteps.length) * 100)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#101613] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#20D69A] to-[#8AF0C7] transition-all duration-300"
                    style={{ width: `${((activeStep + 1) / pipelineSteps.length) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#929F98]">{pipelineSteps[activeStep]?.desc}</p>
              </div>
            </div>
          ) : selectedFile ? (
            /* Selected File State */
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#20D69A]/15 text-[#20D69A] flex items-center justify-center mx-auto border border-[#20D69A]/30">
                <FileCheck2 className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#F4F7F5]">{selectedFile.name}</p>
                <p className="text-xs text-[#929F98]">
                  {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'Document'}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#929F98] hover:text-[#FF646D] hover:bg-[#FF646D]/10 transition-colors"
                >
                  Change File
                </button>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#151D19] border border-[#1D2B24] text-[#20D69A] flex items-center justify-center mx-auto">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#F4F7F5]">
                  Drag and drop your invoice here, or <span className="text-[#20D69A] underline">browse files</span>
                </p>
                <p className="text-xs text-[#929F98] mt-1">
                  Works with scanned PDFs, smartphone photos, and clear digital exports
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Upload Action Button */}
        {selectedFile && !uploading && (
          <div className="flex justify-end">
            <button
              onClick={handleUploadSubmit}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#20D69A] to-[#16B580] text-[#080B0A] font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(32,214,154,0.3)] hover:shadow-[0_0_25px_rgba(32,214,154,0.4)] flex items-center gap-2 cursor-pointer transition-all"
            >
              <span>Execute Intelligent Extraction</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 6-Stage Processing Pipeline Visualizer */}
      <div className="p-6 rounded-2xl bg-[#101613] border border-[#1D2B24]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#929F98] mb-4">
          Automated Pipeline Stages
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {pipelineSteps.map((s, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-[#151D19] border border-[#1D2B24] text-xs space-y-1">
              <div className="text-[10px] font-bold text-[#20D69A]">Stage 0{idx + 1}</div>
              <div className="font-bold text-[#F4F7F5] text-xs">{s.title}</div>
              <div className="text-[10px] text-[#929F98] leading-tight">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

