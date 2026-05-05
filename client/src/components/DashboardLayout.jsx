import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, Shield, ClipboardCheck, 
  History, BarChart3, Settings, LogOut, Package,
  Building2, Key, Search, Bell
} from 'lucide-react';
import NotificationBell from './NotificationBell';

const DashboardLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Employees', path: '/employees', icon: Users },
    { name: 'Assets/Tools', path: '/assets', icon: Package },
    { name: 'Access Explorer', path: '/access-explorer', icon: Search },
    { name: 'Active Reviews', path: '/reviews', icon: ClipboardCheck },
    { name: 'Review History', path: '/review-history', icon: History },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  if (user?.role === 'admin') {
    navItems.push(
      { name: 'Departments', path: '/departments', icon: Building2 },
      { name: 'Access Types', path: '/access-types', icon: Key },
      { name: 'Audit Logs', path: '/activity-logs', icon: Shield },
    );
  }

  navItems.push({ name: 'Settings', path: '/settings', icon: Settings });

  return (
    <div className="app-layout">
      <aside className="sidebar" style={{ 
        width: '260px', 
        backgroundColor: 'var(--bg-surface)', 
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>AAM Portal</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>Asset Access Manager</p>
        </div>
        
        <nav style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
          <ul style={{ listStyle: 'none' }}>
            {navItems.map((item) => (
              <li key={item.path} style={{ marginBottom: '4px' }}>
                <NavLink 
                  to={item.path}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <item.icon size={18} />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary w-full">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      <main className="main-content" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 10 }}>
          <NotificationBell />
        </div>
        <Outlet />
      </main>

      <style>{`
        .sidebar { transition: all 0.3s ease; }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 500;
          transition: var(--transition);
        }
        .nav-link:hover {
          background-color: var(--bg-surface-hover);
          color: white;
        }
        .nav-link.active {
          background-color: var(--primary-light);
          color: var(--primary);
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
