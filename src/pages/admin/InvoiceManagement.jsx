import { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { Plus, Eye, X, Loader2, FileText, CheckCircle2, Clock, Printer } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm] = useState({
    repair_id: '',
    service_charge: 499,
    parts_cost: 0,
    labour_charge: 300,
    discount: 0,
    payment_status: 'unpaid',
    payment_method: 'Razorpay',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    const [inv, rep] = await Promise.all([
      dataService.getInvoices(),
      dataService.getRepairs(),
    ]);
    setInvoices(inv || []);
    setRepairs(rep || []);
    setLoading(false);
  };

  const total = Number(form.service_charge || 0) + Number(form.parts_cost || 0) + Number(form.labour_charge || 0) - Number(form.discount || 0);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.repair_id) {
      toast.error('Please select a repair ticket');
      return;
    }
    setSaving(true);
    try {
      await dataService.createInvoice({
        ...form,
        service_charge: Number(form.service_charge),
        parts_cost: Number(form.parts_cost),
        labour_charge: Number(form.labour_charge),
        discount: Number(form.discount),
        total_amount: Math.max(0, total),
      });
      toast.success('Invoice generated successfully');
      setShowCreate(false);
      setForm({
        repair_id: '',
        service_charge: 499,
        parts_cost: 0,
        labour_charge: 300,
        discount: 0,
        payment_status: 'unpaid',
        payment_method: 'Razorpay',
      });
      fetch();
    } catch (err) {
      toast.error('Error creating invoice: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const togglePayment = async (inv) => {
    const newStatus = inv.payment_status === 'paid' ? 'unpaid' : 'paid';
    const updates = {
      payment_status: newStatus,
      paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
      transaction_id: newStatus === 'paid' ? (inv.transaction_id || `manual_pay_${Date.now()}`) : null,
    };
    await dataService.updateInvoice(inv.id, updates);
    toast.success(`Invoice marked as ${newStatus.toUpperCase()}`);
    fetch();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Invoices</h1>
          <p className="text-gray-500 text-sm">Manage billing, receipts, and Razorpay payment transactions</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" /> Generate Invoice
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3 font-semibold">Invoice #</th>
                <th className="px-5 py-3 font-semibold">Repair Ticket</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Total Amount</th>
                <th className="px-5 py-3 font-semibold">Payment Status</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-400 text-sm">
                    No invoices generated yet.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-sm font-bold text-gray-900">{inv.invoice_number}</td>
                    <td className="px-5 py-3.5 text-sm text-blue-600 font-mono font-semibold">
                      {inv.repairs?.repair_id || inv.repair?.repair_id || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-700 font-medium">
                      {inv.repairs?.customers?.full_name || inv.repair?.customers?.full_name || 'Walk-in Customer'}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-bold text-gray-900">{formatCurrency(inv.total_amount)}</td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => togglePayment(inv)}
                        title="Click to toggle Paid/Unpaid"
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-transform hover:scale-105 ${
                          inv.payment_status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inv.payment_status === 'paid' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {inv.payment_status?.toUpperCase()}
                      </button>
                      {inv.payment_status === 'paid' && (
                        <span className="block text-[10px] text-gray-400 font-mono mt-0.5">
                          {inv.payment_method || 'Razorpay'} {inv.transaction_id ? `(${inv.transaction_id.slice(-8)})` : ''}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(inv.invoice_date)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setShowDetail(inv)}
                        className="inline-flex items-center gap-1 p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 cursor-pointer text-xs font-semibold"
                      >
                        <Eye className="w-4 h-4" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <button onClick={() => setShowCreate(false)} className="absolute top-4 right-4 text-gray-400 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Generate Service Invoice</h3>
            <p className="text-xs text-gray-500 mb-4">Select ticket and enter fee breakdown</p>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Repair Ticket *</label>
                <select
                  required
                  value={form.repair_id}
                  onChange={(e) => setForm({ ...form, repair_id: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Select Repair Ticket</option>
                  {repairs.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.repair_id} - {r.customers?.full_name || 'Customer'} ({r.brand} {r.model || r.device_type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Service Fee (₹)</label>
                  <input
                    type="number"
                    value={form.service_charge}
                    onChange={(e) => setForm({ ...form, service_charge: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Parts Cost (₹)</label>
                  <input
                    type="number"
                    value={form.parts_cost}
                    onChange={(e) => setForm({ ...form, parts_cost: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Labour Charge (₹)</label>
                  <input
                    type="number"
                    value={form.labour_charge}
                    onChange={(e) => setForm({ ...form, labour_charge: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Discount (₹)</label>
                  <input
                    type="number"
                    value={form.discount}
                    onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl flex justify-between items-center text-sm font-bold text-blue-950">
                <span>Calculated Total:</span>
                <span className="text-base text-blue-700">{formatCurrency(Math.max(0, total))}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm & Save Invoice'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Invoice Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDetail(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <button onClick={() => setShowDetail(null)} className="absolute top-4 right-4 text-gray-400 cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-bold text-gray-900 text-base">{showDetail.invoice_number}</h3>
                <p className="text-xs text-gray-500">Date: {formatDate(showDetail.invoice_date)}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm border border-gray-100 mb-4">
              <div className="flex justify-between text-xs text-gray-600 pb-2 border-b border-gray-200">
                <span>Customer:</span>
                <span className="font-semibold text-gray-900">{showDetail.repairs?.customers?.full_name || showDetail.repair?.customers?.full_name || 'Customer'}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 pb-2 border-b border-gray-200">
                <span>Device Ticket:</span>
                <span className="font-mono font-semibold text-blue-600">{showDetail.repairs?.repair_id || showDetail.repair?.repair_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Service Fee:</span>
                <span>{formatCurrency(showDetail.service_charge)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Parts:</span>
                <span>{formatCurrency(showDetail.parts_cost)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Labour:</span>
                <span>{formatCurrency(showDetail.labour_charge)}</span>
              </div>
              {showDetail.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(showDetail.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200 text-gray-900">
                <span>Total Amount:</span>
                <span className="text-blue-600">{formatCurrency(showDetail.total_amount)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50 mb-4">
              <span className="text-xs font-semibold text-gray-600">Status:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                showDetail.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {showDetail.payment_status?.toUpperCase()}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setShowDetail(null)}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
