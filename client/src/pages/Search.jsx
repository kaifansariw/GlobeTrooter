import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import api from '../api/axios';

const CATEGORIES = ['All','Sightseeing','Culture','Food','Adventure','Nature','Entertainment','Leisure'];

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

export default function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tab, setTab]         = useState('activities'); // 'activities' | 'cities'
  const [query, setQuery]     = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState('All');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const doSearch = async (q = query, cat = category) => {
    setLoading(true);
    try {
      const endpoint = tab === 'activities' ? '/activities' : '/destinations';
      const params   = { q, limit: 20 };
      if (cat !== 'All' && tab === 'activities') params.category = cat;
      if (cat !== 'All' && tab === 'cities') params.category = cat;
      const res = await api.get(endpoint, { params });
      setResults(res.data);
    } catch { setResults([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { doSearch(); }, [tab]);
  useEffect(() => {
    const timer = setTimeout(() => doSearch(), 300);
    return () => clearTimeout(timer);
  }, [query, category]);

  const handleAddToTrip = () => {
    showToast('Navigate to Create Trip to add this to your itinerary 🗺️');
  };

  return (
    <AppLayout headerProps={{ showSearch: false, showFilters: true, title: 'Explore' }}>
      {/* Page Header */}
      <div className="search-page-header">
        <div style={{ display:'flex',alignItems:'center',gap:'var(--space-md)',marginBottom:'var(--space-lg)' }}>
          <h1 style={{ fontFamily:'var(--font-heading)',fontSize:'1.8rem',fontWeight:800 }}>Explore</h1>
        </div>

        {/* Tab Toggle */}
        <div style={{ display:'flex',gap:'var(--space-sm)',marginBottom:'var(--space-lg)' }}>
          {['activities','cities'].map(t => (
            <button key={t} className={`btn ${tab===t?'btn-primary':'btn-secondary'}`}
              onClick={() => { setTab(t); setResults([]); }}>
              {t === 'activities' ? '🎯 Activities' : '🏙️ Cities'}
            </button>
          ))}
        </div>

        <div style={{ position:'relative',marginBottom:'var(--space-md)' }}>
          <span style={{ position:'absolute',left:20,top:'50%',transform:'translateY(-50%)',fontSize:'1.2rem',opacity:.5 }}>🔍</span>
          <input
            type="text"
            className="search-input-large"
            placeholder={tab === 'activities' ? 'Search bar ....' : 'Search cities, countries...'}
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: 54 }}
            autoFocus
          />
        </div>

        {/* Category filters */}
        {tab === 'activities' && (
          <div className="filter-bar">
            {CATEGORIES.map(cat => (
              <button key={cat}
                className={`filter-pill ${category===cat?'active':''}`}
                onClick={() => setCategory(cat)}>
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div style={{ marginTop:'var(--space-lg)' }}>
        <div style={{ fontSize:'0.85rem',color:'var(--text-muted)',marginBottom:'var(--space-md)' }}>
          {loading ? 'Searching...' : `${results.length} result${results.length!==1?'s':''} found`}
        </div>

        {loading && (
          <div style={{ textAlign:'center',padding:'var(--space-2xl)',color:'var(--text-muted)' }}>
            ⏳ Searching...
          </div>
        )}

        {!loading && results.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No results found</h3>
            <p>Try a different search term or category</p>
          </div>
        )}

        <div className="search-results-list">
          {tab === 'activities' ? (
            results.map(act => (
              <div key={act.id} className="activity-result-card">
                <div className="activity-result-icon">{act.emoji||'📌'}</div>
                <div className="activity-result-info">
                  <div className="activity-result-name">{act.name}</div>
                  <div className="activity-result-meta">
                    <span>📍 {act.city}</span>
                    <span>🏷️ {act.category}</span>
                    <span>🕐 {act.duration}</span>
                    <span>⭐ {act.rating}</span>
                  </div>
                </div>
                <div className="activity-result-price">${parseFloat(act.cost||0).toLocaleString()}</div>
                <div style={{ display:'flex',flexDirection:'column',gap:'var(--space-xs)' }}>
                  <button className="btn btn-primary btn-sm" onClick={handleAddToTrip}>+ Add to Trip</button>
                  <button className="btn btn-ghost btn-sm">Learn more</button>
                </div>
              </div>
            ))
          ) : (
            results.map(dest => (
              <div key={dest.id} className="activity-result-card">
                <img
                  src={dest.image_url || getDestImage(dest.name)}
                  alt={dest.name}
                  style={{ width: 64, height: 64, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }}
                />
                <div className="activity-result-info">
                  <div className="activity-result-name">{dest.name}</div>
                  <div className="activity-result-meta">
                    <span>🌍 {dest.country}</span>
                    <span>📂 {dest.category}</span>
                    <span>💰 {dest.cost_index} cost</span>
                    <span>🔥 {dest.popularity}/100</span>
                  </div>
                  <p style={{ fontSize:'0.82rem',color:'var(--text-muted)',marginTop:4 }}>{dest.description}</p>
                </div>
                <div style={{ display:'flex',flexDirection:'column',gap:'var(--space-xs)' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate(`/create-trip`)}>+ Add to Trip</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast toast-success';
  t.innerHTML = `<span>🗺️</span><span class="toast-text">${msg}</span>`;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 50);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
}
