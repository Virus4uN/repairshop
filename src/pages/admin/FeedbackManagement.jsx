import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Trash2, Star } from 'lucide-react';
import { formatDate } from '../../lib/helpers';
import StarRating from '../../components/common/StarRating';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';

export default function FeedbackManagement() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { fetch(); }, []);
  const fetch = async () => {
    const { data } = await supabase.from('feedback').select('*, customers(full_name), repairs(repair_id)').order('created_at', { ascending: false });
    setFeedback(data || []); setLoading(false);
  };

  const handleDelete = async () => { await supabase.from('feedback').delete().eq('id', deleteId); toast.success('Deleted'); fetch(); };

  const filtered = feedback.filter((f) => {
    if (filter !== 'all' && f.rating !== parseInt(filter)) return false;
    if (search && !f.customers?.full_name?.toLowerCase().includes(search.toLowerCase()) && !f.repairs?.repair_id?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const avgRating = feedback.length ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1) : '0.0';

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Feedback Management</h1>
        <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl">
          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          <span className="font-bold text-amber-700">{avgRating}</span>
          <span className="text-sm text-amber-600">Avg Rating ({feedback.length} reviews)</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by customer or repair ID..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white">
          <option value="all">All Ratings</option>
          {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} Stars</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((f) => (
          <div key={f.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  {f.customers?.full_name?.[0] || '?'}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{f.customers?.full_name}</p>
                  <p className="text-xs text-gray-500">{f.repairs?.repair_id} · {formatDate(f.created_at)}</p>
                </div>
              </div>
              <button onClick={() => setDeleteId(f.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
            <StarRating rating={f.rating} readonly size="sm" />
            {f.service_quality && <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${f.service_quality === 'Excellent' ? 'bg-green-100 text-green-700' : f.service_quality === 'Good' ? 'bg-blue-100 text-blue-700' : f.service_quality === 'Average' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{f.service_quality}</span>}
            {f.comments && <p className="text-sm text-gray-600 mt-2 leading-relaxed">"{f.comments}"</p>}
          </div>
        ))}
      </div>
      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Feedback" message="Are you sure?" />
    </div>
  );
}
