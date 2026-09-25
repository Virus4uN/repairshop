import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Eye, X, Loader2, FileText } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm] = useState({ repair_id: '', service_charge: 0, parts_cost: 0, labour_charge: 0, discount: 0, payment_status: 'unpaid' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch(); }, []);
  const fetch = async () => {
    const [{ data: inv }, { data: rep }] = await Promise.all([
      supabase.from('invoices').select('*, repairs(repair_id, customers(full_name), device_type, brand)').order('invoice_date', { ascending: false }),
      supabase.from('repairs').select('id, repair_id, device_type, brand, customers(full_name)').eq('status', 'completed'),
    ]);
    setInvoices(inv || []); setRepairs(rep || []); setLoading(false);
  };

  const total = form.service_charge + form.parts_cost + form.labour_charge - form.discount;

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await supabase.from('invoices').insert({ ...form, total_amount: total });
      toast.success('Invoice created'); setShowCreate(false); setForm({ repair_id: '', service_charge: 0, parts_cost: 0, labour_charge: 0, discount: 0, payment_status: 'unpaid' }); fetch();
    } catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };

  const togglePayment = async (inv) => {
    const newStatus = inv.payment_status === 'paid' ? 'unpaid' : 'paid';
    await supabase.from('invoices').update({ payment_status: newStatus }).eq('id', inv.id);
    toast.success(`Marked as ${newStatus}`); fetch();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Invoices</h1>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm">
          <Plus className="w-4 h-4" /> Generate Invoice
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100 bg-gray-50/50">
              <th className="px-5 py-3 font-medium">Invoice #</th><th className="px-5 py-3 font-medium">Repair ID</th><th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Total</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Date</th><th className="px-5 py-3 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3.5 font-mono text-sm font-semibold">{inv.invoice_number}</td>
                  <td className="px-5 py-3.5 text-sm text-blue-600 font-mono">{inv.repairs?.repair_id}</td>
                  <td className="px-5 py-3.5 text-sm">{inv.repairs?.customers?.full_name || '—'}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold">{formatCurrency(inv.total_amount)}</td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => togglePayment(inv)} className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer ${inv.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {inv.payment_status?.toUpperCase()}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(inv.invoice_date)}</td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => setShowDetail(inv)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Eye className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <button onClick={() => setShowCreate(false)} className="absolute top-4 right-4 text-gray-400"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold mb-4">Generate Invoice</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <select required value={form.repair_id} onChange={(e) => setForm({ ...form, repair_id: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none">
                <option value="">Select Repair</option>
                {repairs.map((r) => <option key={r.id} value={r.id}>{r.repair_id} - {r.customers?.full_name} ({r.device_type})</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500">Service Charge</label><input type="number" value={form.service_charge} onChange={(e) => setForm({ ...form, service_charge: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none" /></div>
                <div><label className="text-xs text-gray-500">Parts Cost</label><input type="number" value={form.parts_cost} onChange={(e) => setForm({ ...form, parts_cost: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none" /></div>
                <div><label className="text-xs text-gray-500">Labour Charge</label><input type="number" value={form.labour_charge} onChange={(e) => setForm({ ...form, labour_charge: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none" /></div>
                <div><label className="text-xs text-gray-500">Discount</label><input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none" /></div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(total)}</p>
              </div>
              <select value={form.payment_status} onChange={(e) => setForm({ ...form, payment_status: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none">
                <option value="unpaid">Unpaid</option><option value="paid">Paid</option>
              </select>
              <button type="submit" disabled={saving} className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Invoice'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDetail(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8" id="invoice-print">
            <button onClick={() => setShowDetail(null)} className="absolute top-4 right-4 text-gray-400 print:hidden"><X className="w-5 h-5" /></button>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">SMART HUB REPAIR</h2>
              <p className="text-sm text-gray-500">Repair Invoice</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div><p className="text-gray-500">Invoice No</p><p className="font-semibold">{showDetail.invoice_number}</p></div>
              <div><p className="text-gray-500">Repair ID</p><p className="font-semibold font-mono">{showDetail.repairs?.repair_id}</p></div>
              <div><p className="text-gray-500">Customer</p><p className="font-semibold">{showDetail.repairs?.customers?.full_name}</p></div>
              <div><p className="text-gray-500">Date</p><p className="font-semibold">{formatDate(showDetail.invoice_date)}</p></div>
            </div>
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Service Charges</span><span>{formatCurrency(showDetail.service_charge)}</span></div>
              <div className="flex justify-between"><span>Parts Cost</span><span>{formatCurrency(showDetail.parts_cost)}</span></div>
              <div className="flex justify-between"><span>Labour Charges</span><span>{formatCurrency(showDetail.labour_charge)}</span></div>
              <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(showDetail.discount)}</span></div>
              <hr />
              <div className="flex justify-between font-bold text-lg"><span>Total</span><span>{formatCurrency(showDetail.total_amount)}</span></div>
              <div className="text-center mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${showDetail.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {showDetail.payment_status?.toUpperCase()}
                </span>
              </div>
            </div>
            <button onClick={() => window.print()} className="w-full mt-6 py-2.5 border border-gray-200 rounded-xl font-semibold text-sm hover:bg-gray-50 print:hidden">
              🖨️ Print Invoice
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
