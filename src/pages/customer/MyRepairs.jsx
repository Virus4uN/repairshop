import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Eye, Search } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../lib/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function MyRepairs() {
  const { profile } = useAuth();
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRepairs();
  }, [profile]);

  const fetchRepairs = async () => {
    if (!profile) return;
    const { data: customer } = await supabase.from('customers').select('id').eq('user_id', profile.id).single();
    if (!customer) return setLoading(false);
    const { data } = await supabase.from('repairs').select('*, services(service_name)').eq('customer_id', customer.id).order('created_at', { ascending: false });
    setRepairs(data || []);
    setLoading(false);
  };

  const filtered = repairs.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (search && !r.repair_id?.toLowerCase().includes(search.toLowerCase()) && !r.device_type?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Repairs</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by Repair ID or Device..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:border-blue-500 outline-none">
          <option value="all">All Status</option>
          <option value="request_received">Pending</option>
          <option value="repair_in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No repairs found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 font-medium">Repair ID</th>
                  <th className="px-5 py-3 font-medium">Device</th>
                  <th className="px-5 py-3 font-medium">Service</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-3.5 font-mono text-sm font-semibold text-blue-600">{r.repair_id}</td>
                    <td className="px-5 py-3.5 text-sm">{r.device_type} - {r.brand} {r.model}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{r.services?.service_name || '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(r.created_at)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3.5">
                      <Link to={`/customer/repairs/${r.id}`} className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-700">
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
