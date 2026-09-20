import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user: authUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [trips, setTrips]     = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({});
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/profile').then(r => { setProfile(r.data); setForm(r.data); }),
      api.get('/trips').then(r => setTrips(r.data)),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/profile', {
        first_name: form.first_name, last_name: form.last_name,
        phone: form.phone, city: form.city, country: form.country, bio: form.bio,
      });
      setProfile(res.data);
      updateUser(res.data);
      setEditing(false);
      showToast('Profile updated! ✅');
    } catch { showToast('Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const prePlanned = trips.filter(t => t.status === 'upcoming');
  const previous   = trips.filter(t => t.status === 'completed');

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '';

  if (loading) return <AppLayout><div style={{ textAlign:'center',padding:'var(--space-3xl)',color:'var(--text-muted)' }}>⏳ Loading...</div></AppLayout>;

  const p = profile || authUser;

  return (
    <AppLayout headerProps={{ showFilters: false, title: 'Profile' }}>
      <div style={{ marginBottom:'var(--space-xl)' }}>
        <h1 style={{ fontFamily:'var(--font-heading)',fontSize:'1.8rem',fontWeight:800 }}>User Profile</h1>
      </div>

      {/* Profile Hero */}
      <div className="profile-hero">
        {/* Avatar */}
        <div style={{ position:'relative', flexShrink:0 }}>
          <div className="avatar avatar-2xl">
            {`${p?.first_name?.[0]||''}${p?.last_name?.[0]||''}`.toUpperCase()}
          </div>
          <button onClick={() => {}} style={{ position:'absolute',bottom:4,right:4,width:28,height:28,
            borderRadius:'50%',background:'var(--gradient-primary)',border:'2px solid var(--bg-secondary)',
            fontSize:'0.75rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
            📷
          </button>
        </div>

        {/* Info */}
        {editing ? (
          <div style={{ flex:1 }}>
            <div className="profile-info-grid">
              {[['first_name','First Name'],['last_name','Last Name'],
                ['phone','Phone'],['city','City'],['country','Country']].map(([key,label]) => (
                <div className="form-group" key={key}>
                  <label className="form-label">{label}</label>
                  <input name={key} className="form-input" value={form[key]||''} onChange={handleChange} />
                </div>
              ))}
            </div>
            <div className="form-group" style={{ marginTop:'var(--space-md)' }}>
              <label className="form-label">Bio</label>
              <textarea name="bio" className="form-textarea" value={form.bio||''} onChange={handleChange} style={{ minHeight:60 }} />
            </div>
            <div style={{ display:'flex',gap:'var(--space-sm)',marginTop:'var(--space-md)' }}>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? '⏳' : '💾'} Save Changes
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ flex:1 }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'var(--space-md)' }}>
              <div>
                <h2 style={{ fontFamily:'var(--font-heading)',fontSize:'1.5rem',fontWeight:800 }}>
                  {p?.first_name} {p?.last_name}
                </h2>
                <p style={{ color:'var(--text-secondary)',fontSize:'0.9rem',marginTop:2 }}>{p?.bio || 'No bio yet.'}</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
            </div>

            <div style={{ display:'flex',gap:'var(--space-xl)',flexWrap:'wrap' }}>
              <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                <span style={{ fontSize:'0.75rem',color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.05em' }}>
                  User Details with appropriate option to edit those information....
                </span>
              </div>
            </div>

            <div className="profile-info-grid" style={{ marginTop:'var(--space-lg)' }}>
              {[['📧 Email', p?.email], ['📞 Phone', p?.phone||'—'],
                ['🏙️ City', p?.city||'—'], ['🌍 Country', p?.country||'—'],
                ['🧳 Total Trips', p?.trips_count||trips.length],
                ['📅 Member Since', fmtDate(p?.created_at)]].map(([label,val]) => (
                <div className="profile-info-field" key={label}>
                  <label>{label}</label>
                  <span>{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preplanned Trips */}
      <div style={{ marginBottom:'var(--space-xl)' }}>
        <div className="section-heading">
          <h2>Preplanned Trips</h2>
          <a href="/trips" onClick={e=>{e.preventDefault();navigate('/trips')}}>View all →</a>
        </div>
        {prePlanned.length === 0 ? (
          <div style={{ color:'var(--text-muted)',fontSize:'0.9rem',padding:'var(--space-md)' }}>
            No upcoming trips yet.{' '}
            <button className="auth-link" style={{ background:'none',border:'none',cursor:'pointer' }}
              onClick={() => navigate('/create-trip')}>Plan one!</button>
          </div>
        ) : (
          <div style={{ display:'flex',gap:'var(--space-md)',flexWrap:'wrap' }}>
            {prePlanned.slice(0,3).map(t => (
              <div key={t.id} style={{ width:160,cursor:'pointer' }} onClick={() => navigate(`/trips/${t.id}`)}>
                <div style={{ height:100,borderRadius:'var(--radius-md)',background:t.gradient,
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2.5rem',
                  marginBottom:'var(--space-sm)' }}>{t.emoji}</div>
                <div style={{ fontSize:'0.85rem',fontWeight:600,textAlign:'center',
                  whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{t.name}</div>
                <button className="btn btn-secondary btn-sm w-full" style={{ marginTop:'var(--space-sm)' }}>View</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Previous Trips */}
      <div>
        <div className="section-heading">
          <h2>Previous Trips</h2>
        </div>
        {previous.length === 0 ? (
          <div style={{ color:'var(--text-muted)',fontSize:'0.9rem',padding:'var(--space-md)' }}>No completed trips yet.</div>
        ) : (
          <div style={{ display:'flex',gap:'var(--space-md)',flexWrap:'wrap' }}>
            {previous.slice(0,3).map(t => (
              <div key={t.id} style={{ width:160,cursor:'pointer' }} onClick={() => navigate(`/trips/${t.id}`)}>
                <div style={{ height:100,borderRadius:'var(--radius-md)',background:t.gradient,
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2.5rem',
                  marginBottom:'var(--space-sm)' }}>{t.emoji}</div>
                <div style={{ fontSize:'0.85rem',fontWeight:600,textAlign:'center',
                  whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{t.name}</div>
                <button className="btn btn-ghost btn-sm w-full" style={{ marginTop:'var(--space-sm)' }}>View</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function showToast(msg, type='success') {
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `<span>${type==='success'?'✅':'❌'}</span><span class="toast-text">${msg}</span>`;
  document.body.appendChild(t);
  setTimeout(()=>t.classList.add('show'),50);
  setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),300);},3000);
}
