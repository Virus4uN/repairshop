import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/dataService';
import { ArrowLeft, Loader2, Save, Wrench, ShieldCheck, Clock } from 'lucide-react';
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

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const rep = await dataService.getRepairById(id);
      if (rep) {
        setRepair(rep);
        setForm({
          diagnosis: rep.diagnosis || '',
          status: rep.status,
          estimated_completion: rep.estimated_completion || '',
          notes: '',
        });
      }
      const parts = await dataService.getSpareParts();
      setSpareParts(parts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dataService.updateRepair(id, {
        diagnosis: form.diagnosis,
        status: form.status,
        estimated_completion: form.estimated_completion || null,
      });

      // Add history entry
      if (form.status !== repair.status || form.notes) {
        await dataService.addRepairHistory(
          id,
          form.status,
          form.notes || `Status updated to ${STATUS_CONFIG[form.status]?.label || form.status}`,
          profile?.id
        );
      }

      toast.success('Repair progress saved successfully');
      fetchData();
      setForm((prev) => ({ ...prev, notes: '' }));
    } catch (err) {
      toast.error('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!repair) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8">
        <p className="text-gray-500 mb-4">Repair record not found.</p>
        <Link to="/technician/dashboard" className="text-blue-600 font-semibold hover:underline">
          ← Return to Workbench
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/technician/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Device Info Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
          <div>
            <span className="font-mono text-xs font-semibold text-gray-400 uppercase">Ticket ID</span>
            <p className="text-2xl font-bold font-mono text-gray-900">{repair.repair_id}</p>
          </div>
          <StatusBadge status={repair.status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
            <span className="text-[11px] font-semibold text-gray-400 uppercase">Device</span>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{repair.brand} {repair.model || repair.device_type}</p>
            <p className="text-xs text-gray-500 font-mono">Serial: {repair.serial_number || 'N/A'}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
            <span className="text-[11px] font-semibold text-gray-400 uppercase">Customer</span>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{repair.customers?.full_name || 'Customer'}</p>
            <p className="text-xs text-gray-500">{repair.customers?.phone || 'No phone'}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
            <span className="text-[11px] font-semibold text-gray-400 uppercase">Target Service</span>
            <p className="text-sm font-bold text-blue-600 mt-0.5">{repair.services?.service_name || 'General Repair'}</p>
            <p className="text-xs text-gray-500">Booked: {formatDate(repair.created_at)}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <span className="text-[11px] font-semibold text-gray-400 uppercase block mb-1">Customer Reported Problem</span>
          <p className="text-xs text-gray-700 bg-gray-50/70 p-3 rounded-xl border border-gray-100 leading-relaxed">
            {repair.problem}
          </p>
        </div>
      </div>

      {/* Work Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-blue-600" /> Technician Findings & Updates
        </h3>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Detailed Technical Diagnosis</label>
          <textarea
            rows="3"
            value={form.diagnosis}
            onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm resize-none"
            placeholder="Document circuit tests, component health, and root cause findings..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Repair Stage Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white outline-none focus:border-blue-500"
            >
              {STATUS_ORDER.map((k) => (
                <option key={k} value={k}>
                  {STATUS_CONFIG[k]?.label || k}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Estimated Ready Date</label>
            <input
              type="date"
              value={form.estimated_completion}
              onChange={(e) => setForm({ ...form, estimated_completion: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Work Log Notes (Optional)</label>
          <input
            type="text"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500"
            placeholder="e.g. Replaced display connector, tested thermal throttling..."
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Work Update</>}
          </button>
        </div>
      </form>
    </div>
  );
}
