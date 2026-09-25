import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Users, Wrench, Clock, IndianRupee, Eye, TrendingUp } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatCurrency } from '../../lib/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1'];

export default function AdminDashboard() {
  const [stats, setStats] = useState({ customers: 0, repairs: 0, pending: 0, revenue: 0 });
  const [recentRepairs, setRecentRepairs] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [{ count: customerCount }, { count: repairCount }, { data: repairs }, { data: invoices }] = await Promise.all([
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        supabase.from('repairs').select('*', { count: 'exact', head: true }),
        supabase.from('repairs').select('*, customers(full_name), services(service_name), technicians(name)').order('created_at', { ascending: false }).limit(10),
        supabase.from('invoices').select('total_amount'),
      ]);

      const allRepairs = repairs || [];
      const pending = allRepairs.filter((r) => !['completed', 'cancelled'].includes(r.status)).length;
      const revenue = (invoices || []).reduce((s, i) => s + (i.total_amount || 0), 0);

      setStats({ customers: customerCount || 0, repairs: repairCount || 0, pending, revenue });
      setRecentRepairs(allRepairs.slice(0, 5));

      // Status breakdown
      const statusCounts = {};
      allRepairs.forEach((r) => { statusCounts[r.status] = (statusCounts[r.status] || 0) + 1; });
      setStatusData(Object.entries(statusCounts).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value })));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { icon: Users, label: 'Total Customers', val: stats.customers, bg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { icon: Wrench, label: 'Total Repairs', val: stats.repairs, bg: 'bg-purple-50', iconColor: 'text-purple-600' },
    { icon: Clock, label: 'Pending', val: stats.pending, bg: 'bg-amber-50', iconColor: 'text-amber-600' },
    { icon: IndianRupee, label: 'Revenue', val: formatCurrency(stats.revenue), bg: 'bg-green-50', iconColor: 'text-green-600' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{s.val}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-6 h-6 ${s.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Repair Status Overview</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-center py-12">No data yet</p>}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Repairs by Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-center py-12">No data yet</p>}
        </div>
      </div>

      {/* Recent Repairs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Recent Repair Requests</h3>
          <Link to="/admin/repairs" className="text-sm text-blue-600 font-medium">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Device</th>
                <th className="px-5 py-3 font-medium">Technician</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentRepairs.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-mono text-sm font-semibold text-blue-600">{r.repair_id}</td>
                  <td className="px-5 py-3 text-sm">{r.customers?.full_name || '—'}</td>
                  <td className="px-5 py-3 text-sm">{r.device_type} - {r.brand}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{r.technicians?.name || 'Unassigned'}</td>
                  <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-5 py-3">
                    <Link to={`/admin/repairs/${r.id}`} className="flex items-center gap-1 text-sm text-blue-600 font-medium">
                      <Eye className="w-4 h-4" /> View
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
