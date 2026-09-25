import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Wrench, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success('Password reset link sent!');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="p-2 rounded-xl bg-blue-600"><Wrench className="w-5 h-5 text-white" /></div>
          <span className="font-bold text-lg text-gray-900">Smart Hub Repair</span>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Check Your Email</h2>
              <p className="text-gray-500 text-sm mb-6">We've sent a password reset link to <strong>{email}</strong></p>
              <Link to="/login" className="text-blue-600 font-semibold text-sm hover:text-blue-700">
                ← Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Forgot Password?</h2>
              <p className="text-gray-500 text-sm mb-6">Enter your email and we'll send you a reset link</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="you@example.com" />
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                </button>
              </form>
              <Link to="/login" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mt-4 justify-center">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
