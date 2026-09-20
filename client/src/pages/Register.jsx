import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name:'', last_name:'', email:'', password:'',
    phone:'', city:'', country:'', bio:'',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [terms,   setTerms]   = useState(false);
  const [photo,   setPhoto]   = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handlePhoto  = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!terms) { setError('Please accept the Terms of Service.'); return; }
    setLoading(true); setError('');
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-screen" style={{ width: '100vw', height: '100vh', overflowY: 'auto' }}>
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand">
            <span className="auth-brand-icon">🌍</span>
            <span className="auth-brand-text">GlobeTrotter</span>
          </div>
          <p className="auth-tagline">Join thousands of travelers planning extraordinary journeys.</p>
          <div className="auth-features">
            {[['✈️','Create personalized multi-city itineraries'],
              ['🌟','Discover activities curated by real travelers'],
              ['📊','Visual budget tracking and breakdowns']].map(([icon,text]) => (
              <div className="auth-feature-item" key={text}>
                <div className="auth-feature-icon">{icon}</div>
                <span className="auth-feature-text">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card animate-fadeInUp" style={{ maxWidth: 480 }}>
          {/* Photo Upload */}
          <div className="auth-avatar-upload">
            <label htmlFor="reg-photo" className="avatar-upload-circle" style={{ cursor: 'pointer' }}>
              {photo
                ? <img src={photo} alt="avatar" style={{ width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%' }} />
                : <span>📷</span>}
            </label>
            <input id="reg-photo" type="file" accept="image/*" onChange={handlePhoto} style={{ display:'none' }} />
            <span className="avatar-upload-hint">Click to upload photo (optional)</span>
          </div>

          <h2 className="auth-card-title">Create Account</h2>
          <p className="auth-card-sub">Start your travel journey today</p>

          {error && (
            <div style={{ background:'rgba(244,63,94,0.1)',border:'1px solid rgba(244,63,94,0.3)',
              borderRadius:'var(--radius-md)',padding:'10px 14px',fontSize:'0.85rem',
              color:'var(--accent-rose)',marginBottom:'var(--space-md)' }}>
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:'var(--space-md)' }}>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input name="first_name" className="form-input" placeholder="First Name"
                  value={form.first_name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input name="last_name" className="form-input" placeholder="Last Name"
                  value={form.last_name} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" name="email" className="form-input" placeholder="Email Address"
                  value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input name="phone" className="form-input" placeholder="Phone Number"
                  value={form.phone} onChange={handleChange} />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">City</label>
                <input name="city" className="form-input" placeholder="City"
                  value={form.city} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input name="country" className="form-input" placeholder="Country"
                  value={form.country} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Additional Information</label>
              <textarea name="bio" className="form-textarea"
                placeholder="Tell us about yourself — travel style, dream destinations..."
                value={form.bio} onChange={handleChange} style={{ minHeight: 80 }} />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" name="password" className="form-input"
                placeholder="Create a password (6+ chars)" value={form.password}
                onChange={handleChange} required />
            </div>

            <label style={{ display:'flex',alignItems:'flex-start',gap:10,cursor:'pointer',
              fontSize:'0.82rem',color:'var(--text-secondary)' }}>
              <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)}
                style={{ marginTop:3,accentColor:'var(--accent-teal)' }} />
              I agree to the <span className="auth-link">Terms of Service</span> and{' '}
              <span className="auth-link">Privacy Policy</span>
            </label>

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading ? '⏳ Creating account...' : '🌍 Register Users'}
            </button>
          </form>

          <div style={{ textAlign:'center',marginTop:'var(--space-lg)',fontSize:'0.875rem',color:'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" className="auth-link"> Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
