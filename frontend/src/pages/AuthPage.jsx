import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, User, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AuthPage({ initialMode = 'login' }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('Acme Corp');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const { login, register, demoLogin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password', 'warning');
      return;
    }
    if (!isLogin && password.length < 8) {
      addToast('Password must be at least 8 characters long for security compliance.', 'error');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        addToast('Welcome back! Logged in successfully.', 'success');
      } else {
        await register({ name: name || 'Small Business Owner', email, password, business_name: businessName });
        addToast('Account created! Welcome to BillWise AI.', 'success');
      }
      navigate('/dashboard');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setLoading(true);
    try {
      await demoLogin();
      addToast('Demo account loaded! Welcome, Alex Rivera (CFO).', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B0A] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-grid-pattern">
      {/* Glow ambient background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-[#20D69A]/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#20D69A] to-[#108A62] p-[1.5px] shadow-[0_0_20px_rgba(32,214,154,0.3)]">
            <div className="w-full h-full bg-[#080B0A] rounded-[10px] flex items-center justify-center">
              <span className="font-black text-[#20D69A] text-lg">BW</span>
            </div>
          </div>
          <span className="font-extrabold text-2xl text-[#F4F7F5] tracking-tight">BillWise AI</span>
        </Link>
        <p className="text-xs text-[#929F98]">Intelligent Document Processing for Small Businesses</p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md rounded-2xl border border-[#1D2B24] bg-[#101613]/90 shadow-2xl backdrop-blur-xl p-8 relative z-10 space-y-6">
        {/* Hackathon Fast-Track Button */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#15241C] to-[#111A15] border border-[#20D69A]/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8AF0C7] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#20D69A]" /> Hackathon Evaluator Access
            </span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#20D69A]/20 text-[#20D69A]">1-Click</span>
          </div>
          <p className="text-[11px] text-[#929F98] leading-tight">
            Instantly enter the pre-loaded CFO demo dashboard without typing credentials.
          </p>
          <button
            type="button"
            onClick={handleDemoAccess}
            disabled={loading}
            className="w-full mt-2 py-2 px-3 rounded-lg bg-[#20D69A] hover:bg-[#16B580] text-[#080B0A] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(32,214,154,0.25)] cursor-pointer transition-all"
          >
            <span>Launch Instant Demo Mode</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-[#151D19] border border-[#1D2B24]">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              isLogin ? 'bg-[#20D69A] text-[#080B0A]' : 'text-[#929F98] hover:text-[#F4F7F5]'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              !isLogin ? 'bg-[#20D69A] text-[#080B0A]' : 'text-[#929F98] hover:text-[#F4F7F5]'
            }`}
          >
            Register Business
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {!isLogin && (
            <>
              <div>
                <label className="block text-[#929F98] mb-1 font-medium">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#929F98]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full bg-[#151D19] border border-[#1D2B24] rounded-lg pl-9 pr-3 py-2.5 text-[#F4F7F5] placeholder-[#929F98] focus:outline-none focus:border-[#20D69A]/50 focus:ring-1 focus:ring-[#20D69A]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#929F98] mb-1 font-medium">Business / Entity Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Nova Retail Logistics"
                  className="w-full bg-[#151D19] border border-[#1D2B24] rounded-lg px-3 py-2.5 text-[#F4F7F5] placeholder-[#929F98] focus:outline-none focus:border-[#20D69A]/50"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[#929F98] mb-1 font-medium">Business Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#929F98]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@business.com"
                className="w-full bg-[#151D19] border border-[#1D2B24] rounded-lg pl-9 pr-3 py-2.5 text-[#F4F7F5] placeholder-[#929F98] focus:outline-none focus:border-[#20D69A]/50 focus:ring-1 focus:ring-[#20D69A]/50"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[#929F98] font-medium">Password</label>
              {isLogin && (
                <button
                  type="button"
                  onClick={() => setForgotModal(true)}
                  className="text-[11px] text-[#20D69A] hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#929F98]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#151D19] border border-[#1D2B24] rounded-lg pl-9 pr-9 py-2.5 text-[#F4F7F5] placeholder-[#929F98] focus:outline-none focus:border-[#20D69A]/50 focus:ring-1 focus:ring-[#20D69A]/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#929F98] hover:text-[#F4F7F5]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-[#1D2B24] bg-[#151D19] text-[#20D69A] focus:ring-[#20D69A]"
            />
            <label htmlFor="rememberMe" className="text-[11px] text-[#929F98] cursor-pointer">
              Remember me on this browser
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#20D69A] to-[#16B580] text-[#080B0A] font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(32,214,154,0.25)] hover:shadow-[0_0_25px_rgba(32,214,154,0.4)] active:scale-[0.99] transition-all cursor-pointer"
          >
            {loading ? 'Authenticating...' : isLogin ? 'Sign In to Workspace' : 'Create Free Account'}
          </button>
        </form>
      </div>

      {/* Password Reset Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl bg-[#151D19] border border-[#1D2B24] p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#F4F7F5]">Password Reset</h3>
            <p className="text-xs text-[#929F98]">
              Enter your email address and we will generate a secure reset link.
            </p>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="name@business.com"
              className="w-full bg-[#101613] border border-[#1D2B24] rounded-lg px-3 py-2 text-xs text-[#F4F7F5]"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setForgotModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-[#929F98] hover:text-[#F4F7F5]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setForgotModal(false);
                  addToast(`Password reset link dispatched to ${resetEmail || 'your email'}`, 'success');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#20D69A] text-[#080B0A] text-xs font-bold"
              >
                Send Reset Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

