import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/dataService';
import { initiateRazorpayPayment } from '../../lib/razorpay';
import {
  Wrench,
  Clock,
  CheckCircle2,
  Plus,
  Eye,
  Receipt,
  Smartphone,
  Laptop,
  Tablet,
  Tv,
  Cpu,
  ShieldCheck,
  CreditCard,
  Search,
  ChevronRight,
  ExternalLink,
  Sparkles,
  PhoneCall,
  Loader2,
  Copy,
  Check,
  PackageCheck
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatCurrency } from '../../lib/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

// 5-Stage repair lifecycle for customer view
const STAGES = [
  { key: 'received', label: 'Received', desc: 'Checked in at lab', statuses: ['request_received', 'device_received'] },
  { key: 'diagnostic', label: 'Diagnosing', desc: 'Hardware testing', statuses: ['diagnosing'] },
  { key: 'repairing', label: 'In Repair', desc: 'Parts & labor active', statuses: ['repair_in_progress'] },
  { key: 'qc', label: 'Quality Check', desc: 'Stress test & QA', statuses: ['quality_check'] },
  { key: 'ready', label: 'Ready for Pickup', desc: 'Ready for delivery', statuses: ['ready_for_pickup', 'completed'] },
];

function getStageIndex(status) {
  if (['completed', 'ready_for_pickup'].includes(status)) return 4;
  if (status === 'quality_check') return 3;
  if (status === 'repair_in_progress') return 2;
  if (status === 'diagnosing') return 1;
  return 0; // request_received or device_received
}

function getDeviceIcon(type) {
  const t = (type || '').toLowerCase();
  if (t.includes('laptop') || t.includes('macbook')) return Laptop;
  if (t.includes('tablet') || t.includes('ipad')) return Tablet;
  if (t.includes('tv') || t.includes('monitor')) return Tv;
  if (t.includes('desktop') || t.includes('pc')) return Cpu;
  return Smartphone;
}

