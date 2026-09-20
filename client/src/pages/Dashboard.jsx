import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import TripCard from '../components/UI/TripCard';
import { FilterDropdown, SortDropdown, GroupByDropdown } from '../components/UI/FilterDropdowns';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

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

const DEST_FALLBACK = [
  { id:1, name:'Tokyo',     country:'Japan',     image_url:'/images/tokyo.jpg' },
  { id:2, name:'Paris',     country:'France',    image_url:'/images/paris.jpg' },
  { id:3, name:'New York',  country:'USA',       image_url:'/images/nyc.jpg' },
  { id:4, name:'Rome',      country:'Italy',     image_url:'/images/rome.jpg' },
  { id:5, name:'Bali',      country:'Indonesia', image_url:'/images/bali.jpg' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips]       = useState([]);
  const [dests, setDests]       = useState(DEST_FALLBACK);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');
  const [sortBy, setSortBy]     = useState('date-desc');
  const [groupBy, setGroupBy]   = useState('status');
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/trips').then(r => setTrips(r.data)).catch(() => {}),
      api.get('/destinations?limit=5').then(r => setDests(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const handleDelete = (id) => setTrips(prev => prev.filter(t => t.id !== id));

  // Filter & Sort Destinations
  const filteredDests = useMemo(() => {
    let result = dests.filter(d =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.country.toLowerCase().includes(search.toLowerCase())
    );
    if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }
    return result;
  }, [dests, search, sortBy]);

  // Filter & Sort Trips
  const processedTrips = useMemo(() => {
    let result = [...trips];
    if (filter !== 'all') {
      result = result.filter(t => t.status === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.name?.toLowerCase().includes(q) ||
        (t.destinations || []).some(d => d.toLowerCase().includes(q))
      );
    }
    result.sort((a, b) => {
      if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '');
      if (sortBy === 'budget-desc') return parseFloat(b.budget || 0) - parseFloat(a.budget || 0);
      if (sortBy === 'budget-asc') return parseFloat(a.budget || 0) - parseFloat(b.budget || 0);
      if (sortBy === 'spent-desc') return parseFloat(b.spent || 0) - parseFloat(a.spent || 0);
      if (sortBy === 'date-asc') return new Date(a.start_date || 0) - new Date(b.start_date || 0);
      return new Date(b.start_date || 0) - new Date(a.start_date || 0);
    });
    return result;
  }, [trips, filter, search, sortBy]);

  const recentTrips = processedTrips.slice(0, 3);
  const tripsCount  = trips.length;
  const countries   = [...new Set(trips.flatMap(t => t.destinations || []))].length;

  return (
    <AppLayout headerProps={{ showSearch: false, showFilters: false, title: 'Dashboard' }}>

      {/* Search + Filter Bar */}
      <div style={{ display:'flex',gap:'var(--space-md)',marginBottom:'var(--space-xl)',alignItems:'center',flexWrap:'wrap' }}>
        <div style={{ flex:1, position:'relative', minWidth: 260 }}>
          <span style={{ position:'absolute',left:18,top:'50%',transform:'translateY(-50%)',fontSize:'1.1rem',opacity:.5 }}>🔍</span>
          <input
            type="text"
            className="search-input-large"
            placeholder="Search destinations, trips..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 50 }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GroupByDropdown groupBy={groupBy} onGroupByChange={setGroupBy} />
          <FilterDropdown filter={filter} onFilterChange={setFilter} />
          <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
        </div>
      </div>

      {/* Active filter chips if applied */}
      {(filter !== 'all' || sortBy !== 'date-desc') && (
        <div className="active-filters-row animate-fadeInUp">
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active filters:</span>
          {filter !== 'all' && (
            <span className="active-filter-badge">
              Status: {filter}
              <span className="active-filter-remove" onClick={() => setFilter('all')}>✕</span>
            </span>
          )}
          {sortBy !== 'date-desc' && (
            <span className="active-filter-badge">
              Sorted: {sortBy.replace('-', ' ')}
              <span className="active-filter-remove" onClick={() => setSortBy('date-desc')}>✕</span>
            </span>
          )}
          <button
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.75rem', padding: '2px 8px' }}
            onClick={() => { setFilter('all'); setSortBy('date-desc'); }}
          >
            Clear
          </button>
        </div>
      )}

      {/* Top Regional Selections */}
      <div className="section-heading">
        <h2>Top Regional Selections</h2>
        <a href="/search" onClick={e => { e.preventDefault(); navigate('/search'); }}>View all →</a>
      </div>
      <div className="destinations-grid animate-stagger" style={{ marginBottom:'var(--space-xl)' }}>
        {filteredDests.map(d => (
          <div key={d.id} className="dest-card" onClick={() => navigate(`/search?q=${d.name}`)}>
            <div className="dest-card-img-wrap">
              <img src={d.image_url || getDestImage(d.name)} alt={d.name} className="dest-card-photo" />
            </div>
            <div className="dest-card-name">{d.name}</div>
            <div className="dest-card-country">{d.country}</div>
          </div>
        ))}
      </div>

      {/* Previous Trips */}
      <div className="section-heading">
        <h2>Previous Trips</h2>
        <a href="/trips" onClick={e => { e.preventDefault(); navigate('/trips'); }}>View all →</a>
      </div>

      {loading ? (
        <div style={{ textAlign:'center',padding:'var(--space-2xl)',color:'var(--text-muted)' }}>
          ⏳ Loading trips...
        </div>
      ) : recentTrips.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🧳</div>
          <h3>No trips yet</h3>
          <p>Start planning your first adventure!</p>
          <button className="btn btn-primary" style={{ marginTop:'var(--space-lg)' }}
            onClick={() => navigate('/create-trip')}>
            + Plan a Trip
          </button>
        </div>
      ) : (
        <div className="trips-grid animate-stagger">
          {recentTrips.map(t => (
            <TripCard key={t.id} trip={t} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* FAB */}
      <button className="fab fab-extended" onClick={() => navigate('/create-trip')}>
        <span>+</span> Plan a trip
      </button>
    </AppLayout>
  );
}
