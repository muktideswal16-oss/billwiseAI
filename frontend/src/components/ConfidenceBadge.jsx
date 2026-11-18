import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle } from 'lucide-react';

export default function ConfidenceBadge({ score, showIcon = true, label = '' }) {
  // Score can be 0.0 - 1.0 or 0 - 100
  const normalized = score > 1 ? score : Math.round(score * 100);

  let variant = {
    bg: 'bg-emerald-500/10 text-[#20D69A] border-emerald-500/20',
    icon: ShieldCheck,
    text: 'High'
  };

  if (normalized < 70) {
    variant = {
      bg: 'bg-[#FF646D]/15 text-[#FF646D] border-[#FF646D]/30',
      icon: AlertCircle,
      text: 'Low'
    };
  } else if (normalized < 90) {
    variant = {
      bg: 'bg-[#F4B942]/15 text-[#F4B942] border-[#F4B942]/30',
      icon: AlertTriangle,
      text: 'Medium'
    };
  }

  const Icon = variant.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variant.bg}`}
      title={`${label ? label + ': ' : ''}${normalized}% confidence score`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{normalized}%</span>
      <span className="text-[10px] opacity-75 font-normal">({variant.text})</span>
    </span>
  );
}

