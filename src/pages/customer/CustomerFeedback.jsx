import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/dataService';
import StarRating from '../../components/common/StarRating';
import { Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerFeedback() {
  const { id } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [quality, setQuality] = useState('Excellent');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }
    setLoading(true);
    try {
      await dataService.createFeedback({
        customer_id: profile?.id || 'cust-demo',
        repair_id: id || 'rep-4',
        rating,
        service_quality: quality,
        comments,
      });
      toast.success('Thank you for your valuable feedback!');
      navigate('/customer/my-repairs');
    } catch (err) {
      toast.error('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 mb-4 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Share Your Feedback</h1>
      <p className="text-gray-500 text-sm mb-6">How was your service experience at Smart Hub?</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
        <div>
          <label className="block text-xs font-semibold uppercase text-gray-600 mb-2">Overall Rating *</label>
          <StarRating rating={rating} onChange={setRating} size="lg" />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-gray-600 mb-2">Service Quality</label>
          <div className="grid grid-cols-2 gap-2">
            {['Excellent', 'Good', 'Average', 'Poor'].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuality(q)}
                className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                  quality === q
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Detailed Review</label>
          <textarea
            rows="3"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none text-sm"
            placeholder="Share details about the repair quality, turnaround speed, and staff behavior..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer text-sm shadow-md"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
