import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { CheckCircle2, Circle, ArrowLeft } from 'lucide-react';
import { STATUS_ORDER, STATUS_CONFIG, formatDate, formatDateTime } from '../../lib/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function RepairDetails() {
  const { id } = useParams();
  const [repair, setRepair] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    const { data } = await supabase.from('repairs').select('*, customers(full_name, phone, email), services(service_name), technicians(name)').eq('id', id).single();
    setRepair(data);
    const { data: hist } = await supabase.from('repair_history').select('*').eq('repair_id', id).order('created_at', { ascending: true });
    setHistory(hist || []);
    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;
  if (!repair) return <div className="text-center py-12 text-gray-500">Repair not found</div>;

  const currentIndex = STATUS_ORDER.indexOf(repair.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/customer/my-repairs" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" /> Back to My Repairs
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Repair ID</p>
            <p className="text-2xl font-bold text-gray-900 font-mono">{repair.repair_id}</p>
          </div>
          <StatusBadge status={repair.status} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><p className="text-gray-500 text-xs">Device</p><p className="font-semibold">{repair.device_type}</p></div>
          <div><p className="text-gray-500 text-xs">Brand / Model</p><p className="font-semibold">{repair.brand} {repair.model}</p></div>
          <div><p className="text-gray-500 text-xs">Service</p><p className="font-semibold">{repair.services?.service_name || '—'}</p></div>
          <div><p className="text-gray-500 text-xs">Technician</p><p className="font-semibold">{repair.technicians?.name || 'Not Assigned'}</p></div>
        </div>
      </div>

      {/* Problem & Diagnosis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-2">Problem</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{repair.problem}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-2">Diagnosis</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{repair.diagnosis || 'Pending diagnosis'}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-6">Repair Progress</h3>
        <div className="space-y-0">
          {STATUS_ORDER.map((status, i) => {
            const isCompleted = i <= currentIndex;
            const isCurrent = i === currentIndex;
            const config = STATUS_CONFIG[status];
            const histEntry = history.find((h) => h.status === status);
            return (
              <div key={status} className="flex gap-4">
                <div className="flex flex-col items-center">
                  {isCompleted ? <CheckCircle2 className={`w-7 h-7 shrink-0 ${isCurrent ? 'text-blue-600 animate-pulse' : 'text-green-500'}`} /> : <Circle className="w-7 h-7 text-gray-300 shrink-0" />}
                  {i < STATUS_ORDER.length - 1 && <div className={`w-0.5 h-10 ${isCompleted ? 'bg-green-300' : 'bg-gray-200'}`} />}
                </div>
                <div className="pb-8">
                  <p className={`font-semibold text-sm ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{config.label}</p>
                  {histEntry && <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(histEntry.created_at)}</p>}
                  {histEntry?.notes && <p className="text-xs text-gray-400 mt-0.5">{histEntry.notes}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      {repair.status === 'completed' && (
        <div className="flex gap-3">
          <Link to={`/customer/feedback/${repair.id}`} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm">
            Give Feedback
          </Link>
        </div>
      )}
    </div>
  );
}
