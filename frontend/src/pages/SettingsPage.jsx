import React, { useState } from 'react';
import {
  Settings,
  User,
  Building,
  DollarSign,
  Sliders,
  RotateCcw,
  Save,
  CheckCircle2,
  Shield,
  Download,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';

export default function SettingsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [profile, setProfile] = useState({
    name: user?.name || 'Alex Rivera',
    email: user?.email || 'demo@billwise.ai',
    business_name: user?.business_name || 'Nova Retail Logistics',
    tax_id: 'US-EIN-94-2819034',
    currency: 'USD',
    ocr_engine: 'HYBRID_AI', // 'HYBRID_AI' or 'TESSERACT_STRICT'
    confidence_threshold: 85,
    auto_validate: true,
    default_export_format: 'excel'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  React.useEffect(() => {
    api.getSettings()
      .then((data) => {
        if (data) {
          setProfile({
            name: data.name || user?.name || 'Alex Rivera',
            email: user?.email || 'demo@billwise.ai',
            business_name: data.business_name || 'Nova Retail Logistics',
            tax_id: data.tax_id || 'US-EIN-94-2819034',
            currency: data.currency || 'USD',
            ocr_engine: data.ocr_engine || 'HYBRID_AI',
            confidence_threshold: data.confidence_threshold || 85,
            auto_validate: data.auto_validate ?? true,
            default_export_format: data.default_export_format || 'excel'
          });
        }
      })
      .catch((err) => {
        console.warn('Could not load settings from server, using local defaults:', err);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings(profile);
      addToast('Preferences saved and persisted successfully', 'success');
    } catch (err) {
      addToast(`Failed to persist settings: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemo = async () => {
    if (!window.confirm('Reset all demo documents, extractions, and validations to initial hackathon state?')) {
      return;
    }
    setResetting(true);
    try {
      await api.resetDemo();
      addToast('Demo database successfully re-seeded to pristine demo state!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#F4F7F5] tracking-tight">
          System Configuration & Preferences
        </h1>
        <p className="text-xs text-[#929F98] mt-1">
          Configure business identity, OCR extraction thresholds, and hackathon presentation settings.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Business Profile */}
        <div className="p-6 rounded-2xl bg-[#151D19] border border-[#1D2B24] space-y-4">
          <h3 className="text-sm font-bold text-[#F4F7F5] uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-[#20D69A]" />
            <span>Business Entity Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#929F98] mb-1 font-semibold">Legal Business Name</label>
              <input
                type="text"
                value={profile.business_name}
                onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                className="w-full bg-[#101613] border border-[#1D2B24] rounded-lg px-3 py-2 text-[#F4F7F5] focus:outline-none focus:border-[#20D69A]/50"
              />
            </div>

            <div>
              <label className="block text-[#929F98] mb-1 font-semibold">Tax ID / EIN</label>
              <input
                type="text"
                value={profile.tax_id}
                onChange={(e) => setProfile({ ...profile, tax_id: e.target.value })}
                className="w-full bg-[#101613] border border-[#1D2B24] rounded-lg px-3 py-2 text-[#F4F7F5] font-mono focus:outline-none focus:border-[#20D69A]/50"
              />
            </div>

            <div>
              <label className="block text-[#929F98] mb-1 font-semibold">Primary Currency</label>
              <select
                value={profile.currency}
                onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                className="w-full bg-[#101613] border border-[#1D2B24] rounded-lg px-3 py-2 text-[#F4F7F5] focus:outline-none focus:border-[#20D69A]/50"
              >
                <option value="USD">USD ($) — United States Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
                <option value="INR">INR (₹) — Indian Rupee</option>
                <option value="CAD">CAD ($) — Canadian Dollar</option>
              </select>
            </div>

            <div>
              <label className="block text-[#929F98] mb-1 font-semibold">Reviewer Profile</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-[#101613] border border-[#1D2B24] rounded-lg px-3 py-2 text-[#F4F7F5] focus:outline-none focus:border-[#20D69A]/50"
              />
            </div>
          </div>
        </div>

        {/* Section 2: OCR & Intelligent Processing */}
        <div className="p-6 rounded-2xl bg-[#151D19] border border-[#1D2B24] space-y-4">
          <h3 className="text-sm font-bold text-[#F4F7F5] uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#8AF0C7]" />
            <span>OCR & Validation Engine Rules</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[#929F98] mb-1 font-semibold">Extraction Engine Pipeline</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setProfile({ ...profile, ocr_engine: 'HYBRID_AI' })}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    profile.ocr_engine === 'HYBRID_AI'
                      ? 'bg-[#18231E] border-[#20D69A]'
                      : 'bg-[#101613] border-[#1D2B24]'
                  }`}
                >
                  <div className="font-bold text-[#F4F7F5]">Hybrid AI & Rule Engine (Recommended)</div>
                  <div className="text-[11px] text-[#929F98] mt-1">
                    Uses OCR with regex pattern matching and automatic deterministic sample fallbacks.
                  </div>
                </div>

                <div
                  onClick={() => setProfile({ ...profile, ocr_engine: 'TESSERACT_STRICT' })}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    profile.ocr_engine === 'TESSERACT_STRICT'
                      ? 'bg-[#18231E] border-[#20D69A]'
                      : 'bg-[#101613] border-[#1D2B24]'
                  }`}
                >
                  <div className="font-bold text-[#F4F7F5]">Local Binary OCR Only</div>
                  <div className="text-[11px] text-[#929F98] mt-1">
                    Forces strict host Tesseract OCR execution on raw image bitmaps.
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[#929F98] font-semibold">High Confidence Threshold Alert</label>
                <span className="font-mono text-[#20D69A] font-bold">{profile.confidence_threshold}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="98"
                value={profile.confidence_threshold}
                onChange={(e) => setProfile({ ...profile, confidence_threshold: parseInt(e.target.value) })}
                className="w-full accent-[#20D69A] cursor-pointer"
              />
              <span className="text-[10px] text-[#929F98]">
                Fields with confidence lower than this threshold will be flagged in yellow or red.
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="autoValidate"
                checked={profile.auto_validate}
                onChange={(e) => setProfile({ ...profile, auto_validate: e.target.checked })}
                className="rounded border-[#1D2B24] bg-[#101613] text-[#20D69A]"
              />
              <label htmlFor="autoValidate" className="text-xs text-[#F4F7F5] cursor-pointer">
                Automatically execute validation engine immediately upon document upload
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Hackathon Demo Reset State */}
        <div className="p-6 rounded-2xl bg-[#1D1517] border border-[#FF646D]/30 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#FF646D]">
            <Database className="w-4 h-4" />
            <span>Hackathon Presentation Reset</span>
          </div>
          <p className="text-xs text-[#929F98]">
            Need to start fresh for a live demonstration? This restores the sample invoices (Clean, Error, Duplicate) and resets all approval states.
          </p>
          <button
            type="button"
            onClick={handleResetDemo}
            disabled={resetting}
            className="px-4 py-2 rounded-xl bg-[#FF646D]/20 hover:bg-[#FF646D]/30 text-[#FF646D] border border-[#FF646D]/40 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? 'Resetting Database...' : 'Reset Demo Data to Pristine State'}</span>
          </button>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#20D69A] to-[#16B580] text-[#080B0A] font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(32,214,154,0.3)] flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

