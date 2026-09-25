import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import { STATUS_ORDER, STATUS_CONFIG, formatDate, formatDateTime, formatCurrency } from '../../lib/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function RepairDetailAdmin() {
  const { id } = useParams();
  const [repair, setRepair] = useState(null);
  const [history, setHistory] = useState([]);
  const [parts, setParts] = useState([]);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    const { data } = await supabase.from('repairs').select('*, customers(full_name, phone, email, address), services(service_name), technicians(name, specialization)').eq('id', id).single();
    setRepair(data);
    const { data: h } = await supabase.from('repair_history').select('*').eq('repair_id', id).order('created_at', { ascending: true });
    setHistory(h || []);
    const { data: p } = await supabase.from('repair_parts').select('*, spare_parts(part_name)').eq('repair_id', id);
    setParts(p || []);
    const { data: inv } = await supabase.from('invoices').select('*').eq('repair_id', id).single();
    setInvoice(inv);
    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;
  if (!repair) return <div className="text-center py-12 text-gray-500">Repair not found</div>;

  const currentIndex = STATUS_ORDER.indexOf(repair.status);

  return (
    <div className="space-y-6">
      <Link to="/admin/repairs" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" /> Back to Repairs
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Repair ID</p>
            <p className="text-2xl font-bold font-mono text-gray-900">{repair.repair_id}</p>
          </div>
          <StatusBadge status={repair.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 text-sm mb-2">Customer Details</h4>
            <p className="text-sm text-gray-600">{repair.customers?.full_name}</p>
            <p className="text-sm text-gray-500">{repair.customers?.email}</p>
            <p className="text-sm text-gray-500">{repair.customers?.phone}</p>
            <p className="text-sm text-gray-500">{repair.customers?.address}</p>
          </div>
          {/* Device */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 text-sm mb-2">Device Details</h4>
            <p className="text-sm text-gray-600">Type: {repair.device_type}</p>
            <p className="text-sm text-gray-500">Brand: {repair.brand}</p>
            <p className="text-sm text-gray-500">Model: {repair.model}</p>
            <p className="text-sm text-gray-500">Serial: {repair.serial_number || '—'}</p>
          </div>
          {/* Repair Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 text-sm mb-2">Repair Info</h4>
            <p className="text-sm text-gray-600">Service: {repair.services?.service_name || '—'}</p>
            <p className="text-sm text-gray-500">Technician: {repair.technicians?.name || 'Unassigned'}</p>
            <p className="text-sm text-gray-500">Est. Date: {formatDate(repair.estimated_completion)}</p>
            <p className="text-sm text-gray-500">Created: {formatDate(repair.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Problem & Diagnosis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-2">Problem</h3>
          <p className="text-sm text-gray-600">{repair.problem}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-2">Diagnosis</h3>
          <p className="text-sm text-gray-600">{repair.diagnosis || 'Pending'}</p>
        </div>
      </div>

      {/* Parts Used */}
      {parts.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Parts Used</h3>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-gray-500 uppercase border-b"><th className="pb-2">Part</th><th className="pb-2">Qty</th><th className="pb-2">Price</th></tr></thead>
            <tbody>{parts.map((p) => (<tr key={p.id} className="border-b border-gray-50"><td className="py-2">{p.spare_parts?.part_name}</td><td>{p.quantity}</td><td>{formatCurrency(p.unit_price)}</td></tr>))}</tbody>
          </table>
        </div>
      )}

      {/* Invoice */}
      {invoice && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Invoice - {invoice.invoice_number}</h3>
          <div className="space-y-2 text-sm max-w-sm">
            <div className="flex justify-between"><span className="text-gray-500">Service Charges</span><span>{formatCurrency(invoice.service_charge)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Parts Cost</span><span>{formatCurrency(invoice.parts_cost)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Labour Charges</span><span>{formatCurrency(invoice.labour_charge)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Discount</span><span className="text-green-600">-{formatCurrency(invoice.discount)}</span></div>
            <hr />
            <div className="flex justify-between font-bold text-lg"><span>Total</span><span>{formatCurrency(invoice.total_amount)}</span></div>
            <StatusBadge status={invoice.payment_status === 'paid' ? 'completed' : 'request_received'} />
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-6">Repair History</h3>
        <div className="space-y-0">
          {STATUS_ORDER.map((status, i) => {
            const isCompleted = i <= currentIndex;
            const isCurrent = i === currentIndex;
            const config = STATUS_CONFIG[status];
            const histEntry = history.find((h) => h.status === status);
            return (
              <div key={status} className="flex gap-4">
                <div className="flex flex-col items-center">
                  {isCompleted ? <CheckCircle2 className={`w-7 h-7 shrink-0 ${isCurrent ? 'text-blue-600' : 'text-green-500'}`} /> : <Circle className="w-7 h-7 text-gray-300 shrink-0" />}
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
    </div>
  );
}
