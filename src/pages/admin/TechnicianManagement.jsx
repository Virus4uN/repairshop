import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';

export default function TechnicianManagement() {
  const [techs, setTechs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', specialization: '', experience: 0, availability: 'available' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch(); }, []);
  const fetch = async () => { const { data } = await supabase.from('technicians').select('*, repairs(id)').order('created_at', { ascending: false }); setTechs(data || []); setLoading(false); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) { await supabase.from('technicians').update(form).eq('id', editing.id); toast.success('Updated'); }
      else { await supabase.from('technicians').insert(form); toast.success('Added'); }
      setShowModal(false); setEditing(null); setForm({ name: '', email: '', phone: '', specialization: '', experience: 0, availability: 'available' }); fetch();
    } catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };

  const handleEdit = (t) => { setEditing(t); setForm({ name: t.name, email: t.email, phone: t.phone || '', specialization: t.specialization || '', experience: t.experience || 0, availability: t.availability || 'available' }); setShowModal(true); };
  const handleDelete = async () => { await supabase.from('technicians').delete().eq('id', deleteId); toast.success('Deleted'); fetch(); };

  const filtered = techs.filter((t) => t.name?.toLowerCase().includes(search.toLowerCase()) || t.specialization?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Technician Management</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', email: '', phone: '', specialization: '', experience: 0, availability: 'available' }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm">
          <Plus className="w-4 h-4" /> Add Technician
        </button>
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search technicians..."
          className="w-full sm:w-80 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none" />
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100 bg-gray-50/50">
              <th className="px-5 py-3 font-medium">Name</th><th className="px-5 py-3 font-medium">Email</th><th className="px-5 py-3 font-medium">Phone</th>
              <th className="px-5 py-3 font-medium">Specialization</th><th className="px-5 py-3 font-medium">Experience</th><th className="px-5 py-3 font-medium">Jobs</th>
              <th className="px-5 py-3 font-medium">Availability</th><th className="px-5 py-3 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3.5 font-medium text-sm">{t.name}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{t.email}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{t.phone || '—'}</td>
                  <td className="px-5 py-3.5 text-sm">{t.specialization || '—'}</td>
                  <td className="px-5 py-3.5 text-sm">{t.experience} yrs</td>
                  <td className="px-5 py-3.5 text-sm font-semibold">{t.repairs?.length || 0}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${t.availability === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {t.availability}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(t)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(t.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold mb-4">{editing ? 'Edit Technician' : 'Add Technician'}</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" />
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" />
              <input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="Specialization (e.g., Mobile, Laptop)" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: parseInt(e.target.value) || 0 })} placeholder="Experience (years)" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" />
                <select value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none">
                  <option value="available">Available</option><option value="busy">Busy</option><option value="offline">Offline</option>
                </select>
              </div>
              <button type="submit" disabled={saving} className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? 'Update' : 'Add Technician'}
              </button>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Technician" message="Are you sure?" />
    </div>
  );
}
