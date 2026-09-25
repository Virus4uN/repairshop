import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Plus, Edit2, Trash2, X, Loader2, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../lib/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';

export default function SparePartsManagement() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ part_name: '', category: '', quantity: 0, price: 0, supplier: '', min_stock: 5 });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch(); }, []);
  const fetch = async () => { const { data } = await supabase.from('spare_parts').select('*').order('part_name'); setParts(data || []); setLoading(false); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) { await supabase.from('spare_parts').update(form).eq('id', editing.id); } else { await supabase.from('spare_parts').insert(form); }
      toast.success(editing ? 'Updated' : 'Added');
      setShowModal(false); setEditing(null); setForm({ part_name: '', category: '', quantity: 0, price: 0, supplier: '', min_stock: 5 }); fetch();
    } catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };

  const handleEdit = (p) => { setEditing(p); setForm({ part_name: p.part_name, category: p.category || '', quantity: p.quantity, price: p.price, supplier: p.supplier || '', min_stock: p.min_stock || 5 }); setShowModal(true); };
  const handleDelete = async () => { await supabase.from('spare_parts').delete().eq('id', deleteId); toast.success('Deleted'); fetch(); };

  const filtered = parts.filter((p) => p.part_name?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()));
  const lowStock = parts.filter((p) => p.quantity <= p.min_stock && p.quantity > 0).length;
  const outOfStock = parts.filter((p) => p.quantity === 0).length;

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Spare Parts / Inventory</h1>
        <button onClick={() => { setEditing(null); setForm({ part_name: '', category: '', quantity: 0, price: 0, supplier: '', min_stock: 5 }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm">
          <Plus className="w-4 h-4" /> Add Part
        </button>
      </div>

      {/* Alerts */}
      {(lowStock > 0 || outOfStock > 0) && (
        <div className="flex gap-3 mb-4">
          {lowStock > 0 && <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-sm font-medium"><AlertTriangle className="w-4 h-4" />{lowStock} items low stock</div>}
          {outOfStock > 0 && <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl text-sm font-medium"><AlertTriangle className="w-4 h-4" />{outOfStock} items out of stock</div>}
        </div>
      )}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search parts..." className="w-full sm:w-80 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100 bg-gray-50/50">
              <th className="px-5 py-3 font-medium">Part Name</th><th className="px-5 py-3 font-medium">Category</th><th className="px-5 py-3 font-medium">Qty</th>
              <th className="px-5 py-3 font-medium">Price</th><th className="px-5 py-3 font-medium">Supplier</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3.5 font-medium text-sm">{p.part_name}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{p.category || '—'}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold">{p.quantity}</td>
                  <td className="px-5 py-3.5 text-sm">{formatCurrency(p.price)}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{p.supplier || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      p.quantity === 0 ? 'bg-red-100 text-red-700' : p.quantity <= p.min_stock ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                    }`}>{p.quantity === 0 ? 'Out of Stock' : p.quantity <= p.min_stock ? 'Low Stock' : 'Available'}</span>
                  </td>
                  <td className="px-5 py-3.5"><div className="flex gap-1">
                    <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div></td>
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
            <h3 className="text-lg font-bold mb-4">{editing ? 'Edit Part' : 'Add Part'}</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <input required value={form.part_name} onChange={(e) => setForm({ ...form, part_name: e.target.value })} placeholder="Part Name" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" />
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" />
              <div className="grid grid-cols-3 gap-3">
                <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })} placeholder="Qty" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" />
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} placeholder="Price" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" />
                <input type="number" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: parseInt(e.target.value) || 5 })} placeholder="Min Stock" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" />
              </div>
              <input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="Supplier" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" />
              <button type="submit" disabled={saving} className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? 'Update' : 'Add Part'}
              </button>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Part" message="Are you sure?" />
    </div>
  );
}
