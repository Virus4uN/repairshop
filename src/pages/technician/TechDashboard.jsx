import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/dataService';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  Search,
  Filter,
  Check,
  ChevronRight,
  Cpu,
  Smartphone,
  Laptop,
  Tablet,
  Package,
  FileEdit,
  ArrowRight,
  Sparkles,
  User,
  Phone,
  Mail,
  Loader2,
  X
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatCurrency } from '../../lib/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

function getDeviceIcon(type) {
  const t = (type || '').toLowerCase();
  if (t.includes('laptop') || t.includes('macbook')) return Laptop;
  if (t.includes('tablet') || t.includes('ipad')) return Tablet;
  if (t.includes('desktop') || t.includes('pc')) return Cpu;
  return Smartphone;
}

export default function TechDashboard() {
  const { profile } = useAuth();
  const [repairs, setRepairs] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStage, setFilterStage] = useState('all');
  const [search, setSearch] = useState('');
  const [stationStatus, setStationStatus] = useState('active'); // active, busy
  const [noteModalRepair, setNoteModalRepair] = useState(null);
  const [benchNote, setBenchNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [advancingId, setAdvancingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    try {
      const [techRepairs, parts] = await Promise.all([
        dataService.getRepairsByTechnician(profile?.email || profile?.id),
        dataService.getSpareParts(),
      ]);
      setRepairs(techRepairs || []);
      setSpareParts(parts || []);
    } catch (e) {
      console.error('Technician dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click status advance from workbench
  const handleAdvanceStatus = async (repair, nextStatus) => {
    setAdvancingId(repair.id);
    try {
      await dataService.updateRepair(repair.id, {
        status: nextStatus,
        updated_at: new Date().toISOString(),
      });
      toast.success(`Job ${repair.repair_id} moved to ${nextStatus.replace(/_/g, ' ').toUpperCase()}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update stage: ' + err.message);
    } finally {
      setAdvancingId(null);
    }
  };

  const handleSaveBenchNote = async (e) => {
    e.preventDefault();
    if (!noteModalRepair) return;
    setSavingNote(true);
    try {
      const existingProblem = noteModalRepair.problem || '';
      const updatedNotes = `${existingProblem}\n[Bench Note by ${profile?.full_name || 'Tech'} - ${new Date().toLocaleTimeString()}]: ${benchNote}`.trim();

      await dataService.updateRepair(noteModalRepair.id, {
        problem: updatedNotes,
        updated_at: new Date().toISOString(),
      });

      toast.success('Bench diagnosis note saved!');
      setNoteModalRepair(null);
      setBenchNote('');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to save note');
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  // Filter repairs
  const filtered = repairs.filter((r) => {
    const matchesSearch =
      !search ||
      r.repair_id?.toLowerCase().includes(search.toLowerCase()) ||
      r.brand?.toLowerCase().includes(search.toLowerCase()) ||
      r.model?.toLowerCase().includes(search.toLowerCase()) ||
      r.customers?.full_name?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStage === 'diagnosis') return ['request_received', 'device_received', 'diagnosing'].includes(r.status);
    if (filterStage === 'repairing') return r.status === 'repair_in_progress';
    if (filterStage === 'qc') return r.status === 'quality_check';
    if (filterStage === 'ready') return ['ready_for_pickup', 'completed'].includes(r.status);
    return true;
  });

  const activeJobs = repairs.filter((r) => !['completed', 'cancelled'].includes(r.status));
  const diagnosingJobs = repairs.filter((r) => ['request_received', 'device_received', 'diagnosing'].includes(r.status));
  const inProgressJobs = repairs.filter((r) => r.status === 'repair_in_progress');
  const qcJobs = repairs.filter((r) => r.status === 'quality_check');
  const readyJobs = repairs.filter((r) => ['ready_for_pickup', 'completed'].includes(r.status));

  // Low stock parts warning
  const lowStockParts = spareParts.filter((p) => Number(p.quantity) <= (Number(p.min_stock) || 5));

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Engineering Workbench Header */}
      <div className="rounded-3xl bg-gradient-to-r from-gray-900 via-slate-900 to-gray-800 text-white p-6 sm:p-8 border border-gray-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                WORKBENCH #2 • HARDWARE & DIAGNOSTICS LAB
              </span>
              <span className="text-xs text-gray-400">
                Staff ID: <span className="font-mono text-gray-200">{profile?.id?.slice(0, 8) || 'TECH-882'}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Technician Workbench - {profile?.full_name || 'Vikram Singh'}
            </h1>
            <p className="text-gray-400 text-sm max-w-xl">
              Inspect device schematics, advance repair lifecycle stages, log micro-soldering notes, and requisition spare parts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center p-1 rounded-2xl bg-gray-800/80 border border-gray-700 text-xs">
              <button
                type="button"
                onClick={() => setStationStatus('active')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  stationStatus === 'active' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                🟢 Available for Jobs
              </button>
              <button
                type="button"
                onClick={() => setStationStatus('busy')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  stationStatus === 'busy' ? 'bg-amber-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                🟡 Busy in Lab
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Engineer Telemetry KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setFilterStage('all')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            filterStage === 'all'
              ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20 shadow-sm'
              : 'bg-white border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Queue on Bench</p>
            <ClipboardList className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">{activeJobs.length}</p>
          <p className="text-[11px] text-gray-400 mt-1">Total assigned devices</p>
        </div>

        <div
          onClick={() => setFilterStage('diagnosis')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            filterStage === 'diagnosis'
              ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-500/20 shadow-sm'
              : 'bg-white border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Needs Diagnosis</p>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-extrabold text-amber-600 mt-2">{diagnosingJobs.length}</p>
          <p className="text-[11px] text-gray-400 mt-1">Hardware testing required</p>
        </div>

        <div
          onClick={() => setFilterStage('repairing')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            filterStage === 'repairing'
              ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
              : 'bg-white border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">In Active Repair</p>
            <Wrench className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-extrabold text-indigo-600 mt-2">{inProgressJobs.length}</p>
          <p className="text-[11px] text-gray-400 mt-1">Soldering / part assembly</p>
        </div>

        <div
          onClick={() => setFilterStage('ready')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            filterStage === 'ready'
              ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
              : 'bg-white border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ready / Passed QC</p>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">{readyJobs.length}</p>
          <p className="text-[11px] text-gray-400 mt-1">Completed & inspected</p>
        </div>
      </div>

      {/* Main Grid: Workbench Jobs (Left) + Spare Parts & Inventory (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Job Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Workbench Job Queue</h2>
              <p className="text-xs text-gray-500">Live active device tickets on your workbench</p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search ticket, model, customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs bg-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: `All Jobs (${repairs.length})` },
              { id: 'diagnosis', label: `Diagnosis (${diagnosingJobs.length})` },
              { id: 'repairing', label: `Repairing (${inProgressJobs.length})` },
              { id: 'qc', label: `QC Testing (${qcJobs.length})` },
              { id: 'ready', label: `Ready (${readyJobs.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStage(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  filterStage === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Job Cards */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm text-center">
              <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-700">No jobs matching selected filter</p>
              <p className="text-xs text-gray-400 mt-1">Switch filter stage to inspect other bench items.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((r) => {
                const DeviceIcon = getDeviceIcon(r.device_type);
                const isAdvancing = advancingId === r.id;

                return (
                  <div
                    key={r.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Device & Customer Info */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700 shrink-0">
                          <DeviceIcon className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                              {r.repair_id}
                            </span>
                            <h3 className="font-bold text-gray-900 text-sm">
                              {r.brand} {r.model || r.device_type}
                            </h3>
                          </div>

                          <p className="text-xs text-gray-600 mt-1">
                            Customer: <span className="font-semibold text-gray-800">{r.customers?.full_name || 'Walk-in Customer'}</span>
                            {r.customers?.phone && <> • Ph: <span className="text-gray-500">{r.customers?.phone}</span></>}
                          </p>

                          <div className="mt-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-700 whitespace-pre-line font-mono">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                              Symptom / Diagnostic Notes:
                            </span>
                            {r.problem}
                          </div>
                        </div>
                      </div>

                      {/* Status & Priority Badge */}
                      <div className="flex flex-col sm:items-end gap-2 shrink-0">
                        <StatusBadge status={r.status} />
                        <span className="text-[11px] text-gray-400">
                          Target: {formatDate(r.estimated_completion || r.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Action Bar for Technicians */}
                    <div className="mt-4 pt-3.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                      {/* Bench Note Button */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setNoteModalRepair(r);
                            setBenchNote('');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 transition-colors cursor-pointer"
                        >
                          <FileEdit className="w-3.5 h-3.5 text-gray-500" /> + Add Bench Note
                        </button>

                        <Link
                          to={`/technician/repairs/${r.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
                        >
                          Full Workbench <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      {/* Quick 1-Click Status Advancer */}
                      <div className="flex items-center gap-1.5">
                        {r.status === 'request_received' || r.status === 'device_received' ? (
                          <button
                            type="button"
                            disabled={isAdvancing}
                            onClick={() => handleAdvanceStatus(r, 'diagnosing')}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm flex items-center gap-1 cursor-pointer transition-all"
                          >
                            {isAdvancing ? <Loader2 className="w-3 h-3 animate-spin" /> : '▶ Start Diagnosis'}
                          </button>
                        ) : r.status === 'diagnosing' ? (
                          <button
                            type="button"
                            disabled={isAdvancing}
                            onClick={() => handleAdvanceStatus(r, 'repair_in_progress')}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center gap-1 cursor-pointer transition-all"
                          >
                            {isAdvancing ? <Loader2 className="w-3 h-3 animate-spin" /> : '▶ Begin Repair'}
                          </button>
                        ) : r.status === 'repair_in_progress' ? (
                          <button
                            type="button"
                            disabled={isAdvancing}
                            onClick={() => handleAdvanceStatus(r, 'quality_check')}
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm flex items-center gap-1 cursor-pointer transition-all"
                          >
                            {isAdvancing ? <Loader2 className="w-3 h-3 animate-spin" /> : '▶ Send to QA / Stress Test'}
                          </button>
                        ) : r.status === 'quality_check' ? (
                          <button
                            type="button"
                            disabled={isAdvancing}
                            onClick={() => handleAdvanceStatus(r, 'ready_for_pickup')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1 cursor-pointer transition-all"
                          >
                            {isAdvancing ? <Loader2 className="w-3 h-3 animate-spin" /> : '✔ Mark Ready for Customer'}
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Bench Work Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Lab Inventory & Parts Fast Lookup */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-gray-900 text-sm">Spare Parts Inventory</h3>
              </div>
              <span className="text-xs text-gray-500 font-mono">{spareParts.length} SKUs</span>
            </div>
            <p className="text-xs text-gray-500">Live component availability in workshop stock room.</p>

            {lowStockParts.length > 0 && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{lowStockParts.length} parts running low on stock!</span>
              </div>
            )}

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {spareParts.slice(0, 7).map((p) => {
                const isLow = Number(p.quantity) <= (Number(p.min_stock) || 5);
                return (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-gray-900">{p.part_name}</p>
                      <p className="text-[11px] text-gray-400 capitalize">{p.category || 'Hardware Part'}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full font-bold font-mono text-[10px] ${
                          isLow ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {p.quantity} In Stock
                      </span>
                      <p className="text-[11px] text-gray-500 mt-0.5">{formatCurrency(p.price)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Hardware Lab Safety Checklist */}
          <div className="bg-gradient-to-br from-slate-900 to-gray-900 text-white rounded-3xl p-6 shadow-md border border-gray-800 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Lab Protocols & Checklist
            </h4>
            <ul className="text-xs text-gray-300 space-y-2 list-disc list-inside">
              <li>Always disconnect battery before display/board removal.</li>
              <li>ESD wrist straps required at Soldering Station #2.</li>
              <li>Run 15-minute diagnostic stress test before marking QC ready.</li>
              <li>Record IMEI and component serials on high-end devices.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bench Note Modal */}
      {noteModalRepair && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">
                Add Bench Diagnostic Note - {noteModalRepair.repair_id}
              </h3>
              <button onClick={() => setNoteModalRepair(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBenchNote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                  Technician Observations & Actions Taken
                </label>
                <textarea
                  required
                  rows={4}
                  value={benchNote}
                  onChange={(e) => setBenchNote(e.target.value)}
                  placeholder="e.g. Replaced cracked AMOLED display. Re-soldered charging flex pin 4. Battery thermal test steady at 32°C..."
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-xs outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNoteModalRepair(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingNote}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {savingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Note to Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
