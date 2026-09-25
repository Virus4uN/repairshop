import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Plus, Eye, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import { formatDate } from '../../lib/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    const { data } = await supabase.from('customers').select('*, repairs(id)').order('created_at', { ascending: false });
    setCustomers(data || []);
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await supabase.from('customers').update(form).eq('id', editing.id);
        toast.success('Customer updated');
      } else {
        await supabase.from('customers').insert(form);
        toast.success('Customer added');
      }
      setShowModal(false);
      setEditing(null);
      setForm({ full_name: '', email: '', phone: '', address: '' });
      fetchCustomers();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleEdit = (c) => {
    setEditing(c);
    setForm({ full_name: c.full_name, email: c.email, phone: c.phone || '', address: c.address || '' });
    setShowModal(true);
  };

  const handleDelete = async () => {
    await supabase.from('customers').delete().eq('id', deleteId);
    toast.success('Customer deleted');
    fetchCustomers();
  };

  const filtered = customers.filter((c) =>
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
        <button onClick={() => { setEditing(null); setForm({ full_name: '', email: '', phone: '', address: '' }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm">
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..."
          className="w-full sm:w-80 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Repairs</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3.5 font-medium text-sm text-gray-900">{c.full_name}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{c.email}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{c.phone || '—'}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold">{c.repairs?.length || 0}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(c.created_at)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(c)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold mb-4">{editing ? 'Edit Customer' : 'Add Customer'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Full Name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
              <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" rows="2"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none" />
              <button type="submit" disabled={saving}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? 'Update' : 'Add Customer'}
              </button>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Customer" message="Are you sure you want to delete this customer? This action cannot be undone." />
    </div>
  );
}
