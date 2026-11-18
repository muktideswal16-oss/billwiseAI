import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  ShieldCheck,
  Clock,
  AlertTriangle,
  UploadCloud,
  ChevronRight,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  FileCheck2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [documents, setDocuments] = useState([]);

  const fetchData = async () => {
    try {
      const [analyticsData, docsData] = await Promise.all([
        api.getAnalytics(),
        api.getDocuments({ sort_by: 'date_desc' })
      ]);
      setAnalytics(analyticsData);
      setDocuments(docsData);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (docId, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete document #${docId}?`)) return;
    try {
      await api.deleteDocument(docId);
      addToast(`Document #${docId} deleted`, 'info');
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleQuickApprove = async (docId, e) => {
    e.stopPropagation();
    try {
      await api.approveDocument(docId, 'Fast-tracked from dashboard');
      addToast(`Document #${docId} approved successfully`, 'success');
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const COLORS = ['#20D69A', '#8AF0C7', '#F4B942', '#FF646D', '#929F98'];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#121E18] to-[#101613] border border-[#20D69A]/20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#F4F7F5] tracking-tight">
              Accounting Workspace Overview
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#20D69A]/20 text-[#20D69A] border border-[#20D69A]/30">
              LIVE SYSTEM
            </span>
          </div>
          <p className="text-xs text-[#929F98] mt-1">
            Real-time OCR extraction, automated formula validation, and human-in-the-loop review.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/upload')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#20D69A] to-[#16B580] text-[#080B0A] font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(32,214,154,0.25)] hover:shadow-[0_0_25px_rgba(32,214,154,0.4)] flex items-center gap-2 cursor-pointer transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Process New Invoice</span>
          </button>
        </div>
      </div>

      {/* 4 Core Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Documents"
          value={analytics?.total_documents ?? 0}
          change="+18.4% this month"
          changeType="positive"
          icon={FileText}
          subtitle={`$${(analytics?.total_invoiced_value ?? 0).toLocaleString()} volume`}
        />
        <StatCard
          title="Successfully Validated"
          value={analytics?.successfully_validated ?? 0}
          change="Clean arithmetic"
          changeType="positive"
          icon={ShieldCheck}
          subtitle="Passed formula verification"
        />
        <StatCard
          title="Pending Review"
          value={analytics?.pending_review ?? 0}
          change="Awaiting human sign-off"
          changeType="neutral"
          icon={Clock}
          subtitle="Ready for approval"
        />
        <StatCard
          title="Issues Detected"
          value={analytics?.issues_detected ?? 0}
          change={analytics?.issues_detected > 0 ? "Requires correction" : "All clean"}
          changeType={analytics?.issues_detected > 0 ? "negative" : "positive"}
          icon={AlertTriangle}
          subtitle={`${analytics?.duplicate_count ?? 0} duplicate candidates`}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Activity Area Chart */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#151D19] border border-[#1D2B24] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#F4F7F5]">Document Processing Activity</h3>
              <p className="text-xs text-[#929F98]">Monthly throughput & extraction volume</p>
            </div>
            <span className="text-xs font-semibold text-[#20D69A] bg-[#20D69A]/10 px-2.5 py-1 rounded-md border border-[#20D69A]/20">
              Q3-Q4 2024
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.monthly_activity || []}>
                <defs>
                  <linearGradient id="colorEmerald" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#20D69A" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#20D69A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1D2B24" vertical={false} />
                <XAxis dataKey="month" stroke="#929F98" fontSize={11} tickLine={false} />
                <YAxis stroke="#929F98" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101613',
                    borderColor: '#1D2B24',
                    borderRadius: '8px',
                    color: '#F4F7F5',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="processed"
                  name="Documents Processed"
                  stroke="#20D69A"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorEmerald)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Document Type Breakdown Donut Chart */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-[#151D19] border border-[#1D2B24] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#F4F7F5]">Document Breakdown</h3>
            <p className="text-xs text-[#929F98]">Classification across ingested records</p>
          </div>

          <div className="h-44 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.type_distribution || []}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(analytics?.type_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101613',
                    borderColor: '#1D2B24',
                    borderRadius: '8px',
                    color: '#F4F7F5',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#1D2B24] text-xs">
            {(analytics?.type_distribution || []).map((t, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-[#929F98]">{t.name}</span>
                </div>
                <span className="font-bold text-[#F4F7F5]">{t.value} docs</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Documents Table */}
      <div className="rounded-2xl bg-[#151D19] border border-[#1D2B24] overflow-hidden">
        <div className="p-5 border-b border-[#1D2B24] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#F4F7F5]">Recent Document Ingestion Queue</h3>
            <p className="text-xs text-[#929F98]">Latest processed invoices, receipts, and POs</p>
          </div>
          <button
            onClick={() => navigate('/documents')}
            className="text-xs font-semibold text-[#20D69A] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Records ({documents.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#101613] text-[#929F98] uppercase font-semibold text-[10px] tracking-wider border-b border-[#1D2B24]">
              <tr>
                <th className="py-3 px-5">Document</th>
                <th className="py-3 px-5">Vendor</th>
                <th className="py-3 px-5">Invoice ID</th>
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-5">Total</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2B24]">
              {documents.slice(0, 5).map((doc) => {
                const ext = doc.extracted_data;
                return (
                  <tr
                    key={doc.id}
                    onClick={() => navigate(`/review/${doc.id}`)}
                    className="hover:bg-[#1A2520]/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-5 font-medium text-[#F4F7F5]">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#20D69A] shrink-0" />
                        <span className="truncate max-w-[180px]">{doc.original_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-[#F4F7F5] font-semibold">
                      {ext?.vendor_name || 'Processing...'}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[#929F98]">
                      {ext?.invoice_number || 'Pending'}
                    </td>
                    <td className="py-3.5 px-5 text-[#929F98]">
                      {ext?.invoice_date || new Date(doc.upload_date).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-[#F4F7F5]">
                      {ext?.grand_total ? `$${ext.grand_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="py-3.5 px-5">
                      <StatusBadge status={doc.approval_status} />
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      {doc.approval_status !== 'Approved' && (
                        <button
                          onClick={(e) => handleQuickApprove(doc.id, e)}
                          title="Quick Approve"
                          className="p-1 rounded hover:bg-[#20D69A]/20 text-[#20D69A] transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/review/${doc.id}`);
                        }}
                        title="Review Document"
                        className="p-1 rounded hover:bg-[#1D2B24] text-[#929F98] hover:text-[#F4F7F5] transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(doc.id, e)}
                        title="Delete Document"
                        className="p-1 rounded hover:bg-[#FF646D]/20 text-[#929F98] hover:text-[#FF646D] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

