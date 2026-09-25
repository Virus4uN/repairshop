import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Loader2, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerProfile() {
  const { profile, updateProfile } = useAuth();
  const [form, setForm] = useState({ full_name: profile?.full_name || '', phone: profile?.phone || '' });
  const [passForm, setPassForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ full_name: form.full_name, phone: form.phone });
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update'); }
    finally { setLoading(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (passForm.password !== passForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passForm.password.length < 6) { toast.error('Min 6 characters'); return; }
    setPassLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passForm.password });
      if (error) throw error;
      toast.success('Password updated!');
      setPassForm({ password: '', confirmPassword: '' });
    } catch (err) { toast.error(err.message); }
    finally { setPassLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      {/* Profile Info */}
      <form onSubmit={handleUpdate} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
            {profile?.full_name?.[0] || 'U'}
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-900">{profile?.full_name}</h2>
            <p className="text-sm text-gray-500">{profile?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm flex items-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
        </button>
      </form>

      {/* Change Password */}
      <form onSubmit={handlePassword} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h3 className="font-bold text-gray-900">Change Password</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" value={passForm.password} onChange={(e) => setPassForm({ ...passForm, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="Min 6 characters" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input type="password" value={passForm.confirmPassword} onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="Re-enter password" />
          </div>
        </div>
        <button type="submit" disabled={passLoading}
          className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-semibold text-sm flex items-center gap-2 disabled:opacity-50">
          {passLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
