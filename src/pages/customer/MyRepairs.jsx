import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/dataService';
import { Eye, Search, Plus, Wrench } from 'lucide-react';
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
    try {
      const data = await dataService.getRepairsByCustomer(profile?.email || profile?.id);
      setRepairs(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = repairs.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (
      search &&
      !r.repair_id?.toLowerCase().includes(search.toLowerCase()) &&
      !r.device_type?.toLowerCase().includes(search.toLowerCase()) &&
      !r.brand?.toLowerCase().includes(search.toLowerCase()) &&
      !r.model?.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Device Repairs</h1>
          <p className="text-gray-500 text-sm">View real-time progress and tracking updates for your equipment</p>
        </div>
        <Link
          to="/customer/book-repair"
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" /> Book New Repair
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Repair ID, device brand or model..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm bg-white"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:border-blue-500 outline-none"
        >
          <option value="all">All Statuses ({repairs.length})</option>
          <option value="request_received">Request Received</option>
          <option value="device_received">Device Checked In</option>
          <option value="repair_in_progress">In Progress</option>
          <option value="quality_check">Quality Check</option>
          <option value="ready_for_pickup">Ready for Pickup</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Wrench className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 font-medium">No matching repairs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 font-semibold">Repair ID</th>
                  <th className="px-5 py-3 font-semibold">Device</th>
                  <th className="px-5 py-3 font-semibold">Service</th>
                  <th className="px-5 py-3 font-semibold">Booked Date</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
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
                    <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(r.created_at)}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/customer/repairs/${r.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-xs rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
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
