import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import api from '../api/axios';

const GRADIENTS = [
  'linear-gradient(135deg,#714B67,#875A7B)',
  'linear-gradient(135deg,#00A09D,#017E84)',
  'linear-gradient(135deg,#2C3E50,#4CA1AF)',
  'linear-gradient(135deg,#F2994A,#F2C94C)',
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#198754,#20C997)',
];
const DEST_IMAGES = {
  tokyo: '/images/tokyo.jpg',
  paris: '/images/paris.jpg',
  bali: '/images/bali.jpg',
  'new york': '/images/nyc.jpg',
  nyc: '/images/nyc.jpg',
  dubai: '/images/dubai.jpg',
  rome: '/images/rome.jpg',
  santorini: '/images/santorini.jpg',
  barcelona: '/images/barcelona.jpg',
  kyoto: '/images/japan.jpg',
  marrakech: '/images/marrakech.jpg',
  sydney: '/images/sydney.jpg',
  bangkok: '/images/bangkok.jpg',
};
const getDestImage = (name) => DEST_IMAGES[name?.toLowerCase()] || '/images/default_trip.jpg';

const EMOJIS = ['✈️','🗺️','🧳','🏔️','🏖️','⛩️','🗼','🌴','🗽','🏙️'];

export default function CreateTrip() {
  const navigate  = useNavigate();
  const [form, setForm]       = useState({
    name:'', description:'', start_date:'', end_date:'',
    emoji:'✈️', gradient: GRADIENTS[0], budget:'',
  });
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selGrad, setSelGrad] = useState(0);

  useEffect(() => {
    api.get('/destinations?limit=6').then(r => setSuggestions(r.data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleGradient = (i) => {
    setSelGrad(i);
    setForm(f => ({ ...f, gradient: GRADIENTS[i] }));
  };

  const handleSuggestionClick = (dest) => {
    setForm(f => ({ ...f, name: f.name || `${dest.name} Adventure` }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { setError('Trip name is required.'); return; }
    setSubmitting(true); setError('');
    try {
      const res = await api.post('/trips', {
        ...form,
        budget: form.budget ? parseFloat(form.budget) : 0,
      });
      navigate(`/trips/${res.data.id}/builder`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create trip.');
    } finally { setSubmitting(false); }
  };

  return (
    <AppLayout headerProps={{ showFilters: false, title: 'Plan a Trip' }}>
      <div style={{ marginBottom:'var(--space-xl)' }}>
        <h1 style={{ fontFamily:'var(--font-heading)',fontSize:'1.8rem',fontWeight:800 }}>Create a New Trip</h1>
        <p style={{ color:'var(--text-secondary)',marginTop:4 }}>Plan your next adventure</p>
      </div>

      <div className="create-trip-layout">
        {/* Form */}
        <div className="create-trip-form-card">
          <div style={{ display:'flex',alignItems:'center',gap:'var(--space-sm)',marginBottom:'var(--space-lg)' }}>
            <span style={{ fontSize:'1.5rem' }}>🌍</span>
            <h3 style={{ fontFamily:'var(--font-heading)',fontSize:'1.1rem' }}>Plan a new Trip</h3>
          </div>

          {error && (
            <div style={{ background:'rgba(244,63,94,0.1)',border:'1px solid rgba(244,63,94,0.3)',
              borderRadius:'var(--radius-md)',padding:'10px 14px',fontSize:'0.85rem',
              color:'var(--accent-rose)',marginBottom:'var(--space-md)' }}>❌ {error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label">Trip Name</label>
              <input name="name" className="form-input" placeholder="e.g. Japan Adventure 2024"
                value={form.name} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-textarea" style={{ minHeight:70 }}
                placeholder="Describe your trip..." value={form.description} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Start Date:</label>
              <input type="date" name="start_date" className="form-input"
                value={form.start_date} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Select a Place :</label>
              <input name="place" className="form-input" placeholder="Main destination city"
                onChange={() => {}} />
            </div>

            <div className="form-group">
              <label className="form-label">Start Date:</label>
              <input type="date" name="start_date" className="form-input"
                value={form.start_date} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">End Date:</label>
              <input type="date" name="end_date" className="form-input"
                value={form.end_date} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Budget (USD)</label>
              <input type="number" name="budget" className="form-input" placeholder="e.g. 3000"
                value={form.budget} onChange={handleChange} min="0" />
            </div>

            {/* Emoji picker */}
            <div className="form-group">
              <label className="form-label">Trip Icon</label>
              <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
                {EMOJIS.map(e => (
                  <button key={e} type="button"
                    onClick={() => setForm(f => ({ ...f, emoji: e }))}
                    style={{ padding:'6px 10px',borderRadius:'var(--radius-md)',border:'1px solid',
                      borderColor: form.emoji === e ? 'var(--accent-teal)' : 'var(--border-card)',
                      background: form.emoji === e ? 'var(--accent-teal-glow)' : 'transparent',
                      fontSize:'1.2rem',cursor:'pointer' }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Gradient picker */}
            <div className="form-group">
              <label className="form-label">Cover Color</label>
              <div style={{ display:'flex',gap:8 }}>
                {GRADIENTS.map((g,i) => (
                  <button key={i} type="button" onClick={() => handleGradient(i)}
                    style={{ width:36,height:36,borderRadius:'var(--radius-md)',background:g,
                      border: selGrad===i ? '3px solid var(--accent-teal)' : '3px solid transparent',
                      cursor:'pointer',transition:'all 0.2s' }} />
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={submitting}
              style={{ marginTop:'var(--space-sm)' }}>
              {submitting ? '⏳ Creating...' : '🚀 Create Trip & Build Itinerary →'}
            </button>
          </form>
        </div>

        {/* Suggestions */}
        <div className="create-trip-suggestions">
          <h3>Suggestion for Places to Visit / Activities to Perform</h3>
          <div className="suggestions-grid">
            {suggestions.map(d => (
              <div key={d.id} className="suggestion-card" onClick={() => handleSuggestionClick(d)}>
                <div className="suggestion-card-img-wrap">
                  <img src={d.image_url || getDestImage(d.name)} alt={d.name} className="suggestion-card-photo" />
                </div>
                <div className="suggestion-card-info">
                  <div className="suggestion-card-name">{d.name}</div>
                  <div className="suggestion-card-country">{d.country} · {d.cost_index} cost</div>
                </div>
              </div>
            ))}
          </div>

          {/* Preview card */}
          <div style={{ marginTop:'var(--space-xl)' }}>
            <h3 style={{ marginBottom:'var(--space-md)' }}>Trip Preview</h3>
            <div style={{ borderRadius:'var(--radius-xl)',overflow:'hidden',
              border:'1px solid var(--border-card)' }}>
              <div style={{ height:140,background:form.gradient,display:'flex',
                alignItems:'center',justifyContent:'center',fontSize:'4rem' }}>
                {form.emoji}
              </div>
              <div style={{ padding:'var(--space-md)',background:'var(--bg-card)' }}>
                <div style={{ fontWeight:700,fontSize:'1rem' }}>{form.name || 'Your Trip Name'}</div>
                <div style={{ fontSize:'0.8rem',color:'var(--text-muted)',marginTop:4 }}>
                  {form.start_date && form.end_date
                    ? `${new Date(form.start_date).toLocaleDateString()} → ${new Date(form.end_date).toLocaleDateString()}`
                    : 'Set dates to see preview'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
