import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Scan,
  ShieldCheck,
  AlertTriangle,
  Download,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
  Cpu,
  Layers,
  FileSpreadsheet,
  Lock,
  ChevronRight,
  ExternalLink,
  Users
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#080B0A] text-[#F4F7F5] selection:bg-[#20D69A] selection:text-[#080B0A]">
      {/* ---------------- NAVIGATION ---------------- */}
      <nav className="fixed top-0 inset-x-0 h-20 bg-[#080B0A]/80 backdrop-blur-xl border-b border-[#1D2B24] z-50 px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#20D69A] to-[#108A62] p-[1.5px] shadow-[0_0_20px_rgba(32,214,154,0.35)]">
            <div className="w-full h-full bg-[#080B0A] rounded-[10px] flex items-center justify-center">
              <span className="font-black text-[#20D69A] text-lg tracking-tighter">BW</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl tracking-tight text-[#F4F7F5]">BillWise</span>
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-[#20D69A]/15 text-[#20D69A] border border-[#20D69A]/30">AI</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#929F98]">
          <a href="#features" className="hover:text-[#20D69A] transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-[#20D69A] transition-colors">How It Works</a>
          <a href="#problem" className="hover:text-[#20D69A] transition-colors">The Problem</a>
          <a href="#impact" className="hover:text-[#20D69A] transition-colors">Impact</a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-sm font-semibold text-[#929F98] hover:text-[#F4F7F5] transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#20D69A] to-[#16B580] text-[#080B0A] font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(32,214,154,0.3)] hover:shadow-[0_0_25px_rgba(32,214,154,0.5)] transition-all cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ---------------- HERO SECTION ---------------- */}
      <section className="relative pt-36 pb-24 overflow-hidden bg-grid-pattern">
        {/* Glow ambient spots */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#20D69A]/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151D19] border border-[#20D69A]/30 text-xs font-semibold text-[#8AF0C7] shadow-[0_0_15px_rgba(32,214,154,0.15)]">
              <Sparkles className="w-3.5 h-3.5 text-[#20D69A]" />
              <span>Next-Gen Intelligent Document Processing for Small Business</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#F4F7F5] leading-[1.1]">
              Your invoices.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20D69A] via-[#8AF0C7] to-[#20D69A]">
                Understood. Validated.
              </span>{' '}
              Organized.
            </h1>

            <p className="text-lg sm:text-xl text-[#929F98] max-w-2xl mx-auto font-normal leading-relaxed">
              Let AI handle the paperwork while you focus on growing your business. Turn messy invoices, receipts, and purchase orders into clean, audit-ready financial records.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/upload')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#20D69A] to-[#16B580] text-[#080B0A] font-bold text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(32,214,154,0.35)] hover:shadow-[0_0_35px_rgba(32,214,154,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Start Processing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#151D19] hover:bg-[#1D2B24] border border-[#1D2B24] text-[#F4F7F5] font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore Live Dashboard</span>
              </button>
            </div>

            <div className="pt-2 flex items-center justify-center gap-6 text-xs text-[#929F98]">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#20D69A]" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#20D69A]" /> Instant Demo Mode</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#20D69A]" /> Excel & CSV Ready</span>
            </div>
          </div>

          {/* ---------------- INTERACTIVE SCANNING SHOWCASE ---------------- */}
          <div className="mt-16 max-w-5xl mx-auto relative rounded-2xl border border-[#1D2B24] bg-[#101613]/90 shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-4 sm:p-8 backdrop-blur-xl">
            {/* Top SaaS window controls */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1D2B24] text-xs text-[#929F98]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF646D]" />
                <div className="w-3 h-3 rounded-full bg-[#F4B942]" />
                <div className="w-3 h-3 rounded-full bg-[#20D69A]" />
                <span className="ml-2 font-mono text-[11px] text-[#929F98]">billwise-ai // live-extraction-preview</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-[#20D69A]">
                <span className="w-2 h-2 rounded-full bg-[#20D69A] animate-ping" />
                <span>OCR Pipeline: Active</span>
              </div>
            </div>

            {/* Split Showcase Screen */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
              {/* Left: Animated Scanning Document */}
              <div className="lg:col-span-5 relative rounded-xl border border-[#1D2B24] bg-[#151D19] p-5 overflow-hidden">
                {/* Laser scan line */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#20D69A] to-transparent shadow-[0_0_15px_#20D69A] animate-scanner z-10" />

                <div className="space-y-4 font-mono text-xs text-[#929F98]">
                  <div className="flex justify-between items-start pb-3 border-b border-[#1D2B24]">
                    <div>
                      <div className="text-xs font-bold text-[#F4F7F5]">APEX CLOUD SOLUTIONS</div>
                      <div className="text-[10px]">Invoice #INV-2024-0891</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#20D69A]/15 text-[#20D69A] text-[10px] font-bold">PDF / SCANNED</span>
                  </div>

                  <div className="space-y-2 py-2">
                    <div className="flex justify-between text-[11px]">
                      <span>1x Cloud Cluster (32 vCPU)</span>
                      <span className="text-[#F4F7F5] font-bold">$1,450.00</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>2x AI API Gateway Tier 2</span>
                      <span className="text-[#F4F7F5] font-bold">$700.00</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>1x Priority SLA Support</span>
                      <span className="text-[#F4F7F5] font-bold">$300.00</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#1D2B24] space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span>Subtotal:</span>
                      <span className="text-[#F4F7F5]">$2,450.00</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>Tax (10%):</span>
                      <span className="text-[#F4F7F5]">$245.00</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-[#20D69A] pt-1">
                      <span>Total Due:</span>
                      <span>$2,595.00 USD</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: AI Structured Extraction Output */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#8AF0C7]">
                    Extracted Structured Output
                  </h3>
                  <span className="px-2.5 py-1 rounded-full bg-[#20D69A]/15 text-[#20D69A] border border-[#20D69A]/30 text-xs font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> 98.4% Confidence
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#151D19] border border-[#1D2B24]">
                    <div className="text-[10px] text-[#929F98] uppercase">Vendor Identified</div>
                    <div className="font-bold text-[#F4F7F5] mt-0.5">Apex Cloud & Software</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#151D19] border border-[#1D2B24]">
                    <div className="text-[10px] text-[#929F98] uppercase">Invoice ID</div>
                    <div className="font-bold text-[#F4F7F5] mt-0.5 font-mono">INV-2024-0891</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#151D19] border border-[#1D2B24]">
                    <div className="text-[10px] text-[#929F98] uppercase">Math Formula</div>
                    <div className="font-bold text-[#20D69A] mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Balanced ($2,595.00)
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#151D19] border border-[#1D2B24]">
                    <div className="text-[10px] text-[#929F98] uppercase">Duplicate Check</div>
                    <div className="font-bold text-[#20D69A] mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Unique Record
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#121A16] border border-[#1D2B24] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#20D69A]/15 text-[#20D69A] flex items-center justify-center">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#F4F7F5]">Ready for One-Click Export</div>
                      <div className="text-[11px] text-[#929F98]">XLSX & CSV formatted with auto-columns</div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-3.5 py-1.5 rounded-lg bg-[#20D69A] text-[#080B0A] text-xs font-bold hover:brightness-110 cursor-pointer"
                  >
                    Try in App
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- SECTION A: PROBLEM ---------------- */}
      <section id="problem" className="py-24 border-t border-[#1D2B24] bg-[#0A0F0D]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF646D]">The Core Problem</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F4F7F5]">
              Manual invoice processing is costing you money.
            </h2>
            <p className="text-sm text-[#929F98]">
              Small business owners spend up to 14 hours every month re-typing figures from PDFs and receipts into spreadsheets.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#151D19] border border-[#1D2B24] hover:border-[#FF646D]/40 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF646D]/15 text-[#FF646D] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#F4F7F5]">Calculation Mismatches</h3>
              <p className="text-xs text-[#929F98] leading-relaxed">
                Typing errors in subtotals, tax rates, and discounts lead to incorrect ledger entries and painful tax audit reconciliations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#151D19] border border-[#1D2B24] hover:border-[#F4B942]/40 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F4B942]/15 text-[#F4B942] flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#F4F7F5]">Accidental Duplicate Payouts</h3>
              <p className="text-xs text-[#929F98] leading-relaxed">
                Vendors often send duplicate invoices via email and mail. Without intelligent matching, businesses end up paying twice.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#151D19] border border-[#1D2B24] hover:border-[#8AF0C7]/40 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#8AF0C7]/15 text-[#8AF0C7] flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#F4F7F5]">Manual Data Entry Fatigue</h3>
              <p className="text-xs text-[#929F98] leading-relaxed">
                Copying line-item quantities, descriptions, and totals into Excel drains valuable business time that should be spent serving customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- SECTION B: SOLUTION ---------------- */}
      <section className="py-24 border-t border-[#1D2B24] bg-[#080B0A] relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#20D69A]">The BillWise AI Solution</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F4F7F5]">
              Intelligence. Accuracy. Human Control.
            </h2>
            <p className="text-sm text-[#929F98]">
              A three-pillar architecture engineered specifically for small accounting teams and retail businesses.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#101613] border border-[#20D69A]/30 space-y-4">
              <div className="text-3xl font-black text-[#20D69A]">01</div>
              <h3 className="text-xl font-bold text-[#F4F7F5]">1. Intelligence</h3>
              <p className="text-xs text-[#929F98] leading-relaxed">
                Deep document OCR and AI field extraction read vendor names, dates, invoice identifiers, and line-item tables with confidence scores.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#101613] border border-[#20D69A]/30 space-y-4">
              <div className="text-3xl font-black text-[#8AF0C7]">02</div>
              <h3 className="text-xl font-bold text-[#F4F7F5]">2. Accuracy</h3>
              <p className="text-xs text-[#929F98] leading-relaxed">
                Automated rule-based verification verifies mathematical formulas (Subtotal + Tax - Discount = Total) and catches duplicate submissions instantly.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#101613] border border-[#20D69A]/30 space-y-4">
              <div className="text-3xl font-black text-[#F4F7F5]">03</div>
              <h3 className="text-xl font-bold text-[#F4F7F5]">3. Control</h3>
              <p className="text-xs text-[#929F98] leading-relaxed">
                Humans remain firmly in the loop. Reviewers inspect side-by-side document previews, edit values freely, and explicitly approve records before export.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- SECTION C: FEATURES ---------------- */}
      <section id="features" className="py-24 border-t border-[#1D2B24] bg-[#0A0F0D]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8AF0C7]">Core Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F4F7F5]">
              Everything you need to automate invoice records.
            </h2>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Scan,
                title: 'Smart Document Upload',
                desc: 'Drag & drop PDF, PNG, JPG, and JPEG with automated contrast preprocessing.'
              },
              {
                icon: Cpu,
                title: 'AI-Powered OCR',
                desc: 'High-fidelity text extraction with bounding box recognition and noise filtering.'
              },
              {
                icon: FileText,
                title: 'Field Extraction',
                desc: 'Automatically isolates Vendor, Inv #, Date, Subtotal, Tax, Discount, and Items.'
              },
              {
                icon: ShieldCheck,
                title: 'Confidence Scoring',
                desc: 'Field-level traffic light indicators (Green 90%+, Yellow 70%, Red Low).'
              },
              {
                icon: AlertTriangle,
                title: 'Error Detection',
                desc: 'Flags calculation mismatches, line-item discrepancies, and invalid dates.'
              },
              {
                icon: Layers,
                title: 'Duplicate Detection',
                desc: 'Cross-checks invoice numbers and vendor totals to prevent double-billing.'
              },
              {
                icon: CheckCircle2,
                title: 'Human Review & Approval',
                desc: 'Audit interface allowing manual editing and explicit approval before saving.'
              },
              {
                icon: Download,
                title: 'CSV & Excel Export',
                desc: 'Download clean, styled spreadsheets directly compatible with QuickBooks and Excel.'
              }
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-[#151D19] border border-[#1D2B24] hover:border-[#20D69A]/40 transition-all duration-300 space-y-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#20D69A]/10 text-[#20D69A] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#F4F7F5]">{f.title}</h4>
                  <p className="text-xs text-[#929F98] leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- SECTION D: HOW IT WORKS ---------------- */}
      <section id="how-it-works" className="py-24 border-t border-[#1D2B24] bg-[#080B0A]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#20D69A]">Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F4F7F5]">
              Six steps from raw receipt to approved financial record.
            </h2>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              { step: '1', title: 'Upload Document', desc: 'Drop invoices, receipts or POs in PDF or images.' },
              { step: '2', title: 'Image Preprocessing', desc: 'Grayscale & contrast enhancement for sharpness.' },
              { step: '3', title: 'OCR Recognition', desc: 'Reads character streams and tabular boundaries.' },
              { step: '4', title: 'AI Field Extraction', desc: 'Maps text to vendor, dates, totals, and items.' },
              { step: '5', title: 'Rule Validation', desc: 'Verifies formulas and checks for duplicates.' },
              { step: '6', title: 'Human Review & Export', desc: 'Approve final records and download Excel.' },
            ].map((s, idx) => (
              <div
                key={idx}
                className="relative p-5 rounded-xl bg-[#101613] border border-[#1D2B24] flex flex-col justify-between"
              >
                <div>
                  <div className="w-7 h-7 rounded-lg bg-[#20D69A]/15 text-[#20D69A] font-bold text-xs flex items-center justify-center mb-3">
                    {s.step}
                  </div>
                  <h4 className="text-xs font-bold text-[#F4F7F5]">{s.title}</h4>
                  <p className="text-[11px] text-[#929F98] mt-1.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- SECTION E: IMPACT ---------------- */}
      <section id="impact" className="py-24 border-t border-[#1D2B24] bg-[#0A0F0D]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8AF0C7]">Proven Small Business Impact</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F4F7F5] leading-tight">
                Designed for retail shops, contractors, and growing accounting teams.
              </h2>
              <div className="space-y-4 text-xs text-[#929F98]">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#20D69A]/15 text-[#20D69A] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-[#F4F7F5]">Saves 85% of Processing Time:</strong> Stop typing line-by-line totals. Upload in batches and review in minutes.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#20D69A]/15 text-[#20D69A] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-[#F4F7F5]">Prevents Costly Duplicate Payouts:</strong> Automated hash and field detection flags duplicates before payment approval.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#20D69A]/15 text-[#20D69A] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-[#F4F7F5]">Zero Black-Box Guesswork:</strong> Every single field has an explicit confidence score and can be edited prior to final approval.
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-[#151D19] border border-[#1D2B24] text-center space-y-2">
                <div className="text-3xl sm:text-4xl font-black text-[#20D69A]">85%</div>
                <div className="text-xs font-bold text-[#F4F7F5]">Time Saved</div>
                <p className="text-[10px] text-[#929F98]">compared to manual data entry</p>
              </div>
              <div className="p-6 rounded-2xl bg-[#151D19] border border-[#1D2B24] text-center space-y-2">
                <div className="text-3xl sm:text-4xl font-black text-[#8AF0C7]">100%</div>
                <div className="text-xs font-bold text-[#F4F7F5]">Human In The Loop</div>
                <p className="text-[10px] text-[#929F98]">no unapproved entries</p>
              </div>
              <div className="p-6 rounded-2xl bg-[#151D19] border border-[#1D2B24] text-center space-y-2">
                <div className="text-3xl sm:text-4xl font-black text-[#20D69A]">0.02s</div>
                <div className="text-xs font-bold text-[#F4F7F5]">Math Integrity Engine</div>
                <p className="text-[10px] text-[#929F98]">catches formula errors</p>
              </div>
              <div className="p-6 rounded-2xl bg-[#151D19] border border-[#1D2B24] text-center space-y-2">
                <div className="text-3xl sm:text-4xl font-black text-[#8AF0C7]">Excel</div>
                <div className="text-xs font-bold text-[#F4F7F5]">Universal Export</div>
                <p className="text-[10px] text-[#929F98]">XLSX & CSV formatted</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- SECTION F: FINAL CTA ---------------- */}
      <section className="py-24 border-t border-[#1D2B24] bg-gradient-to-b from-[#0A0F0D] to-[#080B0A] relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#F4F7F5]">
            Ready to streamline your business paperwork?
          </h2>
          <p className="text-base text-[#929F98] max-w-xl mx-auto">
            Experience the complete intelligent document processing workflow with instant demo data or upload your own receipt right now.
          </p>
          <div className="pt-2 flex items-center justify-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#20D69A] to-[#16B580] text-[#080B0A] font-bold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(32,214,154,0.35)] hover:shadow-[0_0_35px_rgba(32,214,154,0.5)] transition-all cursor-pointer"
            >
              Open Live Dashboard
            </button>
            <button
              onClick={() => navigate('/upload')}
              className="px-8 py-3.5 rounded-xl bg-[#151D19] border border-[#1D2B24] text-[#F4F7F5] font-semibold text-xs hover:bg-[#1D2B24] transition-all cursor-pointer"
            >
              Upload Test Invoice
            </button>
          </div>
        </div>
      </section>

      {/* ---------------- SECTION G: FOOTER ---------------- */}
      <footer className="py-12 border-t border-[#1D2B24] bg-[#080B0A] text-xs text-[#929F98]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#F4F7F5]">BillWise AI</span>
            <span>— Intelligent Document Processing Platform</span>
          </div>
          <div>
            Built for Hackathon: AI, Automation & Intelligent Systems
          </div>
        </div>
      </footer>
    </div>
  );
}

