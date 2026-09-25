import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dataService } from '../../lib/dataService';
import { CheckCircle2, Circle, ArrowLeft, CreditCard, Receipt, Download, Loader2, Check, Clock, Wrench } from 'lucide-react';
import { STATUS_ORDER, STATUS_CONFIG, formatDate, formatDateTime, formatCurrency } from '../../lib/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { initiateRazorpayPayment } from '../../lib/razorpay';
import toast from 'react-hot-toast';

export default function RepairDetails() {
  const { id } = useParams();
  const [repair, setRepair] = useState(null);
  const [history, setHistory] = useState([]);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const rep = await dataService.getRepairById(id);
      setRepair(rep);

      if (rep) {
        const [hist, inv] = await Promise.all([
          dataService.getRepairHistory(rep.id),
          dataService.getInvoiceByRepairId(rep.id),
        ]);
        setHistory(hist || []);
        setInvoice(inv || null);
      }
    } catch (err) {
      console.error(err);
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
        customerName: repair.customers?.full_name || 'Valued Customer',
        customerEmail: repair.customers?.email || 'customer@smarthub.com',
        customerPhone: repair.customers?.phone || '9999999999',
      });

      // Update invoice in dataService
      await dataService.markInvoicePaid(invoice.id, response);
      toast.success('Payment completed successfully via Razorpay!');
      fetchData();
    } catch (err) {
      if (err.description || err.message) {
        toast.error(err.description || err.message);
      }
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!repair) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8">
        <p className="text-gray-500 mb-4">Repair record not found.</p>
        <Link to="/customer/my-repairs" className="text-blue-600 font-semibold hover:underline">
          ← Return to My Repairs
        </Link>
      </div>
    );
  }

  const currentIndex = STATUS_ORDER.indexOf(repair.status);

  return (
    <div className="space-y-6">
      <Link to="/customer/my-repairs" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to My Repairs
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tracking Reference</p>
            <p className="text-2xl font-bold font-mono text-gray-900">{repair.repair_id}</p>
          </div>
          <StatusBadge status={repair.status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <h4 className="font-bold text-gray-900 text-xs uppercase mb-2">Device Info</h4>
            <p className="text-sm font-semibold text-gray-900">{repair.brand} {repair.model || repair.device_type}</p>
            <p className="text-xs text-gray-500 mt-1">Type: {repair.device_type}</p>
            <p className="text-xs text-gray-400 mt-0.5">Serial: {repair.serial_number || 'Not specified'}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <h4 className="font-bold text-gray-900 text-xs uppercase mb-2">Service Package</h4>
            <p className="text-sm font-semibold text-blue-600">{repair.services?.service_name || 'Standard Repair'}</p>
            <p className="text-xs text-gray-500 mt-1">Technician: {repair.technicians?.name || 'Assigned to Lab'}</p>
            <p className="text-xs text-gray-400 mt-0.5">Submitted: {formatDate(repair.created_at)}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <h4 className="font-bold text-gray-900 text-xs uppercase mb-2">Estimated Completion</h4>
            <p className="text-sm font-bold text-emerald-600">
              {repair.estimated_completion ? formatDate(repair.estimated_completion) : 'Within 24-48 Hours'}
            </p>
            <p className="text-xs text-gray-400 mt-1">Standard turnaround</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-xs font-semibold text-gray-400 uppercase mb-1">Reported Issue</h4>
          <p className="text-sm text-gray-700 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
            {repair.problem}
          </p>
        </div>
      </div>

      {/* Invoice & Payment Card */}
      {invoice && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Service Invoice {invoice.invoice_number}</h3>
                <p className="text-xs text-gray-500">Issued on {formatDate(invoice.invoice_date)}</p>
              </div>
            </div>
            <div>
              {invoice.payment_status === 'paid' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  <Check className="w-3.5 h-3.5" /> PAID VIA RAZORPAY
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  <Clock className="w-3.5 h-3.5" /> PAYMENT PENDING
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-400">Service Fee</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatCurrency(invoice.service_charge)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Parts Cost</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatCurrency(invoice.parts_cost)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Labour</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatCurrency(invoice.labour_charge)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Due</p>
              <p className="text-lg font-bold text-blue-600 mt-0.5">{formatCurrency(invoice.total_amount)}</p>
            </div>
          </div>

          {invoice.payment_status === 'paid' ? (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-emerald-900 font-medium">
                Payment verified. Transaction Ref: <code className="font-mono font-bold">{invoice.transaction_id || 'pay_online'}</code>
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1 bg-white border border-emerald-200 text-emerald-800 rounded-lg font-semibold hover:bg-emerald-100 cursor-pointer transition-colors"
              >
                Print Receipt
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div>
                <p className="text-xs font-bold text-blue-900">Settle your repair bill securely online</p>
                <p className="text-[11px] text-blue-700">UPI, Credit/Debit Cards, NetBanking via Razorpay Gateway</p>
              </div>
              <button
                type="button"
                disabled={paying}
                onClick={handlePayNow}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {paying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Opening Razorpay...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" /> Pay {formatCurrency(invoice.total_amount)} Now
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Progress Timeline */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" /> Real-Time Service Progression
        </h3>
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
  );
}
