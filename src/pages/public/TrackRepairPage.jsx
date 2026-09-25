import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, CheckCircle2, Circle, Loader2, CreditCard, Receipt, Check, Download, ArrowRight, ShieldCheck } from 'lucide-react';
import { dataService } from '../../lib/dataService';
import { STATUS_ORDER, STATUS_CONFIG, formatDateTime, formatCurrency, formatDate } from '../../lib/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import { initiateRazorpayPayment } from '../../lib/razorpay';
import toast from 'react-hot-toast';

export default function TrackRepairPage() {
  const [searchParams] = useSearchParams();
  const [repairId, setRepairId] = useState('');
  const [repair, setRepair] = useState(null);
  const [history, setHistory] = useState([]);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  // Auto-search if ?id= is in URL
  useEffect(() => {
    const queryId = searchParams.get('id');
    if (queryId) {
      setRepairId(queryId);
      performSearch(queryId);
    }
  }, [searchParams]);

  const performSearch = async (trackingCode) => {
    if (!trackingCode.trim()) return;
    setLoading(true);
    setError('');
    setRepair(null);
    setInvoice(null);
    setSearched(true);

    try {
      const found = await dataService.getRepairById(trackingCode.trim().toUpperCase());

      if (!found) {
        setError(`No repair found with ID "${trackingCode.trim()}". Try sample ID: SHR-2026-00101`);
        return;
      }

      setRepair(found);

      const [hist, inv] = await Promise.all([
        dataService.getRepairHistory(found.id),
        dataService.getInvoiceByRepairId(found.id),
      ]);

      setHistory(hist || []);
      setInvoice(inv || null);
    } catch (e) {
      setError('An error occurred while tracking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = (e) => {
    e.preventDefault();
    performSearch(repairId);
  };

  const handlePayNow = async () => {
    if (!invoice) return;
    setPaying(true);
    try {
      const response = await initiateRazorpayPayment({
        amount: invoice.total_amount,
        invoiceNumber: invoice.invoice_number,
        repairId: repair.repair_id,
        customerName: repair.customers?.full_name || 'Customer',
        customerEmail: repair.customers?.email || 'customer@smarthub.com',
        customerPhone: repair.customers?.phone || '9999999999',
      });

      await dataService.markInvoicePaid(invoice.id, response);
      toast.success('Payment verified successfully via Razorpay!');
      performSearch(repair.repair_id);
    } catch (err) {
      if (err.description || err.message) {
        toast.error(err.description || err.message);
      }
    } finally {
      setPaying(false);
    }
  };

  const currentIndex = repair ? STATUS_ORDER.indexOf(repair.status) : -1;

  return (
    <div className="py-12 bg-gradient-to-b from-gray-50 via-white to-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Title */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Live Ticket Status
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-3">Track Your Device Repair</h1>
          <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
            Enter your tracking ID (e.g., SHR-2026-00101) to view live inspection, diagnosis, and billing updates.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleTrack} className="mb-8">
          <div className="flex gap-2 max-w-lg mx-auto bg-white p-2 rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={repairId}
                onChange={(e) => setRepairId(e.target.value)}
                placeholder="Enter Repair ID (e.g. SHR-2026-00101)"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none font-mono placeholder:font-sans uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/25 flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Track Ticket'}
            </button>
          </div>

          {/* Quick Demo Suggestions */}
          <div className="text-center mt-3 text-xs text-gray-400">
            <span>Quick test IDs: </span>
            {['SHR-2026-00101', 'SHR-2026-00103', 'SHR-2026-00104'].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setRepairId(id);
                  performSearch(id);
                }}
                className="text-blue-600 font-mono font-semibold hover:underline mx-1.5 cursor-pointer"
              >
                {id}
              </button>
            ))}
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-center text-sm mb-6">
            {error}
          </div>
        )}

        {/* Result */}
        {repair && (
          <div className="space-y-6">
            {/* Overview Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tracking Reference</p>
                  <p className="text-2xl font-bold font-mono text-gray-900">{repair.repair_id}</p>
                </div>
                <StatusBadge status={repair.status} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase">Device</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">
                    {repair.brand} {repair.model || repair.device_type}
                  </p>
                  <p className="text-xs text-gray-500">{repair.device_type}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase">Customer</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{repair.customers?.full_name || 'Customer'}</p>
                  <p className="text-xs text-gray-500">{repair.customers?.phone || 'On file'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase">Est. Completion</p>
                  <p className="text-sm font-bold text-emerald-600 mt-0.5">
                    {repair.estimated_completion ? formatDate(repair.estimated_completion) : 'Within 24-48h'}
                  </p>
                  <p className="text-xs text-gray-500">Service: {repair.services?.service_name || 'Standard'}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1">Issue Reported</p>
                <p className="text-xs text-gray-700 bg-gray-50/70 p-3 rounded-xl border border-gray-100 leading-relaxed">
                  {repair.problem}
                </p>
              </div>

              {repair.diagnosis && (
                <div className="mt-3">
                  <p className="text-[11px] font-semibold text-emerald-600 uppercase mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Technician Diagnosis
                  </p>
                  <p className="text-xs text-emerald-950 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 leading-relaxed">
                    {repair.diagnosis}
                  </p>
                </div>
              )}
            </div>

            {/* Invoice & Razorpay Settlement */}
            {invoice && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">Invoice {invoice.invoice_number}</h3>
                      <p className="text-xs text-gray-400">Total Billed: {formatCurrency(invoice.total_amount)}</p>
                    </div>
                  </div>
                  <div>
                    {invoice.payment_status === 'paid' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <Check className="w-3.5 h-3.5" /> PAID VIA RAZORPAY
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        PAYMENT PENDING
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/70 p-3 rounded-xl border border-gray-100 text-xs mb-4">
                  <div>
                    <span className="text-gray-400 block">Service</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(invoice.service_charge)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Parts</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(invoice.parts_cost)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Labour</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(invoice.labour_charge)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-bold">Total</span>
                    <span className="font-bold text-blue-600 text-sm">{formatCurrency(invoice.total_amount)}</span>
                  </div>
                </div>

                {invoice.payment_status === 'paid' ? (
                  <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-900 p-3 rounded-xl border border-emerald-100">
                    <span>
                      Payment completed. Ref: <code className="font-mono font-bold">{invoice.transaction_id || 'pay_online'}</code>
                    </span>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3 py-1 bg-white border border-emerald-200 text-emerald-800 rounded-lg font-semibold hover:bg-emerald-100 cursor-pointer"
                    >
                      Print Receipt
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div>
                      <p className="text-xs font-bold text-blue-900">Pay your repair invoice online</p>
                      <p className="text-[11px] text-blue-700">Powered by Razorpay Secure Gateway</p>
                    </div>
                    <button
                      type="button"
                      disabled={paying}
                      onClick={handlePayNow}
                      className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {paying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Connecting Razorpay...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" /> Pay {formatCurrency(invoice.total_amount)}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Workflow Progression */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-6">Service Journey</h3>
              <div className="space-y-0">
                {STATUS_ORDER.map((statusKey, i) => {
                  const isCompleted = i <= currentIndex;
                  const isCurrent = i === currentIndex;
                  const config = STATUS_CONFIG[statusKey];
                  const histEntry = history.find((h) => h.status === statusKey);

                  return (
                    <div key={statusKey} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        {isCompleted ? (
                          <CheckCircle2 className={`w-7 h-7 shrink-0 ${isCurrent ? 'text-blue-600' : 'text-emerald-500'}`} />
                        ) : (
                          <Circle className="w-7 h-7 text-gray-300 shrink-0" />
                        )}
                        {i < STATUS_ORDER.length - 1 && (
                          <div className={`w-0.5 h-10 ${isCompleted ? 'bg-emerald-300' : 'bg-gray-200'}`} />
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
                          <p className="text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg mt-1 inline-block border border-gray-100">
                            {histEntry.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
