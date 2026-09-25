import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dataService } from '../../lib/dataService';
import { ArrowLeft, CheckCircle2, Circle, Clock, Wrench, ShieldCheck, IndianRupee } from 'lucide-react';
import { STATUS_ORDER, STATUS_CONFIG, formatDate, formatDateTime, formatCurrency } from '../../lib/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function RepairDetailAdmin() {
  const { id } = useParams();
  const [repair, setRepair] = useState(null);
  const [history, setHistory] = useState([]);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const rep = await dataService.getRepairById(id);
      setRepair(rep);

      if (rep) {
        const [hist, inv] = await Promise.all([
          dataService.getRepairHistory(rep.id),
          dataService.getInvoiceByRepairId(rep.id),
        ]);
        setHistory(hist || []);
        setInvoice(inv || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!repair) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8">
        <p className="text-gray-500 mb-4">Repair ticket not found.</p>
        <Link to="/admin/repairs" className="text-blue-600 font-semibold hover:underline">
          ← Return to Repair Management
        </Link>
      </div>
    );
  }

  const currentIndex = STATUS_ORDER.indexOf(repair.status);

  return (
    <div className="space-y-6">
      <Link to="/admin/repairs" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Repairs
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tracking Reference</p>
            <p className="text-2xl font-bold font-mono text-gray-900">{repair.repair_id}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={repair.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer */}
          <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2">Customer Profile</h4>
            <p className="text-sm font-semibold text-gray-900">{repair.customers?.full_name || 'Walk-in Customer'}</p>
            <p className="text-xs text-gray-500 mt-1">{repair.customers?.email || 'No email'}</p>
            <p className="text-xs text-gray-500 mt-0.5">{repair.customers?.phone || 'No phone'}</p>
            <p className="text-xs text-gray-500 mt-0.5">{repair.customers?.address || 'Standard Store Pickup'}</p>
          </div>

          {/* Device */}
          <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2">Device Information</h4>
            <p className="text-sm font-semibold text-gray-900">{repair.brand} {repair.model || repair.device_type}</p>
            <p className="text-xs text-gray-500 mt-1">Category: {repair.device_type}</p>
            <p className="text-xs text-gray-500 mt-0.5">Serial / IMEI: <span className="font-mono">{repair.serial_number || 'N/A'}</span></p>
          </div>

          {/* Service & Technician */}
          <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2">Service & Assignment</h4>
            <p className="text-sm font-semibold text-blue-600">{repair.services?.service_name || 'General Repair Service'}</p>
            <p className="text-xs text-gray-600 mt-1">
              Technician: <span className="font-semibold text-gray-900">{repair.technicians?.name || 'Unassigned'}</span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Est. Delivery: {formatDate(repair.estimated_completion)}</p>
          </div>
        </div>
      </div>

      {/* Problem & Diagnosis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-600" /> Customer Reported Issue
          </h3>
          <p className="text-sm text-gray-700 bg-gray-50 p-3.5 rounded-xl border border-gray-100 leading-relaxed">
            {repair.problem || 'No description provided.'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Technician Diagnosis
          </h3>
          <p className="text-sm text-gray-700 bg-gray-50 p-3.5 rounded-xl border border-gray-100 leading-relaxed">
            {repair.diagnosis || 'Diagnosis is in progress by the assigned technician.'}
          </p>
        </div>
      </div>

      {/* Invoice Details */}
      {invoice && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900">Billing Invoice: {invoice.invoice_number}</h3>
              <p className="text-xs text-gray-500">{formatDate(invoice.invoice_date)}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              invoice.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {invoice.payment_status?.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl text-sm">
            <div>
              <p className="text-xs text-gray-400">Service Charges</p>
              <p className="font-semibold text-gray-900 mt-0.5">{formatCurrency(invoice.service_charge)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Spare Parts Cost</p>
              <p className="font-semibold text-gray-900 mt-0.5">{formatCurrency(invoice.parts_cost)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Labour Charge</p>
              <p className="font-semibold text-gray-900 mt-0.5">{formatCurrency(invoice.labour_charge)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Billed</p>
              <p className="text-base font-bold text-blue-600 mt-0.5">{formatCurrency(invoice.total_amount)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" /> Repair Status Progression
        </h3>
        <div className="space-y-0">
          {STATUS_ORDER.map((statusKey, i) => {
            const isCompleted = i <= currentIndex;
            const isCurrent = i === currentIndex;
            const config = STATUS_CONFIG[statusKey];
            const histEntry = history.find((h) => h.status === statusKey);

            return (
              <div key={statusKey} className="flex gap-4">
                <div className="flex flex-col items-center">
                  {isCompleted ? (
                    <CheckCircle2 className={`w-7 h-7 shrink-0 ${isCurrent ? 'text-blue-600' : 'text-emerald-500'}`} />
                  ) : (
                    <Circle className="w-7 h-7 text-gray-300 shrink-0" />
                  )}
                  {i < STATUS_ORDER.length - 1 && (
                    <div className={`w-0.5 h-10 ${isCompleted ? 'bg-emerald-300' : 'bg-gray-200'}`} />
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
                    <p className="text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg mt-1 inline-block border border-gray-100">
                      {histEntry.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
