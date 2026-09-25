import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';
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

  useEffect(() => { fetch(); }, []);
  const fetch = async () => { const { data } = await supabase.from('services').select('*').order('created_at', { ascending: false }); setServices(data || []); setLoading(false); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) { await supabase.from('services').update(form).eq('id', editing.id); }
      else { await supabase.from('services').insert(form); }
      toast.success(editing ? 'Updated' : 'Added');
      setShowModal(false); setEditing(null); setForm({ service_name: '', description: '', estimated_time: '', price: 0, is_active: true }); fetch();
    } catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };

  const handleEdit = (s) => { setEditing(s); setForm({ service_name: s.service_name, description: s.description || '', estimated_time: s.estimated_time || '', price: s.price || 0, is_active: s.is_active }); setShowModal(true); };
  const handleDelete = async () => { await supabase.from('services').delete().eq('id', deleteId); toast.success('Deleted'); fetch(); };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Service Management</h1>
        <button onClick={() => { setEditing(null); setForm({ service_name: '', description: '', estimated_time: '', price: 0, is_active: true }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm">
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <div key={s.id} className={`bg-white rounded-2xl p-5 shadow-sm border transition-all ${s.is_active ? 'border-gray-100' : 'border-red-200 opacity-60'}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900">{s.service_name}</h3>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(s)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => setDeleteId(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{s.description || 'No description'}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">⏱ {s.estimated_time || '—'}</span>
              <span className="font-semibold text-blue-600">{formatCurrency(s.price)}</span>
            </div>
            <div className="mt-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {s.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold mb-4">{editing ? 'Edit Service' : 'Add Service'}</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <input required value={form.service_name} onChange={(e) => setForm({ ...form, service_name: e.target.value })} placeholder="Service Name" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows="3" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <input value={form.estimated_time} onChange={(e) => setForm({ ...form, estimated_time: e.target.value })} placeholder="Est. Time (e.g., 1-3 hrs)" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" />
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} placeholder="Price" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" />
              </div>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" /><span className="text-sm">Active</span></label>
              <button type="submit" disabled={saving} className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? 'Update' : 'Add Service'}
              </button>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Service" message="Are you sure?" />
    </div>
  );
}
