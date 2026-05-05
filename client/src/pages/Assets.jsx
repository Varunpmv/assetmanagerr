import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  PackagePlus, Search, Upload, MoreVertical, 
  Shield, Globe, Key, AlertTriangle 
} from 'lucide-react';
import ImportModal from '../components/ImportModal';

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchAssets = async () => {
    try {
      const res = await api.get('/assets');
      setAssets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const getCriticalityStyle = (level) => {
    switch (level) {
      case 'Critical': return { color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' };
      case 'High': return { color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' };
      case 'Medium': return { color: '#6366f1', background: 'rgba(99, 102, 241, 0.1)' };
      default: return { color: '#94a3b8', background: 'rgba(148, 163, 184, 0.1)' };
    }
  };

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="flex-between mb-8">
        <div>
          <h2 className="page-title">Asset Inventory</h2>
          <p className="page-subtitle">Tracking critical tools, databases, and infrastructure components.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary" onClick={() => setIsImportModalOpen(true)}>
            <Upload size={18} />
            Bulk Import
          </button>
          <button className="btn btn-primary">
            <PackagePlus size={18} />
            Add Asset
          </button>
        </div>
      </div>

      <div className="card mb-6 p-4">
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input 
            type="text" 
            placeholder="Search by asset name, type or provider..." 
            className="input-field" 
            style={{ width: '100%', paddingLeft: '2.8rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map(asset => (
          <div key={asset.id} className="card flex-col">
            <div className="flex-between mb-4">
              <div style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '12px', 
                backgroundColor: 'rgba(255,255,255,0.03)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px solid var(--border)'
              }}>
                {asset.type === 'SaaS' ? <Globe size={22} className="text-primary" /> : <Shield size={22} className="text-success" />}
              </div>
              <span className="badge" style={getCriticalityStyle(asset.criticality)}>
                {asset.criticality}
              </span>
            </div>
            
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-1">{asset.name}</h3>
              <p className="text-xs text-muted font-medium uppercase tracking-widest">{asset.type} • {asset.provider}</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex-between text-sm">
                <span className="text-dim">Owner</span>
                <span className="font-medium text-main">{asset.owner?.name || 'Unassigned'}</span>
              </div>
              <div className="flex-between text-sm">
                <span className="text-dim">Sensitivity</span>
                <span className="font-medium" style={{ color: asset.data_sensitivity === 'Restricted' ? '#ef4444' : '#f8fafc' }}>{asset.data_sensitivity}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-border">
              <button className="btn btn-secondary flex-1 text-xs">Manage Access</button>
              <button className="btn btn-secondary" style={{ padding: '8px' }}><MoreVertical size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        type="assets"
        onComplete={fetchAssets}
      />
    </div>
  );
};

export default Assets;
