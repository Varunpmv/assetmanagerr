import { useState, useEffect } from 'react';
import { Plus, Search, Shield, Edit2, Trash2, X } from 'lucide-react';
import api from '../api/axios';
import ConfirmModal from '../components/ConfirmModal';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentDept, setCurrentDept] = useState({ name: '', head_id: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null, name: '' });
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'danger' });

  const loadData = async () => {
    try {
      const [deptRes, userRes] = await Promise.all([
        api.get('/departments'),
        api.get('/users')
      ]);
      setDepartments(deptRes.data);
      setUsers(userRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.head?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (mode, dept = null) => {
    setModalMode(mode);
    if (dept) {
      setCurrentDept({ id: dept.id, name: dept.name, head_id: dept.head_id || '' });
    } else {
      setCurrentDept({ name: '', head_id: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (modalMode === 'add') {
        await api.post('/departments', currentDept);
      } else {
        await api.put(`/departments/${currentDept.id}`, currentDept);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setAlertConfig({
        isOpen: true,
        title: 'Error Saving',
        message: err.response?.data?.error || 'Failed to save department data.',
        type: 'danger'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteConfirm = (dept) => {
    setConfirmDelete({ isOpen: true, id: dept.id, name: dept.name });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/departments/${confirmDelete.id}`);
      setConfirmDelete({ isOpen: false, id: null, name: '' });
      loadData();
    } catch (err) {
      setAlertConfig({
        isOpen: true,
        title: 'Deletion Failed',
        message: err.response?.data?.error || 'Could not delete department. It may have linked assets.',
        type: 'danger'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div className="p-8">Loading departments...</div>;

  return (
    <div className="fade-in">
      <div className="flex-between mb-8">
        <div>
          <h2 className="page-title">Departments</h2>
          <p className="page-subtitle">Define organizational units and assign reviewers.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal('add')}>
          <Plus size={18} /> Add Department
        </button>
      </div>

      <div className="card mb-6 p-4">
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Search by name or head..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Department Name</th>
              <th>Head / Reviewer</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepts.map(dept => (
              <tr key={dept.id}>
                <td style={{ fontWeight: 600 }}>{dept.name}</td>
                <td>
                  {dept.head ? (
                    <div className="flex items-center gap-2">
                      <Shield size={14} className="text-primary" />
                      <span className="text-sm">{dept.head.name} ({dept.head.email})</span>
                    </div>
                  ) : <span className="text-danger text-sm">No Head Assigned</span>}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="flex gap-2 justify-end">
                    <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={() => handleOpenModal('edit', dept)}><Edit2 size={14} /></button>
                    <button className="btn btn-secondary" style={{ padding: '6px', color: 'var(--danger)' }} onClick={() => openDeleteConfirm(dept)}><Trash2 size={14} /></button>
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
              <h3 className="text-xl font-bold">{modalMode === 'add' ? 'Add Department' : 'Edit Department'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="input-group">
                <label className="input-label">Department Name *</label>
                <input className="input-field" value={currentDept.name} onChange={e => setCurrentDept({...currentDept, name: e.target.value})} required />
              </div>
              <div className="input-group">
                <label className="input-label">Head User</label>
                <select className="input-field" value={currentDept.head_id} onChange={e => setCurrentDept({...currentDept, head_id: e.target.value})}>
                  <option value="">Unassigned</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                </select>
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
        title="Delete Department"
        message={`Delete "${confirmDelete.name}"?`}
      />
    </div>
  );
};

export default Departments;
