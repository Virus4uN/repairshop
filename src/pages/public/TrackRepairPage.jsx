import { useState } from 'react';
import { Search, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { STATUS_ORDER, STATUS_CONFIG, formatDateTime } from '../../lib/helpers';
import StatusBadge from '../../components/common/StatusBadge';

export default function TrackRepairPage() {
  const [repairId, setRepairId] = useState('');
  const [repair, setRepair] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!repairId.trim()) return;
    setLoading(true);
    setError('');
    setRepair(null);
    setSearched(true);

    try {
      const { data, error: err } = await supabase
        .from('repairs')
        .select(`*, customers(full_name), services(service_name), technicians(name)`)
        .eq('repair_id', repairId.trim().toUpperCase())
        .single();

      if (err || !data) {
        setError('No repair found with this ID. Please check and try again.');
        return;
      }

      setRepair(data);

      const { data: hist } = await supabase
        .from('repair_history')
        .select('*')
        .eq('repair_id', data.id)
        .order('created_at', { ascending: true });

      setHistory(hist || []);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = repair ? STATUS_ORDER.indexOf(repair.status) : -1;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-32 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-1/2 w-96 h-96 rounded-full bg-cyan-400 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Track Your Repair</h1>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto mb-8">Enter your Repair ID to check the current status of your device</p>

          <form onSubmit={handleTrack} className="max-w-lg mx-auto">
            <div className="flex gap-2 bg-white/10 backdrop-blur rounded-2xl p-2">
              <input
                type="text"
                value={repairId}
                onChange={(e) => setRepairId(e.target.value)}
                placeholder="Enter Repair ID (e.g., SHR-2026-00001)"
                className="flex-1 px-5 py-3 bg-white rounded-xl text-gray-900 placeholder-gray-400 outline-none font-mono text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Track
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="py-16 bg-gray-50 min-h-[40vh]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          {repair && (
            <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
              {/* Repair Info */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Repair ID</p>
                    <p className="text-xl font-bold text-gray-900 font-mono">{repair.repair_id}</p>
                  </div>
                  <StatusBadge status={repair.status} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Device</p>
                    <p className="font-semibold text-gray-900 text-sm">{repair.device_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Brand / Model</p>
                    <p className="font-semibold text-gray-900 text-sm">{repair.brand} {repair.model}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Service</p>
                    <p className="font-semibold text-gray-900 text-sm">{repair.services?.service_name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Technician</p>
                    <p className="font-semibold text-gray-900 text-sm">{repair.technicians?.name || 'Not Assigned'}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-lg text-gray-900 mb-6">Repair Progress</h3>
                <div className="space-y-0">
                  {STATUS_ORDER.map((status, i) => {
                    const isCompleted = i <= currentIndex;
                    const isCurrent = i === currentIndex;
                    const config = STATUS_CONFIG[status];
                    const histEntry = history.find((h) => h.status === status);

                    return (
                      <div key={status} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          {isCompleted ? (
                            <CheckCircle2 className={`w-7 h-7 shrink-0 ${isCurrent ? 'text-blue-600 animate-pulse' : 'text-green-500'}`} />
                          ) : (
                            <Circle className="w-7 h-7 text-gray-300 shrink-0" />
                          )}
                          {i < STATUS_ORDER.length - 1 && (
                            <div className={`w-0.5 h-10 ${isCompleted ? 'bg-green-300' : 'bg-gray-200'}`} />
                          )}
                        </div>
                        <div className="pb-8">
                          <p className={`font-semibold text-sm ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                            {config.label}
                          </p>
                          {histEntry && (
                            <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(histEntry.created_at)}</p>
                          )}
                          {histEntry?.notes && (
                            <p className="text-xs text-gray-400 mt-0.5">{histEntry.notes}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {!repair && searched && !error && !loading && (
            <div className="text-center py-12 text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No results found</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
