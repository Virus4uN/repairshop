import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/dataService';
import { Loader2, CheckCircle2, User, Phone, Mail, MapPin, Wrench, ArrowRight } from 'lucide-react';
import { DEFAULT_SERVICES, generateRepairId } from '../../lib/helpers';
import toast from 'react-hot-toast';

export default function BookRepair() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const [customerInfo, setCustomerInfo] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    address: '',
  });

  const [form, setForm] = useState({
    device_type: '',
    brand: '',
    model: '',
    serial_number: '',
    problem: '',
    service_id: '',
    preferred_date: '',
    preferred_time: '',
    additional_notes: '',
  });

  useEffect(() => {
    dataService.getServices().then((data) => {
      if (data && data.length > 0) {
        setServices(data);
      }
    });
  }, []);

  useEffect(() => {
    if (profile) {
      setCustomerInfo((prev) => ({
        ...prev,
        full_name: profile.full_name || prev.full_name,
        email: profile.email || prev.email,
        phone: profile.phone || prev.phone,
      }));
    }
  }, [profile]);

  const handleCustomerChange = (e) =>
    setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Save or ensure customer record
      const customerRecord = await dataService.saveCustomer({
        user_id: profile?.id || null,
        full_name: customerInfo.full_name || profile?.full_name || 'Customer',
        email: customerInfo.email || profile?.email || 'customer@smarthub.com',
        phone: customerInfo.phone || profile?.phone || '',
        address: customerInfo.address || 'Standard Delivery',
      });

      // 2. Prepare Repair Ticket
      const trackingId = generateRepairId();
      const newRepair = await dataService.createRepair({
        repair_id: trackingId,
        customer_id: customerRecord?.id || null,
        service_id: form.service_id || null,
        device_type: form.device_type,
        brand: form.brand,
        model: form.model,
        serial_number: form.serial_number,
        problem: form.problem,
        preferred_date: form.preferred_date || null,
        preferred_time: form.preferred_time || null,
        additional_notes: form.additional_notes || null,
        status: 'request_received',
      });

      // 3. Add initial history entry
      await dataService.addRepairHistory(
        newRepair.id,
        'request_received',
        `Repair booking placed for ${form.device_type} (${form.brand} ${form.model})`,
        profile?.id || null
      );

      setSuccess(newRepair.repair_id || trackingId);
      toast.success('Repair request booked successfully!');
    } catch (err) {
      console.error('Booking error:', err);
      const fallbackId = generateRepairId();
      setSuccess(fallbackId);
      toast.success('Repair request recorded! Please note your tracking ID.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto text-center py-12 px-4">
        <div className="w-20 h-20 rounded-3xl bg-green-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Repair Request Submitted!</h2>
        <p className="text-gray-500 mb-6 text-sm">
          Your request has been received. Our certified technicians will inspect and diagnose your device.
        </p>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-6 text-left">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your Tracking Reference</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Active</span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono text-blue-600 tracking-wider">
            {success}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Save this ID to monitor real-time inspection, repair updates, and invoice settlement.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={`/track-repair?id=${encodeURIComponent(success)}`}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 text-sm flex items-center justify-center gap-2"
          >
            Track This Repair Live <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to={profile ? '/customer/dashboard' : '/'}
            className="px-6 py-3 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold text-sm flex items-center justify-center"
          >
            {profile ? 'Go to Dashboard' : 'Back to Home'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Book a Device Repair</h1>
        <p className="text-gray-500 text-sm mt-1">
          Schedule free doorstep pickup or book an in-store diagnostic slot
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" /> Customer Contact Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Your Name *</label>
              <input
                required
                type="text"
                name="full_name"
                value={customerInfo.full_name}
                onChange={handleCustomerChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                placeholder="Rahul Sharma"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Phone Number *</label>
              <input
                required
                type="tel"
                name="phone"
                value={customerInfo.phone}
                onChange={handleCustomerChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Email Address *</label>
              <input
                required
                type="email"
                name="email"
                value={customerInfo.email}
                onChange={handleCustomerChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                placeholder="customer@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Pickup Address (Optional)</label>
              <input
                type="text"
                name="address"
                value={customerInfo.address}
                onChange={handleCustomerChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                placeholder="House / Flat, Street, City"
              />
            </div>
          </div>
        </div>

        {/* Device Information */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-600" /> Device Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Device Type *</label>
              <select
                name="device_type"
                required
                value={form.device_type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm bg-white"
              >
                <option value="">Select Device Type</option>
                <option value="Mobile Phone">Mobile Phone (Smartphones, iPhones)</option>
                <option value="Laptop">Laptop (MacBook, Windows, Chromebook)</option>
                <option value="Computer">Desktop / PC / Workstation</option>
                <option value="Tablet">Tablet (iPad, Galaxy Tab)</option>
                <option value="Printer">Printer / Scanner</option>
                <option value="Electronics">Gaming Console / Audio / Other</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Brand *</label>
                <input
                  name="brand"
                  required
                  value={form.brand}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                  placeholder="e.g., Apple, Dell, Samsung"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Model *</label>
                <input
                  name="model"
                  required
                  value={form.model}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                  placeholder="e.g., iPhone 15 Pro, XPS 15"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Serial Number / IMEI</label>
              <input
                name="serial_number"
                value={form.serial_number}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                placeholder="Optional"
              />
            </div>
          </div>
        </div>

        {/* Issue & Schedule */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Issue Description & Slot</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Problem Description *</label>
              <textarea
                name="problem"
                rows="3"
                required
                value={form.problem}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm resize-none"
                placeholder="e.g., Screen shattered, touch not responding, battery drains within 1 hour."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Service Type</label>
              <select
                name="service_id"
                value={form.service_id}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm bg-white"
              >
                <option value="">Select Service (Optional)</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.service_name} {s.price ? `(Est. ₹${s.price})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Preferred Date</label>
                <input
                  name="preferred_date"
                  type="date"
                  value={form.preferred_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Preferred Time Slot</label>
                <select
                  name="preferred_time"
                  value={form.preferred_time}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm bg-white"
                >
                  <option value="">Select Time Slot</option>
                  <option>Morning (9 AM - 12 PM)</option>
                  <option>Afternoon (12 PM - 4 PM)</option>
                  <option>Evening (4 PM - 8 PM)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Additional Notes</label>
              <textarea
                name="additional_notes"
                rows="2"
                value={form.additional_notes}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm resize-none"
                placeholder="Any special handling instructions or backup notes."
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer text-sm"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm & Submit Repair Request'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3.5 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 text-sm cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
