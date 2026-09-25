import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/dataService';
import { Wrench, Clock, CheckCircle2, AlertCircle, Plus, Eye, Receipt, ArrowRight } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../lib/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function CustomerDashboard() {
  const { profile } = useAuth();
  const [repairs, setRepairs] = useState([]);
  const [stats, setStats] = useState({ active: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    try {
      const reps = await dataService.getRepairsByCustomer(profile?.email || profile?.id);
      setRepairs(reps || []);
      setStats({
        active: (reps || []).filter((r) => !['completed', 'cancelled'].includes(r.status)).length,
        completed: (reps || []).filter((r) => r.status === 'completed').length,
        pending: (reps || []).filter((r) => r.status === 'request_received').length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {profile?.full_name || 'Customer'}!
          </h1>
          <p className="text-gray-500 text-sm">Here is a live overview of your device repairs and service tickets</p>
        </div>
        <Link
          to="/customer/book-repair"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all text-sm cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" /> Book New Repair
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Wrench, label: 'Active Repairs', val: stats.active, color: 'blue', bg: 'bg-blue-50', iconColor: 'text-blue-600' },
          { icon: CheckCircle2, label: 'Completed Devices', val: stats.completed, color: 'green', bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
          { icon: Clock, label: 'Pending Requests', val: stats.pending, color: 'amber', bg: 'bg-amber-50', iconColor: 'text-amber-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.val}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Repairs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Your Device Tickets</h2>
          <Link to="/customer/my-repairs" className="text-sm text-blue-600 font-semibold hover:text-blue-700">
            View All ({repairs.length}) →
          </Link>
        </div>

        {repairs.length === 0 ? (
          <div className="p-12 text-center">
            <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No repair requests yet</p>
            <p className="text-gray-400 text-xs mt-1 mb-4">Book a repair for your phone, laptop, or other devices.</p>
            <Link
              to="/customer/book-repair"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Book Your First Repair
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 font-semibold">Repair ID</th>
                  <th className="px-5 py-3 font-semibold">Device</th>
                  <th className="px-5 py-3 font-semibold">Service</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {repairs.slice(0, 5).map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-sm font-bold text-blue-600">
                      <Link to={`/customer/repairs/${r.id}`} className="hover:underline">
                        {r.repair_id}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900">
                      {r.brand} {r.model || r.device_type}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">
                      {r.services?.service_name || 'Standard Repair'}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(r.created_at)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/customer/repairs/${r.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Status
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
