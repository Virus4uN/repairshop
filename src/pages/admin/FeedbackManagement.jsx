import { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
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

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    const data = await dataService.getFeedback();
    setFeedback(data || []);
    setLoading(false);
  };

  const handleDelete = async () => {
    setFeedback((prev) => prev.filter((f) => f.id !== deleteId));
    toast.success('Feedback entry deleted');
    setDeleteId(null);
  };

  const filtered = feedback.filter((f) => {
    if (filter !== 'all' && f.rating !== parseInt(filter)) return false;
    if (
      search &&
      !f.customers?.full_name?.toLowerCase().includes(search.toLowerCase()) &&
      !f.repairs?.repair_id?.toLowerCase().includes(search.toLowerCase()) &&
      !f.comments?.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const avgRating = feedback.length
    ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1)
    : '5.0';

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Feedback & Reviews</h1>
          <p className="text-gray-500 text-sm">Customer ratings and satisfaction testimonials</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl">
          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          <span className="font-bold text-amber-800 text-base">{avgRating}</span>
          <span className="text-xs text-amber-700">Average Rating ({feedback.length} reviews)</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, repair ticket, or review text..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white outline-none focus:border-blue-500"
        >
          <option value="all">All Ratings</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} Stars
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((f) => (
          <div key={f.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{f.customers?.full_name || 'Customer'}</h4>
                <p className="text-xs text-gray-400 font-mono mt-0.5">Ticket: {f.repairs?.repair_id || 'SHR-2026-00104'}</p>
              </div>
              <div className="flex items-center gap-2">
                <StarRating rating={f.rating} size="sm" readOnly />
                <button
                  onClick={() => setDeleteId(f.id)}
                  className="p-1 rounded-lg hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-700 bg-gray-50/70 p-3 rounded-xl border border-gray-100 leading-relaxed mb-3">
              "{f.comments || 'Great service and quick repair turnaround!'}"
            </p>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {f.service_quality || 'Excellent'}
              </span>
              <span>{formatDate(f.created_at)}</span>
            </div>
          </div>
        ))}
      </div>

      {deleteId && (
        <ConfirmModal
          title="Delete Review"
          message="Are you sure you want to remove this feedback?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
