import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import StarRating from '../../components/common/StarRating';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerFeedback() {
  const { id } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [quality, setQuality] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a rating'); return; }
    setLoading(true);
    try {
      const { data: customer } = await supabase.from('customers').select('id').eq('user_id', profile.id).single();
      await supabase.from('feedback').insert({
        customer_id: customer.id, repair_id: id, rating, service_quality: quality, comments,
      });
      toast.success('Thank you for your feedback!');
      navigate('/customer/my-repairs');
    } catch (err) {
      toast.error('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Give Feedback</h1>
      <p className="text-gray-500 text-sm mb-6">Help us improve by sharing your experience</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rate Our Service</label>
          <StarRating rating={rating} onChange={setRating} size="lg" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Service Quality</label>
          <div className="grid grid-cols-2 gap-2">
            {['Excellent', 'Good', 'Average', 'Poor'].map((q) => (
              <button key={q} type="button" onClick={() => setQuality(q)}
                className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${quality === q ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                {q}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
          <textarea rows="4" value={comments} onChange={(e) => setComments(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
            placeholder="Share your experience..." />
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}
