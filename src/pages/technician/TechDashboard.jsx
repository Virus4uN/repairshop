import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/dataService';
import { ClipboardList, CheckCircle2, Clock, Eye, Wrench, ArrowRight } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../lib/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function TechDashboard() {
  const { profile } = useAuth();
  const [repairs, setRepairs] = useState([]);
  const [stats, setStats] = useState({ assigned: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    try {
      const data = await dataService.getRepairsByTechnician(profile?.email || profile?.id);
      const reps = data || [];
      setRepairs(reps);
      setStats({
        assigned: reps.filter((r) => !['completed', 'cancelled'].includes(r.status)).length,
        inProgress: reps.filter((r) => r.status === 'repair_in_progress').length,
        completed: reps.filter((r) => r.status === 'completed').length,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Technician Workbench - {profile?.full_name || 'Vikram Singh'}
        </h1>
        <p className="text-gray-500 text-sm">Manage assigned device repairs, record diagnoses, and update repair stages</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: ClipboardList, label: 'Assigned Jobs', val: stats.assigned, bg: 'bg-blue-50', ic: 'text-blue-600' },
          { icon: Clock, label: 'In Progress', val: stats.inProgress, bg: 'bg-amber-50', ic: 'text-amber-600' },
          { icon: CheckCircle2, label: 'Completed', val: stats.completed, bg: 'bg-emerald-50', ic: 'text-emerald-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">{s.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{s.val}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-6 h-6 ${s.ic}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Assigned Service Queue</h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
            {repairs.length} Total Jobs
          </span>
        </div>

        {repairs.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Wrench className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium">No repairs assigned to you yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 font-semibold">Repair ID</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Device</th>
                  <th className="px-5 py-3 font-semibold">Problem</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Due Date</th>
                  <th className="px-5 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {repairs.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-sm font-bold text-blue-600">{r.repair_id}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{r.customers?.full_name || 'Customer'}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">
                      {r.brand} {r.model || r.device_type}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 max-w-[200px] truncate">{r.problem}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(r.estimated_completion)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/technician/repairs/${r.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                      >
                        <Wrench className="w-3.5 h-3.5" /> Work on Job
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
