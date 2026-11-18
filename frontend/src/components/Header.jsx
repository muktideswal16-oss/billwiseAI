import React, { useState } from 'react';
import { Search, Bell, RotateCcw, Calendar, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';

export default function Header({ issuesCount = 0, duplicateCount = 0, onRefresh }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [resetting, setResetting] = useState(false);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const handleResetDemo = async () => {
    if (!window.confirm('Reset all demo documents, extractions, and validations to initial hackathon state?')) {
      return;
    }
    setResetting(true);
    try {
      await api.resetDemo();
      addToast('Demo database successfully reset to pristine state', 'success');
      if (onRefresh) onRefresh();
      navigate('/dashboard');
    } catch (err) {
      addToast(`Reset failed: ${err.message}`, 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <header className="h-16 px-6 bg-[#080B0A]/80 backdrop-blur-md border-b border-[#1D2B24] flex items-center justify-between sticky top-0 z-10">
      {/* Search Input */}
      <div className="flex items-center gap-3 w-80">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#929F98]" />
          <input
            type="text"
            placeholder="Search vendor, invoice #, PO..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                navigate(`/documents?search=${encodeURIComponent(e.target.value.trim())}`);
              }
            }}
            className="w-full bg-[#121A16] border border-[#1D2B24] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#F4F7F5] placeholder-[#929F98] focus:outline-none focus:border-[#20D69A]/50 focus:ring-1 focus:ring-[#20D69A]/50 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Date Display */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-[#929F98] bg-[#101613] px-3 py-1.5 rounded-lg border border-[#1D2B24]">
          <Calendar className="w-3.5 h-3.5 text-[#20D69A]" />
          <span>{today}</span>
        </div>

        {/* Reset Demo State Button */}
        <button
          onClick={handleResetDemo}
          disabled={resetting}
          title="Reset sample data for hackathon demo"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#121A16] hover:bg-[#1A2520] border border-[#1D2B24] text-xs text-[#929F98] hover:text-[#8AF0C7] transition-all cursor-pointer"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Reset Demo</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-[#101613] border border-[#1D2B24] text-[#929F98] hover:text-[#F4F7F5] transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {issuesCount + duplicateCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF646D] text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {issuesCount + duplicateCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#151D19] border border-[#1D2B24] shadow-2xl p-3 z-30 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#1D2B24]">
                <span className="text-xs font-bold text-[#F4F7F5]">Validation Alerts</span>
                <span className="text-[10px] text-[#929F98]">{issuesCount + duplicateCount} Pending</span>
              </div>
              <div className="py-2 space-y-2 max-h-60 overflow-y-auto">
                {issuesCount > 0 && (
                  <div
                    onClick={() => { setShowNotifications(false); navigate('/validation'); }}
                    className="p-2.5 rounded-lg bg-[#1D1517] border border-[#FF646D]/30 flex items-start gap-2.5 cursor-pointer hover:bg-[#251A1D] transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4 text-[#FF646D] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[#F4F7F5]">Calculation Discrepancies</p>
                      <p className="text-[11px] text-[#929F98]">{issuesCount} items require arithmetic review</p>
                    </div>
                  </div>
                )}
                {duplicateCount > 0 && (
                  <div
                    onClick={() => { setShowNotifications(false); navigate('/duplicates'); }}
                    className="p-2.5 rounded-lg bg-[#1D1B15] border border-[#F4B942]/30 flex items-start gap-2.5 cursor-pointer hover:bg-[#25221A] transition-colors"
                  >
                    <ShieldAlert className="w-4 h-4 text-[#F4B942] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[#F4F7F5]">Duplicate Submissions</p>
                      <p className="text-[11px] text-[#929F98]">{duplicateCount} potential duplicate invoice flagged</p>
                    </div>
                  </div>
                )}
                {issuesCount === 0 && duplicateCount === 0 && (
                  <div className="py-4 text-center text-xs text-[#929F98] flex flex-col items-center gap-1.5">
                    <CheckCircle2 className="w-6 h-6 text-[#20D69A]" />
                    <span>All records validated & clean!</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Mini Avatar & Business Name */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#1D2B24]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#20D69A] to-[#108A62] p-[1.5px]">
            <div className="w-full h-full rounded-full bg-[#121A16] flex items-center justify-center text-[#20D69A] text-xs font-bold">
              {user?.name ? user.name.charAt(0) : 'A'}
            </div>
          </div>
          <div className="hidden lg:block">
            <span className="text-xs font-bold text-[#F4F7F5] block leading-none">{user?.name || 'Alex Rivera'}</span>
            <span className="text-[10px] text-[#20D69A] font-medium leading-none">{user?.role || 'Finance Director'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

