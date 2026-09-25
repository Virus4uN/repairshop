import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../lib/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1'];

export default function Reports() {
  const [data, setData] = useState({ repairs: [], invoices: [], feedback: [], technicians: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const [{ data: r }, { data: i }, { data: f }, { data: t }] = await Promise.all([
        supabase.from('repairs').select('*'),
        supabase.from('invoices').select('*'),
        supabase.from('feedback').select('*'),
        supabase.from('technicians').select('*, repairs(id)'),
      ]);
      setData({ repairs: r || [], invoices: i || [], feedback: f || [], technicians: t || [] });
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) return <LoadingSpinner />;

  const totalRepairs = data.repairs.length;
  const completedRepairs = data.repairs.filter((r) => r.status === 'completed').length;
  const pendingRepairs = data.repairs.filter((r) => !['completed', 'cancelled'].includes(r.status)).length;
  const cancelledRepairs = data.repairs.filter((r) => r.status === 'cancelled').length;
  const totalRevenue = data.invoices.reduce((s, i) => s + (i.total_amount || 0), 0);
  const avgRating = data.feedback.length ? (data.feedback.reduce((s, f) => s + f.rating, 0) / data.feedback.length).toFixed(1) : 0;

  // Status breakdown
  const statusCounts = {};
  data.repairs.forEach((r) => { statusCounts[r.status] = (statusCounts[r.status] || 0) + 1; });
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));

  // Technician performance
  const techData = data.technicians.map((t) => ({ name: t.name, jobs: t.repairs?.length || 0 })).sort((a, b) => b.jobs - a.jobs);

  // Rating distribution
  const ratingData = [1, 2, 3, 4, 5].map((r) => ({ rating: `${r} ★`, count: data.feedback.filter((f) => f.rating === r).length }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Repairs', val: totalRepairs, color: 'text-blue-600' },
          { label: 'Completed', val: completedRepairs, color: 'text-green-600' },
          { label: 'Pending', val: pendingRepairs, color: 'text-amber-600' },
          { label: 'Cancelled', val: cancelledRepairs, color: 'text-red-600' },
          { label: 'Revenue', val: formatCurrency(totalRevenue), color: 'text-emerald-600' },
          { label: 'Avg Rating', val: `${avgRating} ★`, color: 'text-amber-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-xl font-bold ${s.color} mt-1`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Repair Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Technician Performance</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={techData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="jobs" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Customer Feedback Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ratingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="rating" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#F59E0B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
