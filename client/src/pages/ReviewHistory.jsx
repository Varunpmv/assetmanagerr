import { useState, useEffect } from 'react';
import api from '../api/axios';
import { History, Download, Calendar, Filter, User } from 'lucide-react';

const ReviewHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/reviews');
        setHistory(res.data.filter(r => r.review_status === 'completed'));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="p-8">Loading audit history...</div>;

  return (
    <div className="fade-in">
      <div className="flex-between mb-8">
        <div>
          <h2 className="page-title">Review History</h2>
          <p className="page-subtitle">Historical records of access certifications and revocations.</p>
        </div>
        <button className="btn btn-secondary">
          <Download size={18} />
          Export Audit Trail
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Period</th>
              <th>Reviewer</th>
              <th>Completed On</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {history.map(h => (
              <tr key={h.id}>
                <td><span className="font-semibold text-sm">{h.Asset?.name}</span></td>
                <td><span className="text-xs text-muted flex items-center gap-1"><Calendar size={12}/> {new Date(h.review_month).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span></td>
                <td><span className="text-sm">{h.reviewer?.name || 'Automated'}</span></td>
                <td><span className="text-sm">{new Date(h.updatedAt).toLocaleDateString()}</span></td>
                <td><span className="badge badge-active">Completed</span></td>
                <td style={{ textAlign: 'right' }}>
                  <button className="text-primary text-xs font-bold hover:underline">View Report</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {history.length === 0 && (
          <div className="p-12 text-center text-muted">No historical reviews found.</div>
        )}
      </div>
    </div>
  );
};

export default ReviewHistory;
