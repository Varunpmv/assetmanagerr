import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  ClipboardCheck, Clock, CheckCircle2, AlertCircle, 
  ChevronRight, ArrowRight, ShieldCheck, Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Reviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get('/reviews');
        setReviews(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) return <div className="p-8">Loading active reviews...</div>;

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h2 className="page-title">Access Certification</h2>
        <p className="page-subtitle">Verify and approve tool access for your department.</p>
      </div>

      <div className="grid gap-6">
        {reviews.map(review => (
          <div key={review.id} className="card flex-between hover:border-primary transition cursor-pointer">
            <div className="flex gap-4 items-center">
              <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="font-bold">{review.Asset?.name}</h3>
                <p className="text-xs text-muted uppercase tracking-widest">{review.Asset?.type} • Review Cycle: {new Date(review.review_month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="text-right">
                <span className={`badge ${review.review_status === 'pending' ? 'badge-pending' : 'badge-active'}`}>
                  {review.review_status}
                </span>
                <p className="text-xs text-dim mt-1">Due in 12 days</p>
              </div>
              <ChevronRight size={20} className="text-dim" />
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="card p-12 text-center text-muted">
            <CheckCircle2 size={48} className="mx-auto mb-4 opacity-20" />
            <p>All reviews are up to date. No pending actions.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
