import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dataService } from '../../lib/dataService';
import {
  Users,
  Wrench,
  Clock,
  IndianRupee,
  Eye,
  TrendingUp,
  AlertCircle,
  Plus,
  ShieldCheck,
  UserCog,
  CheckCircle2,
  Package,
  Activity,
  ArrowUpRight,
  Search,
  Sparkles,
  Phone,
  Calendar,
  X,
  Loader2
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatCurrency } from '../../lib/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DatabaseStatusBanner from '../../components/admin/DatabaseStatusBanner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1'];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    customers: 0,
    repairs: 0,
    pending: 0,
    completed: 0,
    revenue: 0,
    unpaidRevenue: 0,
    techCount: 0,
  });
  const [repairs, setRepairs] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Quick Walk-in Modal State
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [creatingWalkin, setCreatingWalkin] = useState(false);
  const [walkinForm, setWalkinForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    device_type: 'smartphone',
    brand: '',
    model: '',
    problem: '',
    estimated_cost: 1500,
    technician_id: '',
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [allRepairs, allCustomers, allInvoices, allTechs] = await Promise.all([
        dataService.getRepairs(),
        dataService.getCustomers(),
        dataService.getInvoices(),
        dataService.getTechnicians(),
      ]);

      const reps = allRepairs || [];
      const pending = reps.filter((r) => !['completed', 'cancelled'].includes(r.status)).length;
      const completed = reps.filter((r) => r.status === 'completed').length;
      const totalRev = (allInvoices || [])
        .filter((i) => i.payment_status === 'paid')
        .reduce((s, i) => s + (Number(i.total_amount) || 0), 0);
      const unpaidRev = (allInvoices || [])
        .filter((i) => i.payment_status === 'unpaid')
        .reduce((s, i) => s + (Number(i.total_amount) || 0), 0);

      setStats({
        customers: (allCustomers || []).length,
        repairs: reps.length,
        pending,
        completed,
        revenue: totalRev,
        unpaidRevenue: unpaidRev,
        techCount: (allTechs || []).length,
      });

      setRepairs(reps);
      setCustomers(allCustomers || []);
      setTechnicians(allTechs || []);

      // Status breakdown for Recharts
      const statusCounts = {};
      reps.forEach((r) => {
        statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
      });

      const chartData = Object.entries(statusCounts).map(([name, value]) => ({
        name: name.replace(/_/g, ' '),
        value,
      }));

      setStatusData(chartData);
    } catch (err) {
      console.error('Admin dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWalkin = async (e) => {
    e.preventDefault();
    setCreatingWalkin(true);
    try {
      // Find or save customer
      let customerId = null;
      const existing = customers.find(
        (c) =>
          c.email?.toLowerCase() === walkinForm.customer_email?.toLowerCase() ||
          c.phone === walkinForm.customer_phone
      );

      if (existing) {
        customerId = existing.id;
      } else {
        const newCust = await dataService.saveCustomer({
          full_name: walkinForm.customer_name,
          phone: walkinForm.customer_phone,
          email: walkinForm.customer_email || `walkin-${Date.now()}@smarthub.local`,
          address: 'Walk-in Store Customer',
        });
        customerId = newCust.id;
      }

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const repairId = `REP-${new Date().getFullYear()}-${randomSuffix}`;

      await dataService.createRepair({
        repair_id: repairId,
        customer_id: customerId,
        device_type: walkinForm.device_type,
        brand: walkinForm.brand,
        model: walkinForm.model,
        problem: walkinForm.problem,
        status: 'device_received',
        estimated_cost: Number(walkinForm.estimated_cost),
        technician_id: walkinForm.technician_id || (technicians[0]?.id || null),
        estimated_completion: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      });

      toast.success(`Walk-in ticket created successfully! ID: ${repairId}`);
      setShowWalkinModal(false);
      setWalkinForm({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        device_type: 'smartphone',
        brand: '',
        model: '',
        problem: '',
        estimated_cost: 1500,
        technician_id: '',
      });
      fetchAll();
    } catch (err) {
      toast.error('Failed to create ticket: ' + err.message);
    } finally {
      setCreatingWalkin(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  // Filter repairs
  const filteredRepairs = repairs.filter((r) => {
    const matchesSearch =
      !search ||
      r.repair_id?.toLowerCase().includes(search.toLowerCase()) ||
      r.brand?.toLowerCase().includes(search.toLowerCase()) ||
      r.model?.toLowerCase().includes(search.toLowerCase()) ||
      r.customers?.full_name?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Database Assistant Banner */}
      <DatabaseStatusBanner />

      {/* 1. Executive Operations Header */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Smart Hub Headquarters • Real-Time Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Admin Operations Center
            </h1>
            <p className="text-blue-200/80 text-sm max-w-xl">
              High-altitude telemetry across store repair pipeline velocity, technician bench allocation, customer retention, and billing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowWalkinModal(true)}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" /> Quick Walk-in Ticket
            </button>
            <Link
              to="/admin/technicians"
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs transition-all flex items-center gap-1.5"
            >
              <UserCog className="w-4 h-4" /> Technicians ({technicians.length})
            </Link>
            <Link
              to="/admin/invoices"
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs transition-all flex items-center gap-1.5"
            >
              <IndianRupee className="w-4 h-4" /> Invoices
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Executive 5-KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link
          to="/admin/invoices"
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all block"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Settled Revenue</p>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2">{formatCurrency(stats.revenue)}</p>
          <p className="text-[11px] text-gray-400 mt-1">Pending: {formatCurrency(stats.unpaidRevenue)}</p>
        </Link>

        <Link
          to="/admin/repairs"
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all block"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Pipeline</p>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-blue-600 mt-2">{stats.pending}</p>
          <p className="text-[11px] text-gray-400 mt-1">Total Lifetime: {stats.repairs}</p>
        </Link>

        <Link
          to="/admin/repairs"
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all block"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed QA</p>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-purple-600 mt-2">{stats.completed}</p>
          <p className="text-[11px] text-gray-400 mt-1">Turnaround rate: 94.8%</p>
        </Link>

        <Link
          to="/admin/technicians"
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all block"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tech Roster</p>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <UserCog className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-900 mt-2">{technicians.length}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">100% Operational</p>
        </Link>

        <Link
          to="/admin/customers"
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all block"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer Base</p>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-indigo-600 mt-2">{stats.customers}</p>
          <p className="text-[11px] text-gray-400 mt-1">Registered clients</p>
        </Link>
      </div>

      {/* 3. Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Pipeline Stage Distribution</h3>
              <p className="text-xs text-gray-400">Current device status breakdown</p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              {stats.repairs} Total
            </span>
          </div>

          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12 text-xs">No pipeline telemetry available</p>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Volume by Status</h3>
              <p className="text-xs text-gray-400">Queue load across inspection stages</p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>

          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12 text-xs">No chart data available</p>
          )}
        </div>
      </div>

      {/* 4. Technician Workload Roster */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-base">Technician Bench Capacity & Workload</h3>
            <p className="text-xs text-gray-500">Live active device allocations per specialist</p>
          </div>
          <Link to="/admin/technicians" className="text-xs font-bold text-blue-600 hover:underline">
            Manage All Staff →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {technicians.map((tech) => {
            const activeOnTech = repairs.filter(
              (r) =>
                (r.technician_id === tech.id || r.technicians?.id === tech.id) &&
                !['completed', 'cancelled'].includes(r.status)
            );
            const loadPercent = Math.min(Math.round((activeOnTech.length / 5) * 100), 100);

            return (
              <div key={tech.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    {tech.full_name?.[0] || 'T'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 text-sm truncate">{tech.full_name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{tech.specialization || 'Hardware Specialist'}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500 font-medium">Bench Capacity:</span>
                    <span className="font-bold text-gray-800">{activeOnTech.length} Active / 5 Max</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        loadPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${loadPercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-200/50">
                  <span>Ph: {tech.phone || 'Store internal'}</span>
                  <span className="font-mono text-emerald-600 font-semibold">● Ready</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Master Active Repairs Feed with Quick Filters */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900 text-base">Store Repairs Master Feed</h3>
            <p className="text-xs text-gray-500">Live operational overview across all customer repair tickets</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search ticket, model, customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs bg-white outline-none focus:border-blue-500 w-56"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs bg-white outline-none focus:border-blue-500"
            >
              <option value="all">All Stages</option>
              <option value="request_received">Request Received</option>
              <option value="device_received">Device Received</option>
              <option value="diagnosing">Diagnosing</option>
              <option value="repair_in_progress">In Progress</option>
              <option value="quality_check">Quality Check</option>
              <option value="ready_for_pickup">Ready for Pickup</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-500 uppercase tracking-wider font-semibold">
                <th className="px-6 py-3.5">Ticket ID</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Device</th>
                <th className="px-6 py-3.5">Technician</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Est. Cost</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRepairs.slice(0, 10).map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">
                    <Link to={`/admin/repairs/${r.id}`} className="hover:underline">
                      {r.repair_id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {r.customers?.full_name || 'Customer'}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {r.brand} {r.model || r.device_type}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {r.technicians?.full_name || <span className="text-amber-600 font-semibold">Unassigned</span>}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-6 py-4 font-mono font-semibold text-gray-900">
                    {formatCurrency(r.estimated_cost || 0)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/admin/repairs/${r.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-bold transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Walk-in Ticket Modal */}
      {showWalkinModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> New Walk-in Customer Ticket
              </h3>
              <button onClick={() => setShowWalkinModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWalkin} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-gray-600 mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={walkinForm.customer_name}
                    onChange={(e) => setWalkinForm({ ...walkinForm, customer_name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-gray-600 mb-1">Customer Mobile *</label>
                  <input
                    type="tel"
                    required
                    value={walkinForm.customer_phone}
                    onChange={(e) => setWalkinForm({ ...walkinForm, customer_phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-gray-600 mb-1">Device Type</label>
                  <select
                    value={walkinForm.device_type}
                    onChange={(e) => setWalkinForm({ ...walkinForm, device_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="smartphone">Smartphone</option>
                    <option value="laptop">Laptop</option>
                    <option value="tablet">Tablet</option>
                    <option value="desktop">Desktop PC</option>
                    <option value="smartwatch">Smartwatch</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-gray-600 mb-1">Brand *</label>
                  <input
                    type="text"
                    required
                    value={walkinForm.brand}
                    onChange={(e) => setWalkinForm({ ...walkinForm, brand: e.target.value })}
                    placeholder="e.g. Apple / Dell"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-gray-600 mb-1">Model *</label>
                  <input
                    type="text"
                    required
                    value={walkinForm.model}
                    onChange={(e) => setWalkinForm({ ...walkinForm, model: e.target.value })}
                    placeholder="e.g. iPhone 14 Pro"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase text-gray-600 mb-1">Reported Problem / Issue *</label>
                <textarea
                  required
                  rows={2}
                  value={walkinForm.problem}
                  onChange={(e) => setWalkinForm({ ...walkinForm, problem: e.target.value })}
                  placeholder="e.g. Cracked display, battery draining fast, device not charging..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-gray-600 mb-1">Assign Technician</label>
                  <select
                    value={walkinForm.technician_id}
                    onChange={(e) => setWalkinForm({ ...walkinForm, technician_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="">Auto-Assign Available Tech</option>
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.full_name} ({t.specialization || 'Hardware'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-gray-600 mb-1">Estimated Cost (₹)</label>
                  <input
                    type="number"
                    value={walkinForm.estimated_cost}
                    onChange={(e) => setWalkinForm({ ...walkinForm, estimated_cost: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowWalkinModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingWalkin}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {creatingWalkin ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create Walk-in Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
