import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        .login-wrapper {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #080c14;
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Ambient background orbs */
        .login-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 15% 15%, rgba(26, 61, 176, 0.15) 0%, transparent 40%),
                      radial-gradient(circle at 85% 85%, rgba(37, 99, 235, 0.1) 0%, transparent 40%);
          z-index: 0;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 1;
          opacity: 0.4;
        }
        .orb-1 { width: 400px; height: 400px; background: #1e3a8a; top: -100px; left: -100px; animation: float 12s infinite alternate; }
        .orb-2 { width: 300px; height: 300px; background: #1d4ed8; bottom: -50px; right: -50px; animation: float 15s infinite alternate-reverse; }
        .orb-3 { width: 250px; height: 250px; background: #3b82f6; top: 40%; left: 60%; animation: float 10s infinite ease-in-out; }

        @keyframes float {
          from { transform: translate(0, 0); }
          to   { transform: translate(30px, 40px); }
        }

        .login-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 440px;
          padding: 2.5rem;
          background: rgba(10, 15, 35, 0.82);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 20px;
          box-shadow:
            0 30px 60px rgba(0, 0, 0, 0.6),
            0 0 0 1px rgba(26, 61, 176, 0.15) inset,
            0 1px 0 rgba(255, 255, 255, 0.08) inset;
          animation: cardIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }

        .logo-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2rem;
        }

        .logo-container {
          width: 88px;
          height: 88px;
          background: #fff;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.1rem;
          box-shadow: 0 4px 24px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.08);
          animation: logoPop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
          flex-shrink: 0;
        }

        .logo-img {
          width: 72px;
          height: 72px;
          object-fit: contain;
        }

        @keyframes logoPop {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }

        .app-name {
          font-size: 1.55rem;
          font-weight: 800;
          letter-spacing: -0.025em;
          text-align: center;
          line-height: 1.2;
          color: #94a3b8;
        }

        .app-name span {
          color: #ffffff;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .app-subtitle {
          font-size: 0.8rem;
          color: rgba(148, 163, 184, 0.7);
          margin-top: 0.35rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-align: center;
        }

        .divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent);
          margin: 0 0 1.75rem;
        }

        .field-group {
          margin-bottom: 1.25rem;
        }

        .field-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(148, 163, 184, 0.8);
          margin-bottom: 0.5rem;
        }

        .field-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: #f1f5f9;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }

        .field-input:focus {
          border-color: rgba(37, 99, 235, 0.7);
          background: rgba(37, 99, 235, 0.06);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }

        .signin-btn {
          width: 100%;
          margin-top: 1.5rem;
          padding: 0.9rem;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #1a3db0 0%, #2563eb 60%, #3b82f6 100%);
          color: white;
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 24px rgba(37, 99, 235, 0.4);
        }

        .error-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.3);
          border-radius: 8px;
          color: #fca5a5;
          font-size: 0.82rem;
          margin-bottom: 1rem;
        }

        .footer-text {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.72rem;
          color: rgba(100, 116, 139, 0.6);
          letter-spacing: 0.03em;
        }
      `}</style>

      <div className="login-wrapper">
        <div className="login-bg" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="login-card">
          <div className="logo-section">
            <div className="logo-container">
              <img src="/riskcovry-logo.png" alt="Riskcovry Logo" className="logo-img" />
            </div>
            <div className="app-name">
              <span>Riskcovry</span> Asset Manager
            </div>
            <div className="app-subtitle">Secure Access Portal</div>
          </div>

          <div className="divider" />

          {error && (
            <div className="error-box">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label className="field-label">Email Address</label>
              <input
                type="email"
                className="field-input"
                placeholder="you@riskcovry.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label">Password</label>
              <input
                type="password"
                className="field-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="signin-btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <div className="footer-text">
            © 2026 Riskcovry · Internal Tool · All rights reserved
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
