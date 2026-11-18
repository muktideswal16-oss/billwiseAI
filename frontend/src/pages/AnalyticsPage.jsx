import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  FileCheck2,
  Clock,
  AlertTriangle,
  CopyCheck,
  Calendar,
  Download
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function AnalyticsPage() {
  const { addToast } = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [timeframe, setTimeframe] = useState('all_time');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics()
      .then((data) => setAnalytics(data))
      .catch((err) => addToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [timeframe]);

  const COLORS = ['#20D69A', '#8AF0C7', '#F4B942', '#FF646D', '#929F98'];

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F4F7F5] tracking-tight">
            Financial & Processing Intelligence
          </h1>
          <p className="text-xs text-[#929F98] mt-1">
            Aggregated business expense metrics, vendor allocations, and document throughput.
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex rounded-xl bg-[#151D19] p-1 border border-[#1D2B24] self-start sm:self-auto text-xs">
          {[
            { id: '30_days', label: 'Last 30 Days' },
            { id: '90_days', label: 'Last 90 Days' },
            { id: 'all_time', label: 'All Time' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeframe(t.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                timeframe === t.id
                  ? 'bg-[#20D69A] text-[#080B0A] font-bold shadow'
                  : 'text-[#929F98] hover:text-[#F4F7F5]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6 Key Financial Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Invoiced Value"
          value={`$${(analytics?.total_invoiced_value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          change="Real extracted sum"
          changeType="positive"
          icon={DollarSign}
          subtitle={`${analytics?.total_documents ?? 0} invoices accounted`}
        />
        <StatCard
          title="Approved Documents"
          value={analytics?.approved_documents ?? 0}
          change="100% human signed-off"
          changeType="positive"
          icon={FileCheck2}
          subtitle="Export ready in CSV & Excel"
        />
        <StatCard
          title="Awaiting Review"
          value={analytics?.pending_review ?? 0}
          change="Pending verification"
          changeType="neutral"
          icon={Clock}
          subtitle="In audit queue"
        />
        <StatCard
          title="Calculation Errors"
          value={analytics?.issues_detected ?? 0}
          change="Discrepancies caught"
          changeType={analytics?.issues_detected > 0 ? "negative" : "positive"}
          icon={AlertTriangle}
          subtitle="Formula protection active"
        />
        <StatCard
          title="Duplicate Submissions"
          value={analytics?.duplicate_count ?? 0}
          change="Double payments prevented"
          changeType={analytics?.duplicate_count > 0 ? "negative" : "positive"}
          icon={CopyCheck}
          subtitle="Cross-matched identifiers"
        />
        <StatCard
          title="Validation Success Rate"
          value={
            analytics?.total_documents
              ? `${Math.round((analytics.successfully_validated / analytics.total_documents) * 100)}%`
              : '100%'
          }
          change="Automated accuracy"
          changeType="positive"
          icon={TrendingUp}
          subtitle="High confidence extractions"
        />
      </div>

      {/* Primary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Trend Area Chart */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#151D19] border border-[#1D2B24] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#F4F7F5]">Monthly Processing & Invoiced Volume</h3>
              <p className="text-xs text-[#929F98]">Historical document intake and dollar values</p>
            </div>
            <span className="text-xs font-mono text-[#20D69A]">USD ($)</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.monthly_activity || []}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
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
                  formatter={(val) => [`$${val.toLocaleString()}`, 'Total Volume']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#20D69A"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorVal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Spending by Vendor Bar Chart */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#151D19] border border-[#1D2B24] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#F4F7F5]">Spending by Vendor</h3>
            <p className="text-xs text-[#929F98]">Highest cumulative invoice totals</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics?.spending_by_vendor || []}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1D2B24" horizontal={false} />
                <XAxis type="number" stroke="#929F98" fontSize={10} tickLine={false} />
                <YAxis
                  dataKey="vendor"
                  type="category"
                  stroke="#929F98"
                  fontSize={10}
                  tickLine={false}
                  width={110}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101613',
                    borderColor: '#1D2B24',
                    borderRadius: '8px',
                    color: '#F4F7F5',
                    fontSize: '12px'
                  }}
                  formatter={(val) => [`$${val.toLocaleString()}`, 'Total Spent']}
                />
                <Bar dataKey="amount" fill="#20D69A" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="p-6 rounded-2xl bg-[#151D19] border border-[#1D2B24] space-y-4">
          <h3 className="text-sm font-bold text-[#F4F7F5]">Approval Status Distribution</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.status_distribution || []}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(analytics?.status_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
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
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#1D2B24]">
            {(analytics?.status_distribution || []).map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-[#929F98] truncate">{s.name}</span>
                </div>
                <span className="font-bold text-[#F4F7F5]">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Document Classification */}
        <div className="p-6 rounded-2xl bg-[#151D19] border border-[#1D2B24] space-y-4">
          <h3 className="text-sm font-bold text-[#F4F7F5]">Document Format Classification</h3>
          <div className="h-48 w-full">
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
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
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
          <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-[#1D2B24]">
            {(analytics?.type_distribution || []).map((t, i) => (
              <div key={i} className="text-center p-2 rounded-lg bg-[#101613] border border-[#1D2B24]">
                <div className="text-[10px] text-[#929F98] truncate">{t.name}</div>
                <div className="text-sm font-bold text-[#20D69A]">{t.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

