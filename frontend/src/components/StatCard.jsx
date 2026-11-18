import React from 'react';

export default function StatCard({ title, value, change, changeType = 'positive', icon: Icon, subtitle }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#1D2B24] bg-[#151D19]/80 p-5 backdrop-blur-md transition-all duration-300 hover:border-[#20D69A]/40 hover:shadow-[0_0_20px_rgba(32,214,154,0.08)] group">
      {/* Background soft glow accent */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-[#20D69A]/5 blur-2xl group-hover:bg-[#20D69A]/10 transition-all" />

      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-[#929F98]">{title}</span>
        {Icon && (
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#101613] border border-[#1D2B24] text-[#20D69A] group-hover:border-[#20D69A]/30 transition-colors">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl lg:text-3xl font-bold tracking-tight text-[#F4F7F5]">{value}</span>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        {change && (
          <span
            className={`font-medium inline-flex items-center gap-1 ${
              changeType === 'positive'
                ? 'text-[#20D69A]'
                : changeType === 'negative'
                ? 'text-[#FF646D]'
                : 'text-[#F4B942]'
            }`}
          >
            {change}
          </span>
        )}
        {subtitle && <span className="text-[#929F98] truncate">{subtitle}</span>}
      </div>
    </div>
  );
}

