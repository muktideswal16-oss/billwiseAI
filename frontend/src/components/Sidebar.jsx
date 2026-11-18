import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  FileText,
  ScanText,
  ShieldAlert,
  CopyCheck,
  BarChart3,
  Download,
  Settings,
  Sparkles,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ duplicateCount = 0, issuesCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload Documents', href: '/upload', icon: UploadCloud, highlight: true },
    { name: 'All Documents', href: '/documents', icon: FileText },
    { name: 'Extracted Records', href: '/extraction', icon: ScanText },
    { name: 'Validation Centre', href: '/validation', icon: ShieldAlert, badge: issuesCount },
    { name: 'Duplicates', href: '/duplicates', icon: CopyCheck, badge: duplicateCount },
    { name: 'Reports & Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Export Centre', href: '/export', icon: Download },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#0A0F0D] border-r border-[#1D2B24] flex flex-col h-screen sticky top-0 select-none z-20">
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[#1D2B24] gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#20D69A] to-[#108A62] p-[1.5px] shadow-[0_0_15px_rgba(32,214,154,0.3)]">
          <div className="w-full h-full bg-[#080B0A] rounded-[10px] flex items-center justify-center">
            <span className="font-black text-[#20D69A] text-base tracking-tighter">BW</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base tracking-tight text-[#F4F7F5]">BillWise</span>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#20D69A]/15 text-[#20D69A] border border-[#20D69A]/30">AI</span>
          </div>
          <span className="text-[11px] text-[#929F98] block -mt-0.5 font-medium">Fintech Doc Engine</span>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="p-4">
        <button
          onClick={() => navigate('/upload')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#20D69A] to-[#16B580] text-[#080B0A] font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(32,214,154,0.25)] hover:shadow-[0_0_25px_rgba(32,214,154,0.4)] hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
        >
          <UploadCloud className="w-4 h-4 stroke-[2.5]" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Nav Menu Items */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#929F98]/70">
          Main Workspace
        </div>
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-[#151D19] text-[#20D69A] border border-[#20D69A]/30 shadow-[inset_0_0_12px_rgba(32,214,154,0.06)]'
                    : 'text-[#929F98] hover:text-[#F4F7F5] hover:bg-[#101613]'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 ? (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#FF646D]/15 text-[#FF646D] border border-[#FF646D]/30">
                  {item.badge}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </nav>

      {/* Hackathon Judge Guide Pill */}
      <div className="p-3 mx-3 mb-2 rounded-xl bg-[#121A16] border border-[#20D69A]/20">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#8AF0C7]">
          <Sparkles className="w-3.5 h-3.5 text-[#20D69A] animate-pulse" />
          <span>Hackathon Demo Mode</span>
        </div>
        <p className="mt-1 text-[11px] text-[#929F98] leading-tight">
          Live OCR & rule engine active with 3 pre-built demo scenarios.
        </p>
      </div>

      {/* User Card & Logout */}
      <div className="p-4 border-t border-[#1D2B24] bg-[#090D0B]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#151D19] border border-[#1D2B24] flex items-center justify-center text-[#20D69A] font-bold text-xs shrink-0">
              {user?.name ? user.name.charAt(0) : 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#F4F7F5] truncate">{user?.name || 'Alex Rivera'}</p>
              <p className="text-[10px] text-[#929F98] truncate">{user?.business_name || 'Nova Retail'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 rounded-lg text-[#929F98] hover:text-[#FF646D] hover:bg-[#FF646D]/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

