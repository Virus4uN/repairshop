import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Eye,
  EyeOff,
  Wrench,
  Loader2,
  User,
  UserCog,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Smartphone,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [role, setRole] = useState('customer'); // 'customer' or 'technician'
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    specialization: 'Smartphone & Tablet Repair',
    password: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await signUp({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        phone: form.phone,
        address: form.address,
        role: role,
        specialization: role === 'technician' ? form.specialization : '',
      });

      if (res?.instantLogin) {
        if (role === 'technician') {
          toast.success('Technician Workbench account created & signed in!');
          navigate('/technician/dashboard', { replace: true });
        } else {
          toast.success('Customer account created & signed in!');
          navigate('/customer/dashboard', { replace: true });
        }
      } else {
        toast.success('Account created successfully! Please sign in.');
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Hero Graphic */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-700 via-blue-700 to-slate-900 items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <img src="/images/about-workshop.jpg" alt="Workshop" className="w-full h-full object-cover opacity-20" />
        </div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">Smart Hub Portal</h2>
          <p className="text-blue-100 text-sm leading-relaxed mb-6">
            Join our unified electronic repair network. Whether you are a device owner seeking expert repairs or a hardware technician managing bench jobs, get started in seconds.
          </p>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 text-left space-y-2.5 text-xs text-white">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Customer Portal: 5-Stage Live Device Tracking & Razorpay</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Technician Workbench: Job Queues, Stage Controls & Diagnostics</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Verified 90-Day Warranty Protection on all repairs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Container */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md py-6">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="p-2 rounded-xl bg-blue-600">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">Smart Hub Repair</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create an Account</h1>
          <p className="text-gray-500 text-xs sm:text-sm mb-5">Select your role and enter your details to register</p>

          {/* Role Choice Selector */}
          <div className="mb-6 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Choose Account Type:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Customer Option */}
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  role === 'customer'
                    ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                      role === 'customer' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <User className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-bold ${role === 'customer' ? 'text-blue-900' : 'text-gray-800'}`}>
                    Customer
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">
                  Book repairs, track device status & pay bills
                </p>
                {role === 'customer' && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600" />
                )}
              </button>

              {/* Technician / Repair Panel Option */}
              <button
                type="button"
                onClick={() => setRole('technician')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  role === 'technician'
                    ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                      role === 'technician' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <UserCog className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-bold ${role === 'technician' ? 'text-emerald-900' : 'text-gray-800'}`}>
                    Technician
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">
                  Repair workbench, diagnostic notes & job queue
                </p>
                {role === 'technician' && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-600" />
                )}
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold uppercase text-gray-600 mb-1">Full Name *</label>
              <input
                name="fullName"
                type="text"
                required
                value={form.fullName}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-xs bg-white"
                placeholder={role === 'technician' ? 'e.g. Vikram Singh (Hardware Engineer)' : 'e.g. Rahul Sharma'}
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-gray-600 mb-1">Email Address *</label>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-xs bg-white"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-gray-600 mb-1">Mobile Number *</label>
              <input
                name="phone"
                type="tel"
                required
                value={form.phone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-xs bg-white"
                placeholder="+91 98765 43210"
              />
            </div>

            {/* Role-Specific Field: Specialization for Technician */}
            {role === 'technician' ? (
              <div>
                <label className="block font-semibold uppercase text-gray-600 mb-1">Hardware Specialization *</label>
                <select
                  name="specialization"
                  value={form.specialization}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs bg-white"
                >
                  <option value="Smartphone & Tablet Repair">Smartphone & Tablet Repair</option>
                  <option value="Laptop & Motherboard Micro-soldering">Laptop & Motherboard Micro-soldering</option>
                  <option value="Apple Mac & iPhone Hardware Specialist">Apple Mac & iPhone Hardware Specialist</option>
                  <option value="Screen Refurbishment & Display OCA">Screen Refurbishment & Display OCA</option>
                  <option value="General Electronics & Audio/TV">General Electronics & Audio/TV</option>
                </select>
              </div>
            ) : null}

            <div>
              <label className="block font-semibold uppercase text-gray-600 mb-1">
                {role === 'technician' ? 'Lab Location / City Address' : 'Doorstep Pickup & Delivery Address'}
              </label>
              <textarea
                name="address"
                rows={2}
                value={form.address}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-xs bg-white resize-none"
                placeholder={role === 'technician' ? 'e.g. Lab Bench 3, Electronics Market, Delhi' : 'e.g. Flat 402, Green Valley Apartments, Mumbai'}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold uppercase text-gray-600 mb-1">Password *</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none pr-9 text-xs bg-white"
                    placeholder="Min 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase text-gray-600 mb-1">Confirm Password *</label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-xs bg-white"
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-white rounded-xl font-bold shadow-md text-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 mt-2 ${
                role === 'technician'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/20'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20'
              }`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Create {role === 'technician' ? 'Technician Workbench' : 'Customer'} Account <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-bold hover:underline">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
