import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/dataService';
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

  const [generatingDemo, setGeneratingDemo] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [profile]);

  const fetchInvoices = async () => {
    try {
      const allInvoices = await dataService.getInvoices();
      const userEmail = (profile?.email || '').toLowerCase().trim();

      // Filter for current customer
      const myInvoices = allInvoices.filter((inv) => {
        if (!profile || profile.role === 'admin') return true;

        const custEmail = (
          inv.repairs?.customers?.email ||
          inv.repair?.customers?.email ||
          inv.customer_email ||
          ''
        ).toLowerCase().trim();

        const custId = inv.repairs?.customer_id || inv.repair?.customer_id;
        const custUserId = inv.repairs?.customers?.user_id || inv.repair?.customers?.user_id;

        return (
          custEmail === userEmail ||
          custId === profile?.id ||
          custUserId === profile?.id ||
          (userEmail === 'customer@smarthub.com' && (custEmail.includes('customer') || custEmail.includes('smarthub') || !custEmail))
        );
      });
      setInvoices(myInvoices);
    } catch (err) {
      console.error('Invoice fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDemoInvoice = async () => {
    setGeneratingDemo(true);
    try {
      // 1. Ensure customer record exists in Supabase
      const cust = await dataService.saveCustomer({
        user_id: profile?.id || null,
        full_name: profile?.full_name || 'Customer',
        email: profile?.email || 'customer@smarthub.com',
        phone: profile?.phone || '+91 98765 43210',
        address: 'Standard Service Address',
      });

      // 2. Create test repair ticket
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const rep = await dataService.createRepair({
        repair_id: `SHR-${new Date().getFullYear()}-${randomSuffix}`,
        customer_id: cust.id,
        device_type: 'Mobile Phone',
        brand: 'Apple',
        model: 'iPhone 15 Pro',
        problem: 'Display cracked and battery health check',
        status: 'ready_for_pickup',
        estimated_completion: new Date().toISOString().split('T')[0],
      });

      // 3. Create unpaid invoice in Supabase Cloud
      await dataService.createInvoice({
        invoice_number: `INV-${new Date().getFullYear()}-${randomSuffix}`,
        repair_id: rep.id,
        service_charge: 299,
        parts_cost: 400,
        labour_charge: 100,
        discount: 50,
        total_amount: 749,
        payment_status: 'unpaid',
        payment_method: 'Razorpay',
      });

      toast.success('Sample test invoice generated! You can now test paying via Razorpay.');
      fetchInvoices();
    } catch (err) {
      toast.error('Failed to create test invoice: ' + err.message);
    } finally {
      setGeneratingDemo(false);
    }
  };

  const handlePay = async (invoice) => {
    setPayingId(invoice.id);
    try {
      const response = await initiateRazorpayPayment({
        amount: invoice.total_amount,
        invoiceNumber: invoice.invoice_number,
        repairId: invoice.repairs?.repair_id || invoice.repair?.repair_id || 'REPAIR',
        customerName: profile?.full_name || 'Customer',
        customerEmail: profile?.email || 'customer@smarthub.com',
        customerPhone: profile?.phone || '9999999999',
      });

      // Update in dataService
      await dataService.markInvoicePaid(invoice.id, response);
      toast.success(`Payment of ${formatCurrency(invoice.total_amount)} verified via Razorpay!`);
      fetchInvoices();
    } catch (err) {
      if (err.description || err.message) {
        toast.error(err.description || err.message);
      }
    } finally {
      setPayingId(null);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === 'paid') return inv.payment_status === 'paid';
    if (filter === 'unpaid') return inv.payment_status === 'unpaid';
    return true;
  });

  const unpaidCount = invoices.filter((i) => i.payment_status === 'unpaid').length;
  const totalDue = invoices
    .filter((i) => i.payment_status === 'unpaid')
    .reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices & Billing</h1>
          <p className="text-gray-500 text-sm">Review your repair invoices and make payments securely via Razorpay</p>
        </div>
        {unpaidCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl text-xs font-semibold text-amber-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>
              {unpaidCount} Pending Invoice{unpaidCount > 1 ? 's' : ''} ({formatCurrency(totalDue)} Total)
            </span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2 flex-wrap">
        <div className="flex gap-2">
          {[
            { id: 'all', label: `All Invoices (${invoices.length})` },
            { id: 'unpaid', label: `Unpaid (${unpaidCount})` },
            { id: 'paid', label: `Paid (${invoices.length - unpaidCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                filter === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quick Test Invoice Generator Button */}
        <button
          type="button"
          disabled={generatingDemo}
          onClick={handleCreateDemoInvoice}
          className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
        >
          {generatingDemo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '⚡ Generate Test Invoice (₹749)'}
        </button>
      </div>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
            <Receipt className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">No Invoices on this Account Yet</h3>
            <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-md mx-auto">
              Invoices are automatically issued here when you book a repair and our lab completes diagnosis.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              disabled={generatingDemo}
              onClick={handleCreateDemoInvoice}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
            >
              {generatingDemo ? <Loader2 className="w-4 h-4 animate-spin" /> : '⚡ Create Test Invoice to Try Razorpay'}
            </button>
            <a
              href="/customer/book-repair"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 transition-colors"
            >
              Book a New Repair Ticket
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInvoices.map((inv) => {
            const isPaid = inv.payment_status === 'paid';
            const rep = inv.repairs || inv.repair;

            return (
              <div
                key={inv.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-gray-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-gray-400 uppercase tracking-wider block">
                        {inv.invoice_number}
                      </span>
                      <h3 className="font-bold text-gray-900 text-base mt-0.5">
                        {rep ? `${rep.brand || ''} ${rep.model || rep.device_type || 'Device'}` : 'Repair Service'}
                      </h3>
                      {rep?.repair_id && (
                        <span className="text-xs font-mono text-blue-600 font-semibold">
                          Ticket: {rep.repair_id}
                        </span>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isPaid ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {inv.payment_status?.toUpperCase()}
                    </span>
                  </div>

                  {/* Price breakdown */}
                  <div className="bg-gray-50/70 rounded-xl p-3 text-xs space-y-1.5 my-4 border border-gray-100">
                    <div className="flex justify-between text-gray-500">
                      <span>Service Charge</span>
                      <span>{formatCurrency(inv.service_charge)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Parts Cost</span>
                      <span>{formatCurrency(inv.parts_cost)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Labour</span>
                      <span>{formatCurrency(inv.labour_charge)}</span>
                    </div>
                    {inv.discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Discount</span>
                        <span>-{formatCurrency(inv.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-sm text-gray-900 pt-1.5 border-t border-gray-200">
                      <span>Total Amount</span>
                      <span className="text-blue-600">{formatCurrency(inv.total_amount)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-gray-400">
                    {formatDate(inv.invoice_date)}
                    {inv.transaction_id && (
                      <span className="block font-mono text-emerald-600">Ref: {inv.transaction_id.slice(-8)}</span>
                    )}
                  </div>

                  {isPaid ? (
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Receipt
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={payingId === inv.id}
                      onClick={() => handlePay(inv)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer transition-all disabled:opacity-50"
                    >
                      {payingId === inv.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-3.5 h-3.5" /> Pay {formatCurrency(inv.total_amount)}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
