import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
      const removed = notifications.find(n => n.id === id);
      if (removed && !removed.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle size={16} className="text-primary" />;
      case 'WARNING': return <AlertTriangle size={16} style={{ color: '#FBBF24' }} />;
      case 'DANGER': return <XCircle size={16} style={{ color: '#EF4444' }} />;
      default: return <Info size={16} className="text-secondary" />;
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'var(--text-muted)', 
          cursor: 'pointer',
          position: 'relative',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          transition: 'background 0.2s'
        }}
        className="hover-bg"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            background: 'var(--danger)',
            color: 'white',
            borderRadius: '50%',
            width: '16px',
            height: '16px',
            fontSize: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            border: '2px solid var(--bg-surface)'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '10px',
          width: '320px',
          maxHeight: '400px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }} className="fade-in">
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Notifications</h4>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '0.85rem' }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id} 
                  style={{ 
                    padding: '12px 16px', 
                    borderBottom: '1px solid var(--border)',
                    backgroundColor: notif.is_read ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                    display: 'flex',
                    gap: '12px',
                    position: 'relative',
                    transition: 'background 0.2s'
                  }}
                  className="hover-bg"
                >
                  <div style={{ marginTop: '2px' }}>
                    {getTypeIcon(notif.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '2px', color: notif.is_read ? 'var(--text-muted)' : 'white' }}>
                      {notif.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                      {notif.message}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                      {new Date(notif.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {!notif.is_read && (
                      <button 
                        onClick={() => markAsRead(notif.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '2px' }}
                        title="Mark as read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notif.id)}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', padding: '2px' }}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      <style>{`.hover-bg:hover { background-color: rgba(255,255,255,0.03) !important; }`}</style>
    </div>
  );
};

export default NotificationBell;
