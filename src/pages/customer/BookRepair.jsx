import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Loader2, Upload, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BookRepair() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [form, setForm] = useState({
    device_type: '', brand: '', model: '', serial_number: '', problem: '',
    service_id: '', preferred_date: '', preferred_time: '', additional_notes: '',
  });

  useEffect(() => {
    supabase.from('services').select('*').eq('is_active', true).then(({ data }) => setServices(data || []));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: customer } = await supabase
        .from('customers').select('id').eq('user_id', profile.id).single();

      if (!customer) throw new Error('Customer profile not found');

      const { data, error } = await supabase
        .from('repairs')
        .insert({
          customer_id: customer.id,
          service_id: form.service_id || null,
          device_type: form.device_type,
          brand: form.brand,
          model: form.model,
          serial_number: form.serial_number,
          problem: form.problem,
          preferred_date: form.preferred_date || null,
          preferred_time: form.preferred_time,
          additional_notes: form.additional_notes,
          status: 'request_received',
        })
        .select()
        .single();

      if (error) throw error;

      // Add to repair history
      await supabase.from('repair_history').insert({
        repair_id: data.id,
        status: 'request_received',
        notes: 'Repair request submitted by customer',
        updated_by: profile.id,
      });

      setSuccess(data.repair_id);
      toast.success('Repair request submitted!');
    } catch (err) {
      toast.error(err.message || 'Failed to submit repair request');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Repair Request Submitted!</h2>
        <p className="text-gray-500 mb-4">Your repair request has been received successfully</p>
        <div className="bg-gray-50 rounded-2xl p-6 mb-6">
          <p className="text-sm text-gray-500">Your Repair ID</p>
          <p className="text-3xl font-bold text-blue-600 font-mono mt-1">{success}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate('/track')} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold">
            Track Repair
          </button>
          <button onClick={() => navigate('/customer/dashboard')} className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Book a Repair</h1>
      <p className="text-gray-500 text-sm mb-6">Fill in the details below to submit your repair request</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Device Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Device Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Device Type *</label>
              <select name="device_type" required value={form.device_type} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white">
                <option value="">Select Device</option>
                <option>Mobile</option><option>Laptop</option><option>Computer</option>
                <option>Tablet</option><option>Printer</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
              <input name="brand" required value={form.brand} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                placeholder="e.g., Samsung, Dell, HP" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input name="model" value={form.model} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                placeholder="e.g., Galaxy S23, Inspiron 15" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
              <input name="serial_number" value={form.serial_number} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                placeholder="Optional" />
            </div>
          </div>
        </div>

        {/* Repair Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Repair Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Problem / Issue *</label>
              <textarea name="problem" rows="3" required value={form.problem} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                placeholder="Describe the problem with your device" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Required</label>
              <select name="service_id" value={form.service_id} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white">
                <option value="">Select Service</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.service_name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                <input name="preferred_date" type="date" value={form.preferred_date} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                <select name="preferred_time" value={form.preferred_time} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white">
                  <option value="">Select Time</option>
                  <option>Morning (9 AM - 12 PM)</option>
                  <option>Afternoon (12 PM - 4 PM)</option>
                  <option>Evening (4 PM - 8 PM)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
              <textarea name="additional_notes" rows="2" value={form.additional_notes} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                placeholder="Any additional information" />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Repair Request'}
          </button>
          <button type="button" onClick={() => navigate(-1)}
            className="px-6 py-3.5 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
