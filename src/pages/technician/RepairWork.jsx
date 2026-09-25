import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { STATUS_ORDER, STATUS_CONFIG, formatDate } from '../../lib/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function RepairWork() {
  const { id } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [repair, setRepair] = useState(null);
  const [spareParts, setSpareParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ diagnosis: '', status: '', estimated_completion: '', notes: '' });

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    const { data } = await supabase.from('repairs').select('*, customers(full_name, phone, email), services(service_name)').eq('id', id).single();
    if (data) {
      setRepair(data);
      setForm({ diagnosis: data.diagnosis || '', status: data.status, estimated_completion: data.estimated_completion || '', notes: '' });
    }
    const { data: parts } = await supabase.from('spare_parts').select('*').gt('quantity', 0);
    setSpareParts(parts || []);
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await supabase.from('repairs').update({
        diagnosis: form.diagnosis,
        status: form.status,
        estimated_completion: form.estimated_completion || null,
      }).eq('id', id);

      // Add history entry
      if (form.status !== repair.status || form.notes) {
        await supabase.from('repair_history').insert({
          repair_id: id,
          status: form.status,
          notes: form.notes || `Status updated to ${STATUS_CONFIG[form.status]?.label}`,
          updated_by: profile.id,
        });
      }

      toast.success('Repair updated successfully');
      fetchData();
      setForm((prev) => ({ ...prev, notes: '' }));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!repair) return <div className="text-center py-12 text-gray-500">Repair not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/technician/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Repair Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Repair ID</p>
            <p className="text-xl font-bold font-mono text-gray-900">{repair.repair_id}</p>
          </div>
          <StatusBadge status={repair.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-sm text-gray-900 mb-2">Customer Details</h4>
            <p className="text-sm text-gray-600">{repair.customers?.full_name}</p>
            <p className="text-sm text-gray-500">{repair.customers?.email}</p>
            <p className="text-sm text-gray-500">{repair.customers?.phone}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-sm text-gray-900 mb-2">Device Details</h4>
            <p className="text-sm text-gray-600">{repair.device_type} - {repair.brand} {repair.model}</p>
            <p className="text-sm text-gray-500">Service: {repair.services?.service_name || '—'}</p>
            <p className="text-sm text-gray-500 mt-2 font-medium">Problem:</p>
            <p className="text-sm text-gray-600">{repair.problem}</p>
          </div>
        </div>
      </div>

      {/* Update Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
        <h3 className="font-bold text-gray-900 text-lg">Update Repair</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
          <textarea rows="3" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
            placeholder="Enter your diagnosis..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Repair Notes</label>
          <textarea rows="3" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
            placeholder="Add notes about the repair work..." />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Completion</label>
            <input type="date" value={form.estimated_completion} onChange={(e) => setForm({ ...form, estimated_completion: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-blue-500 outline-none">
              {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
            </select>
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Update</>}
        </button>
      </form>
    </div>
  );
}
