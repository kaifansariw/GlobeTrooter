import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ email: 'alex@globetrotter.app', password: 'password123' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [showPw, setShowPw]   = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-screen" style={{ width: '100vw', height: '100vh' }}>
      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand">
            <span className="auth-brand-icon">🌍</span>
            <span className="auth-brand-text">GlobeTrotter</span>
          </div>
          <p className="auth-tagline">
            Plan your dream trips, discover hidden gems, and share unforgettable journeys with the world.
          </p>
          <div className="auth-features">
            {[
              ['🗺️', 'Build multi-city itineraries with ease'],
              ['💰', 'Track budgets and cost breakdowns'],
              ['📅', 'Visual calendar and timeline views'],
              ['🌐', 'Share trips with friends & community'],
            ].map(([icon, text]) => (
              <div className="auth-feature-item" key={text}>
                <div className="auth-feature-icon">{icon}</div>
                <span className="auth-feature-text">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-card animate-fadeInUp">
          <div className="auth-avatar-upload">
            <div className="avatar-upload-circle"><span>📷</span></div>
            <span className="avatar-upload-hint">Profile Photo</span>
          </div>

          <h2 className="auth-card-title">Welcome back</h2>
          <p className="auth-card-sub">Sign in to continue your adventures</p>

          {error && (
            <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
              borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '0.85rem',
              color: 'var(--accent-rose)', marginBottom: 'var(--space-md)' }}>
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input type="email" name="email" className="form-input"
                placeholder="Enter your email" value={form.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} name="password" className="form-input"
                  placeholder="Enter your password" value={form.password}
                  onChange={handleChange} required style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', opacity: 0.5 }}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent-teal)' }} />
                Remember me
              </label>
              <button type="button" className="auth-link" style={{ background: 'none', border: 'none',
                fontSize: '0.85rem', cursor: 'pointer' }}>
                Forgot password?
              </button>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full"
              disabled={loading} style={{ marginTop: 'var(--space-sm)' }}>
              {loading ? '⏳ Signing in...' : '🚀 Login'}
            </button>
          </form>

          <div className="auth-divider">or</div>

          <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link"> Sign up for free</Link>
          </div>

          <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)',
            background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)',
            borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            🔑 Demo: <strong>alex@globetrotter.app</strong> / <strong>password123</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
