import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dataService } from '../../lib/dataService';
import { Users, Wrench, Clock, IndianRupee, Eye, TrendingUp, AlertCircle, Plus } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatCurrency } from '../../lib/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DatabaseStatusBanner from '../../components/admin/DatabaseStatusBanner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1'];

export default function AdminDashboard() {
  const [stats, setStats] = useState({ customers: 0, repairs: 0, pending: 0, revenue: 0 });
  const [recentRepairs, setRecentRepairs] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [allRepairs, allCustomers, allInvoices] = await Promise.all([
        dataService.getRepairs(),
        dataService.getCustomers(),
        dataService.getInvoices(),
      ]);

      const reps = allRepairs || [];
      const pending = reps.filter((r) => !['completed', 'cancelled'].includes(r.status)).length;
      const revenue = (allInvoices || []).reduce((s, i) => s + (Number(i.total_amount) || 0), 0);

      setStats({
        customers: (allCustomers || []).length,
        repairs: reps.length,
        pending,
        revenue,
      });

      setRecentRepairs(reps.slice(0, 6));

      // Status breakdown
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { icon: Users, label: 'Total Customers', val: stats.customers, bg: 'bg-blue-50', iconColor: 'text-blue-600', path: '/admin/customers' },
    { icon: Wrench, label: 'Total Repairs', val: stats.repairs, bg: 'bg-purple-50', iconColor: 'text-purple-600', path: '/admin/repairs' },
    { icon: Clock, label: 'Pending Repairs', val: stats.pending, bg: 'bg-amber-50', iconColor: 'text-amber-600', path: '/admin/repairs' },
    { icon: IndianRupee, label: 'Total Revenue', val: formatCurrency(stats.revenue), bg: 'bg-green-50', iconColor: 'text-green-600', path: '/admin/invoices' },
  ];

  return (
    <div className="space-y-6">
      {/* Database Assistant Banner */}
      <DatabaseStatusBanner />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Control Center</h1>
          <p className="text-gray-500 text-sm">Real-time overview of repairs, technicians, and revenue</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/repairs"
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Manage Repairs
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Link
            key={s.label}
            to={s.path}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all block"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{s.val}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                <s.icon className={`w-6 h-6 ${s.iconColor}`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Repair Status Distribution</h3>
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
            <p className="text-gray-400 text-center py-12">No repair data yet</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Volume by Status</h3>
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
            <p className="text-gray-400 text-center py-12">No repair data yet</p>
          )}
        </div>
      </div>

      {/* Recent Repairs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">Recent Service Tickets</h2>
            <p className="text-xs text-gray-500">Latest device tickets submitted by customers</p>
          </div>
          <Link to="/admin/repairs" className="text-sm text-blue-600 font-semibold hover:text-blue-700">
            View All ({stats.repairs}) →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3 font-semibold">Repair ID</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Device</th>
                <th className="px-5 py-3 font-semibold">Technician</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Created</th>
                <th className="px-5 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentRepairs.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-sm font-bold text-blue-600">{r.repair_id}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{r.customers?.full_name || 'Guest'}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{r.brand} {r.model || r.device_type}</td>
                  <td className="px-5 py-3.5 text-sm">
                    {r.technicians?.name ? (
                      <span className="text-indigo-600 font-medium">{r.technicians.name}</span>
                    ) : (
                      <span className="text-amber-600 text-xs font-semibold bg-amber-50 px-2 py-0.5 rounded-full">Unassigned</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(r.created_at)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      to={`/admin/repairs/${r.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
