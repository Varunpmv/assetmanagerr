import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, Bell, Shield, 
  Mail, MessageSquare, Database, Save, AlertCircle 
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, setUser } = useAuth();
  const [prefs, setPrefs] = useState({
    email: true,
    slack: true,
    inApp: true
  });
  const [config, setConfig] = useState({
    smtp_host: '',
    smtp_port: '',
    smtp_user: '',
    smtp_pass: '',
    slack_webhook_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setPrefs(user.notification_preferences || { email: true, slack: true, inApp: true });
    }
    if (user?.role === 'admin') {
      api.get('/notifications/config').then(res => setConfig(res.data));
    }
  }, [user]);

  const savePrefs = async () => {
    setLoading(true);
    try {
      const res = await api.patch('/notifications/preferences', { preferences: prefs });
      setUser({ ...user, notification_preferences: prefs });
      setMessage({ type: 'success', text: 'Preferences saved successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save preferences' });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setLoading(true);
    try {
      await api.post('/notifications/config', config);
      setMessage({ type: 'success', text: 'Infrastructure config saved' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save config' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h2 className="page-title">System Settings</h2>
        <p className="page-subtitle">Configure notification channels and security parameters.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="text-primary" size={20} />
            <h3 className="font-bold">Notification Preferences</h3>
          </div>

          <div className="space-y-4">
            <div className="flex-between p-4 rounded-lg bg-surface border border-border">
              <div>
                <p className="font-semibold text-sm">Email Alerts</p>
                <p className="text-xs text-muted">Receive monthly reports and urgent alerts via email.</p>
              </div>
              <input type="checkbox" checked={prefs.email} onChange={e => setPrefs({...prefs, email: e.target.checked})} />
            </div>

            <div className="flex-between p-4 rounded-lg bg-surface border border-border">
              <div>
                <p className="font-semibold text-sm">Slack Integration</p>
                <p className="text-xs text-muted">Get real-time certification alerts in your Slack channel.</p>
              </div>
              <input type="checkbox" checked={prefs.slack} onChange={e => setPrefs({...prefs, slack: e.target.checked})} />
            </div>

            <button className="btn btn-primary w-full" onClick={savePrefs} disabled={loading}>
               <Save size={18} /> {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>

        {user?.role === 'admin' && (
          <div className="card space-y-8">
            <div className="flex items-center gap-3 mb-2">
              <Database className="text-success" size={20} />
              <h3 className="font-bold">Infrastructure Config</h3>
            </div>

            <div className="space-y-4">
              <div className="input-group">
                <label className="input-label">SMTP Host</label>
                <input className="input-field" value={config.smtp_host} onChange={e => setConfig({...config, smtp_host: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="input-group">
                  <label className="input-label">SMTP Port</label>
                  <input className="input-field" value={config.smtp_port} onChange={e => setConfig({...config, smtp_port: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">SMTP User</label>
                  <input className="input-field" value={config.smtp_user} onChange={e => setConfig({...config, smtp_user: e.target.value})} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Slack Webhook URL</label>
                <input className="input-field" value={config.slack_webhook_url} onChange={e => setConfig({...config, slack_webhook_url: e.target.value})} />
              </div>

              <button className="btn btn-primary w-full" onClick={saveConfig} disabled={loading}>
                <Save size={18} /> Update Infrastructure
              </button>
            </div>
          </div>
        )}
      </div>

      {message.text && (
        <div className={`mt-8 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'} border`}>
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}
    </div>
  );
};

export default Settings;
