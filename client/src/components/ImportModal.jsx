import { useState } from 'react';
import { Upload, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';

const ImportModal = ({ isOpen, onClose, type, onComplete }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return setError('Please select a CSV file');
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const endpoint = type === 'employees' ? '/users/import' : '/assets/import';
      const res = await api.post(endpoint, formData);
      setResults(res.data.results);
      if (onComplete) onComplete();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="flex-between mb-8">
          <h2 className="text-xl font-bold">Import {type === 'employees' ? 'Employees' : 'Assets'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {!results ? (
          <div className="space-y-6">
            <div 
              style={{
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '3rem 2rem',
                textAlign: 'center',
                backgroundColor: 'rgba(255,255,255,0.02)',
                cursor: 'pointer'
              }}
              onClick={() => document.getElementById('file-upload').click()}
            >
              <input 
                id="file-upload" 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
              />
              <Upload size={48} className="text-primary mb-4" style={{ margin: '0 auto' }} />
              <p className="font-medium mb-1">{file ? file.name : 'Select CSV file to upload'}</p>
              <p className="text-sm text-dim">Max size 5MB. Must follow standard CSV template.</p>
            </div>

            {error && (
              <div className="flex gap-2 p-4 rounded-lg bg-danger/10 text-danger text-sm border border-danger/20">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-4">
              <button className="btn btn-secondary flex-1" onClick={onClose}>Cancel</button>
              <button 
                className="btn btn-primary flex-1" 
                onClick={handleUpload}
                disabled={loading || !file}
              >
                {loading ? 'Uploading...' : 'Upload & Process'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/20">
              <CheckCircle2 className="text-success" />
              <div>
                <p className="font-bold text-success">Import Processed</p>
                <p className="text-sm text-muted">Success: {results.success} | Failed: {results.failed}</p>
              </div>
            </div>

            {results.errors.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-bold text-danger">Errors ({results.errors.length})</p>
                <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  {results.errors.map((err, i) => (
                    <p key={i} className="text-xs text-muted mb-1">• {err}</p>
                  ))}
                </div>
              </div>
            )}

            <button className="btn btn-primary w-full" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportModal;
