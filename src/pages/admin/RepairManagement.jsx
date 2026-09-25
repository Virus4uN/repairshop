import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Search, Plus, Eye, Edit2, Trash2, UserCog, X, Loader2 } from 'lucide-react';
import { formatDate, STATUS_CONFIG } from '../../lib/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';

export default function RepairManagement() {
  const [repairs, setRepairs] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [assignModal, setAssignModal] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [selectedTech, setSelectedTech] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [{ data: r }, { data: t }] = await Promise.all([
      supabase.from('repairs').select('*, customers(full_name), services(service_name), technicians(name)').order('created_at', { ascending: false }),
      supabase.from('technicians').select('*'),
    ]);
    setRepairs(r || []);
    setTechnicians(t || []);
    setLoading(false);
  };

  const handleAssign = async () => {
    if (!selectedTech) return;
    await supabase.from('repairs').update({ technician_id: selectedTech }).eq('id', assignModal);
    toast.success('Technician assigned');
    setAssignModal(null);
    setSelectedTech('');
    fetchData();
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('repairs').update({ status: selectedStatus }).eq('id', statusModal);
    await supabase.from('repair_history').insert({ repair_id: statusModal, status: selectedStatus, notes: `Status updated to ${selectedStatus.replace(/_/g, ' ')}`, updated_by: user.id });
    toast.success('Status updated');
    setStatusModal(null);
    setSelectedStatus('');
    fetchData();
  };

  const handleDelete = async () => {
    await supabase.from('repairs').delete().eq('id', deleteId);
    toast.success('Repair deleted');
    fetchData();
  };

  const filtered = repairs.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (search && !r.repair_id?.toLowerCase().includes(search.toLowerCase()) && !r.customers?.full_name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Repair Management</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by Repair ID or Customer..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-blue-500 outline-none" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white">
          <option value="all">All Status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3 font-medium">Repair ID</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Device</th>
                <th className="px-5 py-3 font-medium">Technician</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-mono text-sm font-semibold text-blue-600">{r.repair_id}</td>
                  <td className="px-5 py-3 text-sm">{r.customers?.full_name || '—'}</td>
                  <td className="px-5 py-3 text-sm">{r.device_type} - {r.brand}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{r.technicians?.name || <span className="text-amber-600">Unassigned</span>}</td>
                  <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-5 py-3 text-sm text-gray-500">{formatDate(r.created_at)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <Link to={`/admin/repairs/${r.id}`} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Eye className="w-4 h-4" /></Link>
                      <button onClick={() => { setAssignModal(r.id); setSelectedTech(r.technician_id || ''); }} className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-600" title="Assign Technician"><UserCog className="w-4 h-4" /></button>
                      <button onClick={() => { setStatusModal(r.id); setSelectedStatus(r.status); }} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Update Status"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Technician Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setAssignModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="font-bold text-lg mb-4">Assign Technician</h3>
            <select value={selectedTech} onChange={(e) => setSelectedTech(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-4 bg-white">
              <option value="">Select Technician</option>
              {technicians.map((t) => <option key={t.id} value={t.id}>{t.name} - {t.specialization}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={handleAssign} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm">Assign</button>
              <button onClick={() => setAssignModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl font-semibold text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setStatusModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="font-bold text-lg mb-4">Update Status</h3>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-4 bg-white">
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={handleStatusUpdate} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm">Update</button>
              <button onClick={() => setStatusModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl font-semibold text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Repair" message="Are you sure? This will permanently delete this repair record." />
    </div>
  );
}
