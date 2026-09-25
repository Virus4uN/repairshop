import { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { Search, Plus, Edit2, Trash2, X, Loader2, AlertTriangle, Package } from 'lucide-react';
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

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    const data = await dataService.getSpareParts();
    setParts(data || []);
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dataService.saveSparePart(
        editing
          ? { ...form, id: editing.id, quantity: Number(form.quantity), price: Number(form.price), min_stock: Number(form.min_stock) }
          : { ...form, quantity: Number(form.quantity), price: Number(form.price), min_stock: Number(form.min_stock) }
      );
      toast.success(editing ? 'Inventory item updated' : 'Part added to inventory');
      setShowModal(false);
      setEditing(null);
      setForm({ part_name: '', category: '', quantity: 0, price: 0, supplier: '', min_stock: 5 });
      fetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p) => {
    setEditing(p);
    setForm({
      part_name: p.part_name,
      category: p.category || '',
      quantity: p.quantity,
      price: p.price,
      supplier: p.supplier || '',
      min_stock: p.min_stock || 5,
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await dataService.deleteSparePart(deleteId);
    toast.success('Part deleted');
    setDeleteId(null);
    fetch();
  };

  const filtered = parts.filter(
    (p) =>
      p.part_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()) ||
      p.supplier?.toLowerCase().includes(search.toLowerCase())
  );

  const lowStock = parts.filter((p) => p.quantity <= (p.min_stock || 5) && p.quantity > 0).length;
  const outOfStock = parts.filter((p) => p.quantity === 0).length;

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory & Spare Parts</h1>
          <p className="text-gray-500 text-sm">Monitor hardware stock levels, pricing, and suppliers</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setForm({ part_name: '', category: '', quantity: 10, price: 500, supplier: '', min_stock: 5 });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" /> Add Part
        </button>
      </div>

      {/* Alerts */}
      {(lowStock > 0 || outOfStock > 0) && (
        <div className="flex flex-wrap gap-3 mb-4">
          {lowStock > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-800 rounded-xl text-xs font-semibold border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              {lowStock} items currently low in stock
            </div>
          )}
          {outOfStock > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-800 rounded-xl text-xs font-semibold border border-red-200">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              {outOfStock} items out of stock
            </div>
          )}
        </div>
      )}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search spare parts or category..."
          className="w-full sm:w-80 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3 font-semibold">Part Description</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Stock Quantity</th>
                <th className="px-5 py-3 font-semibold">Unit Price</th>
                <th className="px-5 py-3 font-semibold">Supplier</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const isOut = p.quantity === 0;
                const isLow = !isOut && p.quantity <= (p.min_stock || 5);
                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-bold text-gray-900">{p.part_name}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {p.category || 'General'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-bold text-gray-900">{p.quantity} units</td>
                    <td className="px-5 py-3.5 text-sm font-bold text-blue-600">{formatCurrency(p.price)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{p.supplier || 'OEM'}</td>
                    <td className="px-5 py-3.5 text-sm">
                      {isOut ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">OUT OF STOCK</span>
                      ) : isLow ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">LOW STOCK</span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">IN STOCK</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{editing ? 'Edit Part' : 'Add Inventory Part'}</h3>
            <p className="text-xs text-gray-500 mb-4">Enter component specifications and stock details</p>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Part Description *</label>
                <input
                  required
                  value={form.part_name}
                  onChange={(e) => setForm({ ...form, part_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none"
                  placeholder="e.g. iPhone 15 Pro OLED Screen"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Category</label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none"
                    placeholder="Displays, Batteries, etc."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Min Threshold</label>
                  <input
                    type="number"
                    value={form.min_stock}
                    onChange={(e) => setForm({ ...form, min_stock: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Supplier</label>
                <input
                  value={form.supplier}
                  onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none"
                  placeholder="e.g. Apex Tech Supplies"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Part'}
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
          title="Remove Spare Part"
          message="Are you sure you want to delete this spare part record?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
