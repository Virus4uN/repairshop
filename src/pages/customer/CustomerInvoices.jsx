import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Receipt, CreditCard, Check, Clock, Download, ArrowUpRight, Search, Loader2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { initiateRazorpayPayment } from '../../lib/razorpay';
import toast from 'react-hot-toast';

export default function CustomerInvoices() {
  const { profile } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unpaid, paid
  const [payingId, setPayingId] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, [profile]);

  const fetchInvoices = async () => {
    if (!profile) return;
    try {
      // Find customer ID
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (!customer) {
        setLoading(false);
        return;
      }

      // Fetch all customer repairs
      const { data: repairs } = await supabase
        .from('repairs')
        .select('id, repair_id, device_type, brand, model')
        .eq('customer_id', customer.id);

      if (!repairs || repairs.length === 0) {
        setInvoices([]);
        setLoading(false);
        return;
      }

      const repairIds = repairs.map((r) => r.id);

      // Fetch invoices for these repairs
      const { data: invs } = await supabase
        .from('invoices')
        .select('*')
        .in('repair_id', repairIds)
        .order('invoice_date', { ascending: false });

      // Join repair info
      const enriched = (invs || []).map((inv) => ({
        ...inv,
        repair: repairs.find((r) => r.id === inv.repair_id)
      }));

      setInvoices(enriched);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (inv) => {
    setPayingId(inv.id);
    try {
      const response = await initiateRazorpayPayment({
        amount: inv.total_amount,
        invoiceNumber: inv.invoice_number,
        repairId: inv.repair?.repair_id || '',
        customerName: profile?.full_name || '',
        customerEmail: profile?.email || '',
        customerPhone: profile?.phone || '',
      });

      const updateData = {
        payment_status: 'paid',
        payment_method: 'Razorpay',
        transaction_id: response.razorpay_payment_id,
        paid_at: new Date().toISOString()
      };

      try {
        await supabase.from('invoices').update(updateData).eq('id', inv.id);
      } catch {
        await supabase.from('invoices').update({ payment_status: 'paid' }).eq('id', inv.id);
      }

      toast.success('Payment successful via Razorpay!');
      setInvoices((prev) =>
        prev.map((item) => (item.id === inv.id ? { ...item, ...updateData } : item))
      );
    } catch (err) {
      if (err.message !== 'Payment cancelled by user.') {
        toast.error(err.message || 'Payment failed');
      }
    } finally {
      setPayingId(null);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === 'unpaid') return inv.payment_status !== 'paid';
    if (filter === 'paid') return inv.payment_status === 'paid';
    return true;
  });

  const totalBilled = invoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
  const totalPaid = invoices
    .filter((inv) => inv.payment_status === 'paid')
    .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
  const pendingAmount = totalBilled - totalPaid;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices & Payments</h1>
          <p className="text-sm text-gray-500">Pay bills securely with Razorpay and download receipts</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Invoiced</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBilled)}</p>
          <p className="text-xs text-gray-400 mt-1">{invoices.length} invoices generated</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
          <p className="text-xs text-gray-400 mt-1">Paid securely online</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Pending Balance</p>
          <p className="text-2xl font-bold text-amber-600">{formatCurrency(pendingAmount)}</p>
          <p className="text-xs text-gray-400 mt-1">Awaiting online payment</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {[
          { key: 'all', label: 'All Invoices' },
          { key: 'unpaid', label: 'Pending Payment' },
          { key: 'paid', label: 'Completed Payments' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              filter === tab.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-800 text-lg mb-1">No Invoices Found</h3>
          <p className="text-sm text-gray-500">
            {filter === 'unpaid'
              ? 'Great news! You have zero pending payments.'
              : 'Invoices will appear here once your device diagnosis is completed.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInvoices.map((inv) => (
            <div
              key={inv.id}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:border-blue-100 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-gray-900 text-base">
                        #{inv.invoice_number || 'INV-DRAFT'}
                      </span>
                      {inv.payment_status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <Check className="w-3.5 h-3.5" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 animate-pulse">
                          <Clock className="w-3.5 h-3.5" /> Pending Payment
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Repair ID: <span className="font-mono font-medium text-blue-600">{inv.repair?.repair_id || '—'}</span> •{' '}
                      {inv.repair?.device_type} ({inv.repair?.brand} {inv.repair?.model}) • Issued on {formatDate(inv.invoice_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 self-end lg:self-center">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(inv.total_amount)}</p>
                  </div>

                  {inv.payment_status === 'paid' ? (
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold border border-gray-200 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Receipt
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePay(inv)}
                      disabled={payingId === inv.id}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
                    >
                      {payingId === inv.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" /> Pay via Razorpay
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {inv.payment_status === 'paid' && inv.transaction_id && (
                <div className="mt-4 pt-3 border-t border-gray-50 text-[11px] text-gray-400 font-mono">
                  Razorpay Transaction Reference: {inv.transaction_id}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
