import { useState } from 'react';
import { Search, CheckCircle2, Circle, Loader2, CreditCard, Receipt, Check, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { STATUS_ORDER, STATUS_CONFIG, formatDateTime, formatCurrency, formatDate } from '../../lib/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import { initiateRazorpayPayment } from '../../lib/razorpay';
import toast from 'react-hot-toast';

export default function TrackRepairPage() {
  const [repairId, setRepairId] = useState('');
  const [repair, setRepair] = useState(null);
  const [history, setHistory] = useState([]);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!repairId.trim()) return;
    setLoading(true);
    setError('');
    setRepair(null);
    setInvoice(null);
    setSearched(true);

    try {
      const { data, error: err } = await supabase
        .from('repairs')
        .select(`*, customers(full_name, phone, email), services(service_name), technicians(name)`)
        .eq('repair_id', repairId.trim().toUpperCase())
        .single();

      if (err || !data) {
        setError('No repair found with this ID. Please check and try again.');
        return;
      }

      setRepair(data);

      const [{ data: hist }, { data: inv }] = await Promise.all([
        supabase
          .from('repair_history')
          .select('*')
          .eq('repair_id', data.id)
          .order('created_at', { ascending: true }),
        supabase
          .from('invoices')
          .select('*')
          .eq('repair_id', data.id)
          .maybeSingle()
      ]);

      setHistory(hist || []);
      setInvoice(inv || null);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!invoice) return;
    setPaying(true);
    try {
      const response = await initiateRazorpayPayment({
        amount: invoice.total_amount,
        invoiceNumber: invoice.invoice_number,
        repairId: repair.repair_id,
        customerName: repair.customers?.full_name || '',
        customerEmail: repair.customers?.email || '',
        customerPhone: repair.customers?.phone || '',
      });

      const updateData = {
        payment_status: 'paid',
        payment_method: 'Razorpay',
        transaction_id: response.razorpay_payment_id,
        paid_at: new Date().toISOString()
      };

      try {
        await supabase.from('invoices').update(updateData).eq('id', invoice.id);
      } catch {
        await supabase.from('invoices').update({ payment_status: 'paid' }).eq('id', invoice.id);
      }

      toast.success('Payment successful via Razorpay!');
      setInvoice((prev) => ({ ...prev, ...updateData }));
    } catch (err) {
      if (err.message !== 'Payment cancelled by user.') {
        toast.error(err.message || 'Payment failed');
      }
    } finally {
      setPaying(false);
    }
  };

  const currentIndex = repair ? STATUS_ORDER.indexOf(repair.status) : -1;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-32 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-1/2 w-96 h-96 rounded-full bg-cyan-400 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Track Your Repair</h1>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto mb-8">Enter your Repair ID to check the current status of your device</p>

          <form onSubmit={handleTrack} className="max-w-lg mx-auto">
            <div className="flex gap-2 bg-white/10 backdrop-blur rounded-2xl p-2">
              <input
                type="text"
                value={repairId}
                onChange={(e) => setRepairId(e.target.value)}
                placeholder="Enter Repair ID (e.g., SHR-2026-00001)"
                className="flex-1 px-5 py-3 bg-white rounded-xl text-gray-900 placeholder-gray-400 outline-none font-mono text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Track
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="py-16 bg-gray-50 min-h-[40vh]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          {repair && (
            <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
              {/* Repair Info */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Repair ID</p>
                    <p className="text-xl font-bold text-gray-900 font-mono">{repair.repair_id}</p>
                  </div>
                  <StatusBadge status={repair.status} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Device</p>
                    <p className="font-semibold text-gray-900 text-sm">{repair.device_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Brand / Model</p>
                    <p className="font-semibold text-gray-900 text-sm">{repair.brand} {repair.model}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Service</p>
                    <p className="font-semibold text-gray-900 text-sm">{repair.services?.service_name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Technician</p>
                    <p className="font-semibold text-gray-900 text-sm">{repair.technicians?.name || 'Not Assigned'}</p>
                  </div>
                </div>
              </div>

              {/* Invoice & Razorpay Card (if invoice generated) */}
              {invoice && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Repair Invoice #{invoice.invoice_number}</h4>
                        <p className="text-xs text-gray-400">Date: {formatDate(invoice.invoice_date)}</p>
                      </div>
                    </div>
                    {invoice.payment_status === 'paid' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        <Check className="w-3.5 h-3.5" /> PAID VIA RAZORPAY
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                        PAYMENT PENDING
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4 bg-gray-50 p-3 rounded-xl">
                    <div>
                      <p className="text-gray-500">Service</p>
                      <p className="font-semibold text-gray-800">{formatCurrency(invoice.service_charge)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Parts</p>
                      <p className="font-semibold text-gray-800">{formatCurrency(invoice.parts_cost)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Labour</p>
                      <p className="font-semibold text-gray-800">{formatCurrency(invoice.labour_charge)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Amount</p>
                      <p className="font-bold text-sm text-blue-600">{formatCurrency(invoice.total_amount)}</p>
                    </div>
                  </div>

                  {invoice.payment_status === 'paid' ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-green-700 bg-green-50 p-3 rounded-xl border border-green-200">
                      <span>✓ Payment received via Razorpay (Txn ID: {invoice.transaction_id || 'RZP-PAID'})</span>
                      <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-700 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" /> Receipt
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <p className="text-xs text-gray-500">Pay securely with UPI, Credit/Debit Card, or NetBanking</p>
                      <button
                        onClick={handlePayNow}
                        disabled={paying}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {paying ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-3.5 h-3.5" /> Pay {formatCurrency(invoice.total_amount)} via Razorpay
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Timeline */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-lg text-gray-900 mb-6">Repair Progress</h3>
                <div className="space-y-0">
                  {STATUS_ORDER.map((status, i) => {
                    const isCompleted = i <= currentIndex;
                    const isCurrent = i === currentIndex;
                    const config = STATUS_CONFIG[status];
                    const histEntry = history.find((h) => h.status === status);

                    return (
                      <div key={status} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          {isCompleted ? (
                            <CheckCircle2 className={`w-7 h-7 shrink-0 ${isCurrent ? 'text-blue-600 animate-pulse' : 'text-green-500'}`} />
                          ) : (
                            <Circle className="w-7 h-7 text-gray-300 shrink-0" />
                          )}
                          {i < STATUS_ORDER.length - 1 && (
                            <div className={`w-0.5 h-10 ${isCompleted ? 'bg-green-300' : 'bg-gray-200'}`} />
                          )}
                        </div>
                        <div className="pb-8">
                          <p className={`font-semibold text-sm ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                            {config.label}
                          </p>
                          {histEntry && (
                            <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(histEntry.created_at)}</p>
                          )}
                          {histEntry?.notes && (
                            <p className="text-xs text-gray-400 mt-0.5">{histEntry.notes}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {!repair && searched && !error && !loading && (
            <div className="text-center py-12 text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No results found</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