export default function CustomerDashboard() {
  const { profile } = useAuth();
  const [repairs, setRepairs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [payingId, setPayingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    try {
      const [allRepairs, allInvoices] = await Promise.all([
        dataService.getRepairsByCustomer(profile?.email || profile?.id),
        dataService.getInvoices(),
      ]);

      const userRepairs = allRepairs || [];
      setRepairs(userRepairs);

      // Filter invoices for this user
      const userInvoices = (allInvoices || []).filter((inv) => {
        const custEmail = inv.repairs?.customers?.email || inv.repair?.customers?.email;
        const custId = inv.repairs?.customer_id || inv.repair?.customer_id;
        return (
          custEmail?.toLowerCase() === profile?.email?.toLowerCase() ||
          custId === profile?.id ||
          userRepairs.some((r) => r.id === inv.repair_id || r.repair_id === inv.repair_id)
        );
      });
      setInvoices(userInvoices);
    } catch (err) {
      console.error('Customer dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayInvoice = async (invoice) => {
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

      await dataService.markInvoicePaid(invoice.id, response);
      toast.success(`Payment of ${formatCurrency(invoice.total_amount)} verified via Razorpay!`);
      fetchData();
    } catch (err) {
      if (err.description || err.message) {
        toast.error(err.description || err.message);
      }
    } finally {
      setPayingId(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success('Ticket ID copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return <LoadingSpinner />;

  // Filtered list based on search
  const filteredRepairs = repairs.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.repair_id?.toLowerCase().includes(q) ||
      r.brand?.toLowerCase().includes(q) ||
      r.model?.toLowerCase().includes(q) ||
      r.device_type?.toLowerCase().includes(q)
    );
  });

  const activeRepairs = filteredRepairs.filter((r) => !['completed', 'cancelled'].includes(r.status));
  const completedRepairs = filteredRepairs.filter((r) => r.status === 'completed');
  const readyRepairs = activeRepairs.filter((r) => r.status === 'ready_for_pickup');
  const unpaidInvoices = invoices.filter((i) => i.payment_status === 'unpaid');
  const totalUnpaidAmount = unpaidInvoices.reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Customer Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6 sm:p-8 shadow-xl shadow-blue-900/10">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-10 w-60 h-60 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/15 text-xs font-semibold text-blue-200 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Smart Hub Customer Care Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {profile?.full_name || 'Customer'}! 👋
            </h1>
            <p className="text-blue-100/90 text-sm sm:text-base mt-2 leading-relaxed">
              Track the live repair status of your electronics, review diagnostic reports, and settle service invoices securely.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/customer/book-repair"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-blue-700 font-bold text-sm shadow-lg shadow-black/10 hover:bg-blue-50 transition-all hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" /> Book New Repair
            </Link>
            <Link
              to="/customer/invoices"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-all"
            >
              <Receipt className="w-4 h-4" /> My Invoices
            </Link>
          </div>
        </div>

        {/* Search Bar inside Hero */}
        <div className="relative z-10 mt-6 pt-6 border-t border-white/15 max-w-xl">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-blue-200" />
            <input
              type="text"
              placeholder="Search your repairs by Repair ID (e.g. REP-8921) or device name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder-blue-200/70 text-sm outline-none focus:bg-white/20 focus:border-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* 2. Unpaid Invoice Alert Banner (Razorpay trigger) */}
      {unpaidInvoices.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                  Action Required: {unpaidInvoices.length} Unpaid Repair Invoice{unpaidInvoices.length > 1 ? 's' : ''}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm mt-0.5">
                  Total Outstanding Amount: <span className="font-bold text-amber-700">{formatCurrency(totalUnpaidAmount)}</span>. Pay now via Razorpay (UPI, Cards, NetBanking).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => handlePayInvoice(unpaidInvoices[0])}
                disabled={payingId === unpaidInvoices[0].id}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {payingId === unpaidInvoices[0].id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" /> Pay {formatCurrency(unpaidInvoices[0].total_amount)} Now
                  </>
                )}
              </button>
              <Link
                to="/customer/invoices"
                className="px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold whitespace-nowrap transition-colors"
              >
                View Invoices
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">In-Shop Active Repairs</p>
            <p className="text-3xl font-extrabold text-blue-600 mt-1">{activeRepairs.length}</p>
            <p className="text-[11px] text-gray-400 mt-1">Under diagnosis or bench work</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">Ready for Pickup</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">{readyRepairs.length}</p>
            <p className="text-[11px] text-gray-400 mt-1">Passed inspection & tests</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <PackageCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">Completed Devices</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{completedRepairs.length}</p>
            <p className="text-[11px] text-gray-400 mt-1">Covered under 90-day warranty</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 4. Active Devices Live Progress Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Active Devices in Service</h2>
            <p className="text-xs text-gray-500">Live progress tracker from intake to quality inspection</p>
          </div>
          {activeRepairs.length > 0 && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700">
              {activeRepairs.length} Active {activeRepairs.length === 1 ? 'Device' : 'Devices'}
            </span>
          )}
        </div>

        {activeRepairs.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm text-center">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No Devices Currently in Repair</h3>
            <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto mt-1 mb-5">
              All your electronics are running smoothly. If you have a broken phone screen, battery failure, or laptop issue, book a diagnostic slot.
            </p>
            <Link
              to="/customer/book-repair"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
            >
              <Plus className="w-4 h-4" /> Book a Repair Inspection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {activeRepairs.map((repair) => {
              const DeviceIcon = getDeviceIcon(repair.device_type);
              const activeIndex = getStageIndex(repair.status);
              const invoice = invoices.find((i) => i.repair_id === repair.id || i.repair_id === repair.repair_id);

              return (
                <div
                  key={repair.id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Top Device Bar */}
                  <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200/70 shadow-sm flex items-center justify-center text-blue-600 shrink-0">
                        <DeviceIcon className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900">
                            {repair.brand} {repair.model || repair.device_type}
                          </h3>
                          <button
                            onClick={() => copyToClipboard(repair.repair_id)}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-mono text-xs font-bold transition-colors cursor-pointer"
                            title="Click to copy Ticket ID"
                          >
                            {repair.repair_id}
                            {copiedId === repair.repair_id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-blue-500" />}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Service: <span className="font-semibold text-gray-700">{repair.services?.service_name || 'Hardware Repair'}</span>
                          {repair.serial_number && <> • Serial: <span className="font-mono text-gray-600">{repair.serial_number}</span></>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={repair.status} />
                      <Link
                        to={`/customer/repairs/${repair.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:border-blue-300 text-blue-600 text-xs font-bold shadow-sm transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Details
                      </Link>
                    </div>
                  </div>

                  {/* 5-Step Visual Stepper Progress Bar */}
                  <div className="p-6">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                      Live Repair Pipeline Progress:
                    </p>

                    <div className="relative">
                      {/* Connecting Line */}
                      <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 z-0">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                          style={{ width: `${(activeIndex / (STAGES.length - 1)) * 100}%` }}
                        />
                      </div>

                      {/* Stage Nodes */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative z-10">
                        {STAGES.map((stage, idx) => {
                          const isDone = idx < activeIndex;
                          const isCurrent = idx === activeIndex;

                          return (
                            <div
                              key={stage.key}
                              className={`flex flex-col items-center text-center p-3 rounded-2xl transition-all ${
                                isCurrent
                                  ? 'bg-blue-50/80 border border-blue-200'
                                  : isDone
                                  ? 'bg-emerald-50/40 border border-transparent'
                                  : 'bg-transparent border border-transparent opacity-60'
                              }`}
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                                  isDone
                                    ? 'bg-emerald-500 text-white shadow-sm'
                                    : isCurrent
                                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md animate-pulse'
                                    : 'bg-gray-200 text-gray-500'
                                }`}
                              >
                                {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                              </div>
                              <span
                                className={`text-xs font-bold ${
                                  isCurrent ? 'text-blue-900' : isDone ? 'text-emerald-800' : 'text-gray-500'
                                }`}
                              >
                                {stage.label}
                              </span>
                              <span className="text-[10px] text-gray-400 mt-0.5 hidden sm:block">
                                {stage.desc}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bottom Metadata & Inline Payment */}
                    <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div className="space-y-1">
                        <p className="text-gray-500">
                          Reported Issue: <span className="text-gray-900 font-medium">{repair.problem}</span>
                        </p>
                        <p className="text-gray-500">
                          Assigned Specialist:{' '}
                          <span className="font-semibold text-blue-700">
                            {repair.technicians?.full_name || 'Senior Hardware Engineer (Lab Bench)'}
                          </span>
                          {repair.estimated_completion && (
                            <> • Expected Ready: <span className="font-semibold text-gray-800">{formatDate(repair.estimated_completion)}</span></>
                          )}
                        </p>
                      </div>

                      {/* If invoice unpaid, show direct pay button */}
                      {invoice && invoice.payment_status === 'unpaid' ? (
                        <button
                          onClick={() => handlePayInvoice(invoice)}
                          disabled={payingId === invoice.id}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        >
                          {payingId === invoice.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <CreditCard className="w-3.5 h-3.5" /> Pay {formatCurrency(invoice.total_amount)}
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/customer/repairs/${repair.id}`}
                            className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline"
                          >
                            Full Inspection Details <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Smart Hub Quality Guarantees */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider">90-Day Lab Warranty</h4>
            <p className="text-xs text-gray-500 mt-1">All repaired components and solder work include 3-month peace-of-mind coverage.</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider">OEM Certified Parts</h4>
            <p className="text-xs text-gray-500 mt-1">We source 100% genuine replacement screens, batteries, and controller ICs.</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider">Direct Engineer Support</h4>
            <p className="text-xs text-gray-500 mt-1">Questions on your device? Reach our workshop helpline at +91 98765 43210.</p>
          </div>
        </div>
      </div>

      {/* 6. Completed Devices & Repair History */}
      {completedRepairs.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900">Serviced & Completed Devices</h3>
              <p className="text-xs text-gray-500">History of your repaired electronic items</p>
            </div>
            <Link to="/customer/my-repairs" className="text-xs font-bold text-blue-600 hover:underline">
              View All ({repairs.length}) →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Ticket ID</th>
                  <th className="pb-3 font-semibold">Device</th>
                  <th className="pb-3 font-semibold">Service</th>
                  <th className="pb-3 font-semibold">Completed Date</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {completedRepairs.slice(0, 4).map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50">
                    <td className="py-3 font-mono font-bold text-blue-600">{r.repair_id}</td>
                    <td className="py-3 font-medium text-gray-900">{r.brand} {r.model || r.device_type}</td>
                    <td className="py-3 text-gray-500">{r.services?.service_name || 'Hardware Repair'}</td>
                    <td className="py-3 text-gray-500">{formatDate(r.updated_at || r.created_at)}</td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/customer/feedback/${r.id}`}
                        className="inline-flex items-center gap-1 text-amber-600 font-bold hover:underline mr-3"
                      >
                        ⭐ Rate Service
                      </Link>
                      <Link
                        to={`/customer/repairs/${r.id}`}
                        className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline"
                      >
                        View Receipt
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
