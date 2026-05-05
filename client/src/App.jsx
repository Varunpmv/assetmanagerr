import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Assets from './pages/Assets';
import Reviews from './pages/Reviews';
import ReviewHistory from './pages/ReviewHistory';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ActivityLogs from './pages/ActivityLogs';
import Departments from './pages/Departments';
import AccessTypes from './pages/AccessTypes';
import AccessExplorer from './pages/AccessExplorer';
import ForcePasswordReset from './pages/ForcePasswordReset';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import { useAuth } from './context/AuthContext';
import './App.css';

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        
        <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="assets" element={<Assets />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="review-history" element={<ReviewHistory />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="activity-logs" element={<ActivityLogs />} />
          <Route path="departments" element={<Departments />} />
          <Route path="access-types" element={<AccessTypes />} />
          <Route path="access-explorer" element={<AccessExplorer />} />
        </Route>

        <Route path="/reset-password" element={
          <ProtectedRoute>
            <ForcePasswordReset />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
