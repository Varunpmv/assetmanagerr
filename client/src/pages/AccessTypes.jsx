import { useState, useEffect } from 'react';
import { Plus, Search, Key, Edit2, Trash2, X } from 'lucide-react';
import api from '../api/axios';
import ConfirmModal from '../components/ConfirmModal';

const AccessTypes = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentType, setCurrentType] = useState({ name: '', description: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null, name: '' });

  const loadData = async () => {
    try {
      const res = await api.get('/access-types');
      setTypes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (modalMode === 'add') await api.post('/access-types', currentType);
      else await api.put(`/access-types/${currentType.id}`, currentType);
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/access-types/${confirmDelete.id}`);
      setConfirmDelete({ isOpen: false, id: null, name: '' });
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div className="p-8">Loading access types...</div>;

  return (
    <div className="fade-in">
      <div className="flex-between mb-8">
        <div>
          <h2 className="page-title">Access Types</h2>
          <p className="page-subtitle">Standardize permission levels for consistent auditing.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setModalMode('add'); setCurrentType({ name: '', description: '' }); setIsModalOpen(true); }}>
          <Plus size={18} /> Add Type
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Type Name</th>
              <th>Description</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {types.map(t => (
              <tr key={t.id}>
                <td style={{ fontWeight: 600 }} className="text-primary">{t.name}</td>
                <td className="text-sm text-muted">{t.description || 'No description provided.'}</td>
                <td style={{ textAlign: 'right' }}>
                  <div className="flex gap-2 justify-end">
                    <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={() => { setModalMode('edit'); setCurrentType(t); setIsModalOpen(true); }}><Edit2 size={14} /></button>
                    <button className="btn btn-secondary" style={{ padding: '6px', color: 'var(--danger)' }} onClick={() => setConfirmDelete({ isOpen: true, id: t.id, name: t.name })}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex-between mb-6">
              <h3 className="text-xl font-bold">{modalMode === 'add' ? 'Add Type' : 'Edit Type'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="input-group">
                <label className="input-label">Name *</label>
                <input className="input-field" value={currentType.name} onChange={e => setCurrentType({...currentType, name: e.target.value})} required />
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea className="input-field" value={currentType.description} onChange={e => setCurrentType({...currentType, description: e.target.value})} style={{ minHeight: '100px' }} />
              </div>
              <div className="flex gap-4">
                <button type="button" className="btn btn-secondary flex-1" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary flex-1" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
        onConfirm={handleDelete}
        title="Delete Access Type"
        message={`Delete "${confirmDelete.name}"?`}
      />
    </div>
  );
};

export default AccessTypes;
