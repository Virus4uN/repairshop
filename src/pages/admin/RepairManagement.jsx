import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dataService } from '../../lib/dataService';
import { Search, Plus, Eye, UserCog, RefreshCw, Trash2, X, Loader2 } from 'lucide-react';
import { formatDate, STATUS_CONFIG, generateRepairId } from '../../lib/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';

export default function RepairManagement() {
  const [repairs, setRepairs] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [assignModal, setAssignModal] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTech, setSelectedTech] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [creating, setCreating] = useState(false);

  // New repair form state
  const [newRepairForm, setNewRepairForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    device_type: 'Mobile Phone',
    brand: '',
    model: '',
    serial_number: '',
    problem: '',
    service_id: '',
    technician_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [r, t, s] = await Promise.all([
      dataService.getRepairs(),
      dataService.getTechnicians(),
      dataService.getServices(),
    ]);
    setRepairs(r || []);
    setTechnicians(t || []);
    setServices(s || []);
    setLoading(false);
  };

  const handleAssign = async () => {
    if (!selectedTech) return;
    await dataService.updateRepair(assignModal, { technician_id: selectedTech });
    const techObj = technicians.find((t) => t.id === selectedTech);
    await dataService.addRepairHistory(assignModal, 'technician_assigned', `Assigned to ${techObj?.name || 'technician'}`);
    toast.success('Technician assigned successfully');
    setAssignModal(null);
    setSelectedTech('');
    fetchData();
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;
    await dataService.updateRepair(statusModal, { status: selectedStatus });
    await dataService.addRepairHistory(
      statusModal,
      selectedStatus,
      statusNote || `Status updated to ${STATUS_CONFIG[selectedStatus]?.label || selectedStatus}`
    );
    toast.success('Repair status updated');
    setStatusModal(null);
    setSelectedStatus('');
    setStatusNote('');
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await dataService.deleteRepair(deleteId);
    toast.success('Repair ticket deleted');
    setDeleteId(null);
    fetchData();
  };

  const handleCreateNewRepair = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      // 1. Ensure customer exists
      let cust = null;
      if (newRepairForm.customer_name) {
        cust = await dataService.saveCustomer({
          full_name: newRepairForm.customer_name,
          phone: newRepairForm.customer_phone,
          email: newRepairForm.customer_email || `customer-${Date.now()}@hub.local`,
          address: 'Store Walk-in',
        });
      }

      // 2. Create repair ticket
      const newTicket = await dataService.createRepair({
        customer_id: cust?.id || null,
        service_id: newRepairForm.service_id || null,
        technician_id: newRepairForm.technician_id || null,
        device_type: newRepairForm.device_type,
        brand: newRepairForm.brand,
        model: newRepairForm.model,
        serial_number: newRepairForm.serial_number,
        problem: newRepairForm.problem,
        status: 'request_received',
      });

      await dataService.addRepairHistory(newTicket.id, 'request_received', 'Ticket created by store manager.');

      toast.success(`Repair ticket #${newTicket.repair_id} created!`);
      setShowCreateModal(false);
      setNewRepairForm({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        device_type: 'Mobile Phone',
        brand: '',
        model: '',
        serial_number: '',
        problem: '',
        service_id: '',
        technician_id: '',
      });
      fetchData();
    } catch (err) {
      toast.error('Failed to create ticket: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const filtered = repairs.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (
      search &&
      !r.repair_id?.toLowerCase().includes(search.toLowerCase()) &&
      !r.customers?.full_name?.toLowerCase().includes(search.toLowerCase()) &&
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
          <h1 className="text-2xl font-bold text-gray-900">Repair Management</h1>
          <p className="text-gray-500 text-sm">Track, assign, and update all customer repair tickets</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 text-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Repair Ticket
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Repair ID, Customer, Brand, or Model..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:border-blue-500 outline-none"
        >
          <option value="all">All Statuses ({repairs.length})</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3 font-semibold">Repair ID</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Device</th>
                <th className="px-5 py-3 font-semibold">Technician</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-400 text-sm">
                    No repair tickets match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-sm font-bold text-blue-600">
                      <Link to={`/admin/repairs/${r.id}`} className="hover:underline">
                        {r.repair_id}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-sm">
                      <div className="font-medium text-gray-900">{r.customers?.full_name || 'Guest'}</div>
                      <div className="text-xs text-gray-400">{r.customers?.phone || ''}</div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">
                      <span className="font-medium">{r.brand} {r.model}</span>
                      <span className="text-xs text-gray-400 block">{r.device_type}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm">
                      {r.technicians?.name ? (
                        <span className="text-indigo-600 font-medium">{r.technicians.name}</span>
                      ) : (
                        <span className="text-amber-600 text-xs font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(r.created_at)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/repairs/${r.id}`}
                          title="View Details"
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedTech(r.technician_id || '');
                            setAssignModal(r.id);
                          }}
                          title="Assign Technician"
                          className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors cursor-pointer"
                        >
                          <UserCog className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStatus(r.status);
                            setStatusModal(r.id);
                          }}
                          title="Update Status"
                          className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(r.id)}
                          title="Delete Ticket"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Technician Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAssignModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Assign Technician</h3>
            <p className="text-xs text-gray-500 mb-4">Select technician to handle this repair</p>
            <div className="space-y-4">
              <select
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white outline-none focus:border-blue-500"
              >
                <option value="">Select Technician</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.specialization || 'General'})
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAssign}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold cursor-pointer shadow-sm"
                >
                  Save Assignment
                </button>
                <button
                  type="button"
                  onClick={() => setAssignModal(null)}
                  className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setStatusModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Update Repair Stage</h3>
            <p className="text-xs text-gray-500 mb-4">Progress device through repair lifecycle</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">New Stage</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white outline-none focus:border-blue-500"
                >
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Update Notes (Optional)</label>
                <textarea
                  rows="2"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Screen replaced, running display benchmarks..."
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none resize-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleStatusUpdate}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold cursor-pointer shadow-sm"
                >
                  Confirm Status
                </button>
                <button
                  type="button"
                  onClick={() => setStatusModal(null)}
                  className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New Repair Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Create In-Store Repair Ticket</h3>
            <p className="text-xs text-gray-500 mb-4">Book a repair for a walk-in or offline customer</p>

            <form onSubmit={handleCreateNewRepair} className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-xl space-y-3 border border-gray-100">
                <p className="text-xs font-bold text-gray-700 uppercase">Customer Information</p>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Customer Full Name *"
                    value={newRepairForm.customer_name}
                    onChange={(e) => setNewRepairForm({ ...newRepairForm, customer_name: e.target.value })}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number *"
                    value={newRepairForm.customer_phone}
                    onChange={(e) => setNewRepairForm({ ...newRepairForm, customer_phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Email (Optional)"
                    value={newRepairForm.customer_email}
                    onChange={(e) => setNewRepairForm({ ...newRepairForm, customer_email: e.target.value })}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-700 uppercase">Device & Issue</p>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={newRepairForm.device_type}
                    onChange={(e) => setNewRepairForm({ ...newRepairForm, device_type: e.target.value })}
                    className="col-span-1 px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm outline-none"
                  >
                    <option>Mobile Phone</option>
                    <option>Laptop</option>
                    <option>Computer</option>
                    <option>Tablet</option>
                    <option>Printer</option>
                    <option>Electronics</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Brand (e.g. Apple) *"
                    value={newRepairForm.brand}
                    onChange={(e) => setNewRepairForm({ ...newRepairForm, brand: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Model (e.g. iPhone 15) *"
                    value={newRepairForm.model}
                    onChange={(e) => setNewRepairForm({ ...newRepairForm, model: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Serial Number / IMEI (Optional)"
                  value={newRepairForm.serial_number}
                  onChange={(e) => setNewRepairForm({ ...newRepairForm, serial_number: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none"
                />
                <textarea
                  required
                  rows="2"
                  placeholder="Problem Description *"
                  value={newRepairForm.problem}
                  onChange={(e) => setNewRepairForm({ ...newRepairForm, problem: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Service</label>
                  <select
                    value={newRepairForm.service_id}
                    onChange={(e) => setNewRepairForm({ ...newRepairForm, service_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none"
                  >
                    <option value="">Select Service</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.service_name} (₹{s.price})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Assign Technician</label>
                  <select
                    value={newRepairForm.technician_id}
                    onChange={(e) => setNewRepairForm({ ...newRepairForm, technician_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none"
                  >
                    <option value="">Unassigned</option>
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Repair Ticket'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <ConfirmModal
          title="Delete Repair Ticket"
          message="Are you sure you want to permanently delete this repair ticket?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
