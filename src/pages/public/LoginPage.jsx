import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Eye, EyeOff, Wrench, Loader2, ShieldCheck, UserCog, User, Mail, KeyRound, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [loginMode, setLoginMode] = useState('password'); // 'password' or 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const { signIn, user, profile, fetchProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'admin') navigate('/admin', { replace: true });
      else if (profile.role === 'technician') navigate('/technician/dashboard', { replace: true });
      else navigate('/customer/dashboard', { replace: true });
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn({ email, password });
      toast.success('Welcome back!');
      const role = res?.profile?.role || (email.toLowerCase() === 'sc7348509580@gmail.com' ? 'admin' : 'customer');
      if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (role === 'technician') {
        navigate('/technician/dashboard', { replace: true });
      } else {
        navigate('/customer/dashboard', { replace: true });
      }
    } catch (err) {
      toast.error(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    setOtpLoading(true);
    try {
      // 1. Try direct Gmail SMTP via serverless route
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.ok) {
        setOtpSent(true);
        toast.success(`Verification code sent to ${email}! Check your Gmail inbox.`);
        return;
      }

      // 2. Fallback to Supabase OTP
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) throw error;

      setOtpSent(true);
      toast.success(`Verification code sent to ${email}! Check your inbox.`);
    } catch (err) {
      console.error('OTP error:', err);
      toast.error(err.message || 'Failed to send OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    setOtpLoading(true);
    try {
      // 1. Try serverless verification route
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });

      if (res.ok) {
        const json = await res.json();
        toast.success('OTP verified successfully!');
        const role = json.user?.role || (email.toLowerCase() === 'sc7348509580@gmail.com' ? 'admin' : 'customer');
        if (role === 'admin') navigate('/admin', { replace: true });
        else if (role === 'technician') navigate('/technician/dashboard', { replace: true });
        else navigate('/customer/dashboard', { replace: true });
        return;
      }

      // 2. Fallback to Supabase verifyOtp
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: 'email',
      });

      if (error) throw error;

      if (data?.user) {
        toast.success('Email verified successfully!');
        const prof = await fetchProfile(data.user.id, data.user);
        const role = prof?.role || (email.toLowerCase() === 'sc7348509580@gmail.com' ? 'admin' : 'customer');
        if (role === 'admin') navigate('/admin', { replace: true });
        else if (role === 'technician') navigate('/technician/dashboard', { replace: true });
        else navigate('/customer/dashboard', { replace: true });
      }
    } catch (err) {
      toast.error(err.message || 'Invalid or expired OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail, quickPassword) => {
    setLoginMode('password');
    setEmail(quickEmail);
    setPassword(quickPassword);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-600 to-indigo-700 items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden">
          <img src="/images/hero-repair.jpg" alt="Repair" className="w-full h-full object-cover opacity-20" />
        </div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-6">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Smart Hub Repair</h2>
          <p className="text-blue-200 text-lg max-w-sm">Your trusted partner for all electronic device repair services</p>
        </div>
      </div>

      {/* Right - Form & Quick Login */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="p-2 rounded-xl bg-blue-600">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">Smart Hub Repair</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h1>
          <p className="text-gray-500 mb-5 text-sm">Sign in to your account to continue</p>

          {/* Quick Demo Credentials Selector */}
          <div className="mb-5 p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-800 mb-2">
              ⚡ Quick Demo 1-Click Fill:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('sc7348509580@gmail.com', 'With6342@')}
                className="p-2 rounded-xl bg-white border border-blue-200 hover:border-blue-500 hover:shadow-sm text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Admin
                </div>
                <span className="text-[10px] text-gray-500 block truncate">sc7348509580</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('tech@smarthub.com', 'Tech1234@')}
                className="p-2 rounded-xl bg-white border border-blue-200 hover:border-blue-500 hover:shadow-sm text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-0.5">
                  <UserCog className="w-3.5 h-3.5 text-amber-600" /> Technician
                </div>
                <span className="text-[10px] text-gray-500 block truncate">tech@smarthub</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('customer@smarthub.com', 'Customer1234@')}
                className="p-2 rounded-xl bg-white border border-blue-200 hover:border-blue-500 hover:shadow-sm text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-0.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" /> Customer
                </div>
                <span className="text-[10px] text-gray-500 block truncate">customer</span>
              </button>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex p-1 bg-gray-200/70 rounded-xl mb-5">
            <button
              type="button"
              onClick={() => {
                setLoginMode('password');
                setOtpSent(false);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                loginMode === 'password' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('otp')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                loginMode === 'otp' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Email OTP Login
            </button>
          </div>

          {/* Password Login Form */}
          {loginMode === 'password' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm bg-white"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold uppercase text-gray-600">Password</label>
                  <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none pr-10 text-sm bg-white"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 text-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In with Password'}
              </button>
            </form>
          )}

          {/* Email OTP Login Form */}
          {loginMode === 'otp' && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Your Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm bg-white"
                      placeholder="e.g. sc7348509580@gmail.com"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 text-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Mail className="w-4 h-4" /> Send Login Code (OTP)</>}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-900">
                    OTP sent to <span className="font-bold">{email}</span>. Please check your inbox or spam folder.
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      required
                      maxLength="6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 text-center font-mono text-xl tracking-widest outline-none bg-white font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md text-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><KeyRound className="w-4 h-4" /> Verify OTP & Sign In</>}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-xs text-blue-600 hover:underline cursor-pointer font-medium"
                    >
                      Change Email or Resend Code
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-bold hover:underline">
              Create New Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
