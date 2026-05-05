import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  Shield, Clock, User, HardDrive, 
  ChevronLeft, ChevronRight, Search, Activity
} from 'lucide-react';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  const fetchLogs = async (p) => {
    setLoading(true);
    try {
      const res = await api.get(`/activity-logs?page=${p}&limit=15`);
      setLogs(res.data.logs);
      setTotalPages(res.data.pages);
      setTotalLogs(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE': return 'var(--success)';
      case 'DELETE': return 'var(--danger)';
      case 'UPDATE': return 'var(--warning)';
      case 'LOGIN': return 'var(--primary)';
      default: return 'var(--text-muted)';
    }
  };

  if (loading && page === 1) return <div className="p-8">Fetching audit trail...</div>;

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h2 className="page-title">Immutable Audit Trail</h2>
        <p className="page-subtitle">Complete transparency of all system mutations and access events.</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Operator</th>
              <th>Action</th>
              <th>Target</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td><span className="text-xs text-muted font-mono">{new Date(log.createdAt).toLocaleString()}</span></td>
                <td>
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-dim" />
                    <span className="text-sm font-medium">{log.User?.name || 'System'}</span>
                  </div>
                </td>
                <td>
                  <span className="text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: `${getActionColor(log.action)}15`, color: getActionColor(log.action), border: `1px solid ${getActionColor(log.action)}30` }}>
                    {log.action}
                  </span>
                </td>
                <td><span className="text-sm font-mono text-dim">{log.target_type} ({log.target_id || 'Global'})</span></td>
                <td><span className="text-xs text-muted">{log.ip_address}</span></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-4 border-t border-border flex-between bg-surface/50">
          <p className="text-xs text-muted">Showing page {page} of {totalPages} ({totalLogs} total events)</p>
          <div className="flex gap-2">
            <button className="btn btn-secondary" style={{ padding: '6px 12px' }} disabled={page === 1} onClick={() => setPage(page-1)}>
              <ChevronLeft size={16} />
            </button>
            <button className="btn btn-secondary" style={{ padding: '6px 12px' }} disabled={page === totalPages} onClick={() => setPage(page+1)}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
