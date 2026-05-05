import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  Users, Package, ClipboardCheck, History, 
  TrendingUp, AlertCircle, ShieldCheck, Search 
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalAssets: 0,
    pendingReviews: 0,
    expiringSoon: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, assets, reviews, expiring] = await Promise.all([
          api.get('/users'),
          api.get('/assets'),
          api.get('/reviews'),
          api.get('/assets/expiring')
        ]);
        setStats({
          totalEmployees: users.data.length,
          totalAssets: assets.data.length,
          pendingReviews: reviews.data.filter(r => r.review_status === 'pending').length,
          expiringSoon: expiring.data.length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { name: 'Total Employees', value: stats.totalEmployees, icon: Users, color: 'var(--primary)' },
    { name: 'Managed Assets', value: stats.totalAssets, icon: Package, color: '#10b981' },
    { name: 'Pending Reviews', value: stats.pendingReviews, icon: ClipboardCheck, color: '#f59e0b' },
    { name: 'Expiring Assets', value: stats.expiringSoon, icon: AlertCircle, color: '#ef4444' },
  ];

  if (loading) return <div className="p-8">Loading dashboard metrics...</div>;

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h2 className="page-title">Operational Overview</h2>
        <p className="page-subtitle">Real-time metrics for asset distribution and security compliance.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="card flex-col gap-2">
            <div className="flex-between">
              <div style={{ 
                padding: '10px', 
                borderRadius: '12px', 
                backgroundColor: `${stat.color}15`, 
                color: stat.color 
              }}>
                <stat.icon size={24} />
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>+4% vs mo</span>
            </div>
            <div className="mt-2">
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted font-medium uppercase tracking-wider mt-1">{stat.name}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <ShieldCheck size={20} className="text-primary" />
            Compliance Status
          </h3>
          <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border)', borderRadius: '12px' }}>
             <p className="text-muted text-sm">Security review cycles are current.</p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-success" />
            Quick Actions
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-surface hover:bg-surface-hover cursor-pointer transition border border-border" onClick={() => window.location.href='/assets'}>
              <p className="font-semibold text-sm">Audit Tool Access</p>
              <p className="text-xs text-muted">Review who has access to sensitive tools</p>
            </div>
            <div className="p-4 rounded-lg bg-surface hover:bg-surface-hover cursor-pointer transition border border-border" onClick={() => window.location.href='/reviews'}>
              <p className="font-semibold text-sm">Conduct Monthly Review</p>
              <p className="text-xs text-muted">5 pending reviews for IT Operations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
