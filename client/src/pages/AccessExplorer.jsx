import { useState, useEffect, useRef } from 'react';
import { Search, Download, ChevronDown, Check, X } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const SearchableSelect = ({ label, value, options, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  const selectedOption = options.find(opt => opt.id === value);

  const filteredOptions = options.filter(opt => 
    opt.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      <label className="input-label" style={{ marginBottom: '0.5rem', display: 'block' }}>{label}</label>
      <div 
        className="input-field" 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          cursor: 'pointer',
          paddingRight: '0.75rem'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ color: selectedOption ? 'white' : 'var(--text-muted)' }}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown size={16} className="text-dim" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
      </div>

      {isOpen && (
        <>
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '8px',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            zIndex: 100,
            padding: '8px',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ position: 'relative', marginBottom: '8px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input 
                autoFocus
                type="text"
                placeholder="Type to search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '8px 8px 8px 30px',
                  color: 'white',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <div 
                style={{ padding: '0.65rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                onClick={() => { onChange(''); setIsOpen(false); setSearch(''); }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                All Tools (Reset)
              </div>
              {filteredOptions.map(opt => (
                <div 
                  key={opt.id}
                  style={{ 
                    padding: '0.65rem 0.75rem', 
                    borderRadius: '6px', 
                    cursor: 'pointer', 
                    fontSize: '0.85rem',
                    backgroundColor: value === opt.id ? 'var(--primary-light)' : 'transparent',
                    color: value === opt.id ? 'var(--primary)' : 'white'
                  }}
                  onClick={() => { onChange(opt.id); setIsOpen(false); setSearch(''); }}
                  onMouseEnter={(e) => { if (value !== opt.id) e.currentTarget.style.backgroundColor = 'var(--bg-surface)'; }}
                  onMouseLeave={(e) => { if (value !== opt.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {opt.name}
                </div>
              ))}
              {filteredOptions.length === 0 && (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No tools found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const AccessExplorer = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [assetFilter, setAssetFilter] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [accessRes, assetRes] = await Promise.all([
        api.get('/access/explorer'),
        api.get('/assets')
      ]);
      setRecords(accessRes.data || []);
      setAssets(assetRes.data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error(err);
      setError('Failed to load access records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredRecords = records.filter(rec => {
    const matchesEmployee = 
      (rec.User?.name || '').toLowerCase().includes(employeeSearch.toLowerCase()) ||
      (rec.User?.email || '').toLowerCase().includes(employeeSearch.toLowerCase());
    const matchesAssetDropdown = assetFilter === '' || rec.asset_id === assetFilter;
    return matchesEmployee && matchesAssetDropdown;
  });

  const handleExport = () => {
    const headers = ['Tool Name', 'Employee Name', 'Email', 'Access Type', 'Date Granted'];
    const rows = filteredRecords.map(rec => [
      rec.Asset?.name,
      rec.User?.name,
      rec.User?.email,
      rec.AccessType?.name || rec.access_level,
      new Date(rec.updatedAt).toLocaleDateString()
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tool_Access_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (loading) return <div className="fade-in" style={{ padding: '2rem', textAlign: 'center' }}>Loading access explorer...</div>;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 className="page-title">Tool Access Explorer</h2>
          <p className="page-subtitle">View a consolidated list of who has access to which tools across the organization.</p>
        </div>
        <button className="btn btn-secondary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={18} />
          Export Report
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <label className="input-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Search Employee</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                className="input-field"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
              />
            </div>
          </div>
          <SearchableSelect 
            label="Search & Select Tool"
            value={assetFilter}
            options={assets}
            onChange={setAssetFilter}
            placeholder="Select a tool..."
          />
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Tool Name</th>
              <th>Employee Name</th>
              <th>Email</th>
              <th>Access Type</th>
              <th>Date Granted</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((rec) => (
              <tr key={`${rec.asset_id}-${rec.user_id}`}>
                <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{rec.Asset?.name}</td>
                <td><div style={{ fontWeight: 500 }}>{rec.User?.name}</div></td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{rec.User?.email}</td>
                <td><span className="badge badge-blue">{rec.AccessType?.name || rec.access_level}</span></td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(rec.updatedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRecords.length === 0 && (
          <div className="p-12 text-center text-muted">No access records found matching your filters.</div>
        )}
      </div>
    </div>
  );
};

export default AccessExplorer;
