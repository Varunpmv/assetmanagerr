import { useState, useEffect } from 'react';
import api from '../api/axios';
import { UserPlus, Search, FileDown, MoreVertical, Trash2, Edit2, Upload } from 'lucide-react';
import ImportModal from '../components/ImportModal';

const Employees = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [uRes, dRes] = await Promise.all([api.get('/users'), api.get('/departments')]);
      setUsers(uRes.data);
      setDepartments(dRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="flex-between mb-8">
        <div>
          <h2 className="page-title">Employee Directory</h2>
          <p className="page-subtitle">Manage system users and their departmental associations.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary" onClick={() => setIsImportModalOpen(true)}>
            <Upload size={18} />
            Bulk Import
          </button>
          <button className="btn btn-primary">
            <UserPlus size={18} />
            Add Employee
          </button>
        </div>
      </div>

      <div className="card mb-6 p-4">
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input 
            type="text" 
            placeholder="Search by name, email or designation..." 
            className="input-field" 
            style={{ width: '100%', paddingLeft: '2.8rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Role</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{u.name}</p>
                      <p className="text-xs text-muted">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td><span className="text-sm">{u.dept?.name || 'Unassigned'}</span></td>
                <td><span className="text-sm font-mono uppercase tracking-wider" style={{ fontSize: '0.7rem' }}>{u.role}</span></td>
                <td><span className={`badge ${u.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>{u.status}</span></td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-secondary" style={{ padding: '6px' }}><MoreVertical size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="p-12 text-center text-muted">No employees found.</div>
        )}
      </div>

      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        type="employees"
        onComplete={fetchData}
      />
    </div>
  );
};

export default Employees;
