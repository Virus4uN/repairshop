import { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { Plus, Edit2, Trash2, X, Loader2, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../lib/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';

export default function ServiceManagement() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ service_name: '', description: '', estimated_time: '', price: 0, is_active: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    const data = await dataService.getServices();
    setServices(data || []);
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dataService.saveService(
        editing
          ? { ...form, id: editing.id, price: Number(form.price) }
          : { ...form, price: Number(form.price) }
      );
      toast.success(editing ? 'Service updated' : 'Service added to catalog');
      setShowModal(false);
      setEditing(null);
      setForm({ service_name: '', description: '', estimated_time: '', price: 0, is_active: true });
      fetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (s) => {
    setEditing(s);
    setForm({
      service_name: s.service_name,
      description: s.description || '',
      estimated_time: s.estimated_time || '',
      price: s.price || 0,
      is_active: s.is_active !== false,
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await dataService.deleteService(deleteId);
    toast.success('Service removed');
    setDeleteId(null);
    fetch();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Catalog</h1>
          <p className="text-gray-500 text-sm">Configure repair packages, turnaround estimates, and pricing</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setForm({ service_name: '', description: '', estimated_time: '1-3 Hours', price: 499, is_active: true });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <div
            key={s.id}
            className={`bg-white rounded-2xl p-5 shadow-sm border transition-all ${
              s.is_active ? 'border-gray-100 hover:shadow-md' : 'border-red-200 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 text-base">{s.service_name}</h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(s)}
                  className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteId(s.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">
              {s.description || 'Professional diagnosis and component-level repair service.'}
            </p>
            <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100">
              <span className="text-gray-500 font-medium">⏱ {s.estimated_time || '2-4 Hours'}</span>
              <span className="font-bold text-sm text-blue-600">{formatCurrency(s.price)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{editing ? 'Edit Service' : 'Add Repair Service'}</h3>
            <p className="text-xs text-gray-500 mb-4">Set service name, turnaround estimate, and pricing</p>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Service Title *</label>
                <input
                  required
                  value={form.service_name}
                  onChange={(e) => setForm({ ...form, service_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none"
                  placeholder="e.g. Drone Repair"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Est. Turnaround</label>
                  <input
                    value={form.estimated_time}
                    onChange={(e) => setForm({ ...form, estimated_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none"
                    placeholder="1-3 Hours"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded text-blue-600 cursor-pointer"
                />
                <label htmlFor="is_active" className="text-xs font-semibold text-gray-700 cursor-pointer">
                  Service active and visible to customers
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Service'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <ConfirmModal
          title="Delete Service"
          message="Are you sure you want to remove this repair service?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
