import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { ClipboardList, CheckCircle2, Clock, Eye } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../lib/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function TechDashboard() {
  const { profile } = useAuth();
  const [repairs, setRepairs] = useState([]);
  const [stats, setStats] = useState({ assigned: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [profile]);

  const fetchData = async () => {
    if (!profile) return;
    const { data: tech } = await supabase.from('technicians').select('id').eq('user_id', profile.id).single();
    if (!tech) { setLoading(false); return; }
    const { data } = await supabase.from('repairs').select('*, customers(full_name), services(service_name)').eq('technician_id', tech.id).order('created_at', { ascending: false });
    const reps = data || [];
    setRepairs(reps);
    setStats({
      assigned: reps.filter((r) => !['completed', 'cancelled'].includes(r.status)).length,
      inProgress: reps.filter((r) => r.status === 'repair_in_progress').length,
      completed: reps.filter((r) => r.status === 'completed').length,
    });
    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Welcome, {profile?.full_name}!</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: ClipboardList, label: 'Assigned Jobs', val: stats.assigned, bg: 'bg-blue-50', ic: 'text-blue-600' },
          { icon: Clock, label: 'In Progress', val: stats.inProgress, bg: 'bg-amber-50', ic: 'text-amber-600' },
          { icon: CheckCircle2, label: 'Completed', val: stats.completed, bg: 'bg-green-50', ic: 'text-green-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">{s.label}</p><p className="text-3xl font-bold text-gray-900 mt-1">{s.val}</p></div>
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}><s.icon className={`w-6 h-6 ${s.ic}`} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100"><h2 className="font-bold text-gray-900">Assigned Repairs</h2></div>
        {repairs.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No repairs assigned to you yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Repair ID</th><th className="px-5 py-3 font-medium">Customer</th><th className="px-5 py-3 font-medium">Device</th>
                <th className="px-5 py-3 font-medium">Problem</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Action</th>
              </tr></thead>
              <tbody>
                {repairs.slice(0, 10).map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-mono text-sm font-semibold text-blue-600">{r.repair_id}</td>
                    <td className="px-5 py-3 text-sm">{r.customers?.full_name}</td>
                    <td className="px-5 py-3 text-sm">{r.device_type} - {r.brand}</td>
                    <td className="px-5 py-3 text-sm text-gray-600 max-w-[200px] truncate">{r.problem}</td>
                    <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3">
                      <Link to={`/technician/repairs/${r.id}`} className="flex items-center gap-1 text-sm text-blue-600 font-medium">
                        <Eye className="w-4 h-4" /> Open
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
