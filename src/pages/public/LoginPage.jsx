import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Wrench, Loader2, ShieldCheck, UserCog, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'admin') navigate('/admin/dashboard', { replace: true });
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
        navigate('/admin/dashboard', { replace: true });
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

  const handleQuickLogin = (quickEmail, quickPassword) => {
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
          <p className="text-gray-500 mb-6">Sign in to your account to continue</p>

          {/* Quick Demo Credentials Selector */}
          <div className="mb-6 p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-800 mb-2">⚡ Quick Demo Login (Click to fill):</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('sc7348509580@gmail.com', 'With6342@')}
                className="p-2 rounded-xl bg-white border border-blue-200 hover:border-blue-500 hover:shadow-sm text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Admin
                </div>
                <span className="text-[10px] text-gray-500 block truncate">sc7348509580</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('tech@smarthub.com', 'Tech1234@')}
                className="p-2 rounded-xl bg-white border border-blue-200 hover:border-blue-500 hover:shadow-sm text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-0.5">
                  <UserCog className="w-3.5 h-3.5 text-amber-600" /> Technician
                </div>
                <span className="text-[10px] text-gray-500 block truncate">tech@smarthub</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('customer@smarthub.com', 'Customer1234@')}
                className="p-2 rounded-xl bg-white border border-blue-200 hover:border-blue-500 hover:shadow-sm text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-0.5">
                  <User className="w-3.5 h-3.5 text-green-600" /> Customer
                </div>
                <span className="text-[10px] text-gray-500 block truncate">customer</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all pr-12 text-sm"
                  placeholder="Enter your password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
