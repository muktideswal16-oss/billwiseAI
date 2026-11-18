import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const s = status || 'Pending Review';

  let config = {
    bg: 'bg-emerald-500/10 text-[#20D69A] border-emerald-500/25',
    icon: CheckCircle2,
    label: s
  };

  if (s === 'Approved') {
    config = {
      bg: 'bg-emerald-500/15 text-[#20D69A] border-emerald-500/30 shadow-[0_0_12px_rgba(32,214,154,0.15)]',
      icon: CheckCircle2,
      label: 'Approved'
    };
  } else if (s === 'Needs Correction' || s === 'validation_failed') {
    config = {
      bg: 'bg-[#FF646D]/15 text-[#FF646D] border-[#FF646D]/30 shadow-[0_0_12px_rgba(255,100,109,0.15)]',
      icon: AlertTriangle,
      label: 'Needs Correction'
    };
  } else if (s === 'Rejected') {
    config = {
      bg: 'bg-neutral-500/15 text-[#929F98] border-neutral-500/30',
      icon: XCircle,
      label: 'Rejected'
    };
  } else {
    // Pending Review
    config = {
      bg: 'bg-[#F4B942]/15 text-[#F4B942] border-[#F4B942]/30 shadow-[0_0_12px_rgba(244,185,66,0.15)]',
      icon: Clock,
      label: 'Pending Review'
    };
  }

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${config.bg}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
}

