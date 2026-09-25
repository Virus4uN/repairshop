import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Wrench, Clock, CheckCircle2, AlertCircle, Plus, Eye } from 'lucide-react';
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
    if (!profile) return;
    try {
      // Get customer record
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', profile.id)
        .single();

      if (!customer) return;

      const { data: repairData } = await supabase
        .from('repairs')
        .select('*, services(service_name)')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });

      const reps = repairData || [];
      setRepairs(reps);
      setStats({
        active: reps.filter((r) => !['completed', 'cancelled'].includes(r.status)).length,
        completed: reps.filter((r) => r.status === 'completed').length,
        pending: reps.filter((r) => r.status === 'request_received').length,
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
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {profile?.full_name}!</h1>
          <p className="text-gray-500 text-sm">Here's an overview of your repairs</p>
        </div>
        <Link
          to="/customer/book-repair"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all text-sm"
        >
          <Plus className="w-4 h-4" /> Book New Repair
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Wrench, label: 'Active Repairs', val: stats.active, color: 'blue', bg: 'bg-blue-50', iconColor: 'text-blue-600' },
          { icon: CheckCircle2, label: 'Completed', val: stats.completed, color: 'green', bg: 'bg-green-50', iconColor: 'text-green-600' },
          { icon: Clock, label: 'Pending Requests', val: stats.pending, color: 'amber', bg: 'bg-amber-50', iconColor: 'text-amber-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
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
          <h2 className="font-bold text-gray-900">Recent Repairs</h2>
          <Link to="/customer/my-repairs" className="text-sm text-blue-600 font-medium hover:text-blue-700">View All</Link>
        </div>
        {repairs.length === 0 ? (
          <div className="p-12 text-center">
            <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No repairs yet</p>
            <Link to="/customer/book-repair" className="text-blue-600 font-medium text-sm mt-2 inline-block">Book your first repair →</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100">
                  <th className="px-5 py-3 font-medium">Repair ID</th>
                  <th className="px-5 py-3 font-medium">Device</th>
                  <th className="px-5 py-3 font-medium">Service</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {repairs.slice(0, 5).map((repair) => (
                  <tr key={repair.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-sm font-semibold text-blue-600">{repair.repair_id}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-900">{repair.device_type} - {repair.brand}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{repair.services?.service_name || '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(repair.created_at)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={repair.status} /></td>
                    <td className="px-5 py-3.5">
                      <Link to={`/customer/repairs/${repair.id}`} className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-700">
                        <Eye className="w-4 h-4" /> View
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
