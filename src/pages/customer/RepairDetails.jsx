import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { CheckCircle2, Circle, ArrowLeft, CreditCard, Receipt, Download, Loader2, Check } from 'lucide-react';
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

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const { data } = await supabase
        .from('repairs')
        .select('*, customers(full_name, phone, email), services(service_name), technicians(name)')
        .eq('id', id)
        .single();
      setRepair(data);

      const { data: hist } = await supabase
        .from('repair_history')
        .select('*')
        .eq('repair_id', id)
        .order('created_at', { ascending: true });
      setHistory(hist || []);

      // Fetch associated invoice
      const { data: inv } = await supabase
        .from('invoices')
        .select('*')
        .eq('repair_id', id)
        .maybeSingle();
      setInvoice(inv || null);
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
        customerName: repair.customers?.full_name || '',
        customerEmail: repair.customers?.email || '',
        customerPhone: repair.customers?.phone || '',
      });

      // Update invoice in Supabase
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

  const handlePrintInvoice = () => {
    window.print();
  };

  if (loading) return <LoadingSpinner />;
  if (!repair) return <div className="text-center py-12 text-gray-500">Repair not found</div>;

  const currentIndex = STATUS_ORDER.indexOf(repair.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/customer/my-repairs" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" /> Back to My Repairs
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Repair ID</p>
            <p className="text-2xl font-bold text-gray-900 font-mono">{repair.repair_id}</p>
          </div>
          <StatusBadge status={repair.status} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><p className="text-gray-500 text-xs">Device</p><p className="font-semibold">{repair.device_type}</p></div>
          <div><p className="text-gray-500 text-xs">Brand / Model</p><p className="font-semibold">{repair.brand} {repair.model}</p></div>
          <div><p className="text-gray-500 text-xs">Service</p><p className="font-semibold">{repair.services?.service_name || '—'}</p></div>
          <div><p className="text-gray-500 text-xs">Technician</p><p className="font-semibold">{repair.technicians?.name || 'Not Assigned'}</p></div>
        </div>
      </div>

      {/* Invoice & Razorpay Payment Card */}
      {invoice ? (
        <div className="bg-gradient-to-br from-white to-blue-50/40 rounded-2xl p-6 shadow-sm border border-blue-100">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Billing & Invoice</h3>
                <p className="text-xs text-gray-500">Invoice #{invoice.invoice_number} • {formatDate(invoice.invoice_date)}</p>
              </div>
            </div>

            {invoice.payment_status === 'paid' ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                <Check className="w-4 h-4" /> PAID VIA RAZORPAY
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 animate-pulse">
                PAYMENT PENDING
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-6 bg-white p-4 rounded-xl border border-gray-100">
            <div>
              <p className="text-xs text-gray-500">Service Charge</p>
              <p className="font-semibold text-gray-900">{formatCurrency(invoice.service_charge)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Spare Parts Cost</p>
              <p className="font-semibold text-gray-900">{formatCurrency(invoice.parts_cost)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Labour Charge</p>
              <p className="font-semibold text-gray-900">{formatCurrency(invoice.labour_charge)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Payable</p>
              <p className="text-lg font-bold text-blue-600">{formatCurrency(invoice.total_amount)}</p>
            </div>
          </div>

          {invoice.payment_status === 'paid' ? (
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-green-50/80 border border-green-200">
              <div>
                <p className="text-xs text-green-800 font-semibold">Payment Completed Successfully</p>
                <p className="text-xs text-green-700 font-mono mt-0.5">
                  Transaction ID: {invoice.transaction_id || 'RZP-PAID'}
                </p>
              </div>
              <button
                onClick={handlePrintInvoice}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 border border-gray-200 transition-all shadow-sm"
              >
                <Download className="w-4 h-4" /> Download / Print Invoice
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div>
                <p className="text-xs text-gray-600 font-medium">Pay securely online via UPI, Credit/Debit Card, or NetBanking</p>
                <p className="text-[11px] text-gray-400">Powered by Razorpay Official Payment Gateway</p>
              </div>
              <button
                onClick={handlePayNow}
                disabled={paying}
                className="inline-flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
              >
                {paying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing Razorpay...
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
      ) : null}

      {/* Problem & Diagnosis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-2">Problem Reported</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{repair.problem}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-2">Technician Diagnosis</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{repair.diagnosis || 'Pending diagnosis by assigned technician.'}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-6">Repair Progress</h3>
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
                  {i < STATUS_ORDER.length - 1 && <div className={`w-0.5 h-10 ${isCompleted ? 'bg-green-300' : 'bg-gray-200'}`} />}
                </div>
                <div className="pb-8">
                  <p className={`font-semibold text-sm ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{config.label}</p>
                  {histEntry && <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(histEntry.created_at)}</p>}
                  {histEntry?.notes && <p className="text-xs text-gray-400 mt-0.5">{histEntry.notes}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      {repair.status === 'completed' && (
        <div className="flex gap-3">
          <Link to={`/customer/feedback/${repair.id}`} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm">
            Give Feedback
          </Link>
        </div>
      )}
    </div>
  );
}
