import React, { useState } from 'react';
import api from '../api/axios';

const ForcePasswordReset = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/update-password', { newPassword });
      window.location.href = '/'; 
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080c14' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '2rem', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Set New Password</h2>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label">New Password</label>
            <input type="password" className="input-field" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
          </div>
          <div className="input-group">
            <label className="input-label">Confirm New Password</label>
            <input type="password" className="input-field" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</button>
        </form>
      </div>
    </div>
  );
};

export default ForcePasswordReset;
