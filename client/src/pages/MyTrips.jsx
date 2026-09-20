import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import TripCard from '../components/UI/TripCard';
import { FilterDropdown, SortDropdown, GroupByDropdown } from '../components/UI/FilterDropdowns';
import api from '../api/axios';

export default function MyTrips() {
  const navigate = useNavigate();
  const [trips, setTrips]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('all');
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [sortBy, setSortBy]         = useState('date-desc');
  const [groupBy, setGroupBy]       = useState('status');

  useEffect(() => {
    api.get('/trips')
      .then(r => setTrips(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id) => setTrips(prev => prev.filter(t => t.id !== id));

  const filterTabs = ['all', 'ongoing', 'upcoming', 'completed'];

  // Combined filtering & sorting
  const processedTrips = useMemo(() => {
    let result = [...trips];

    // Status filter
    if (filter !== 'all') {
      result = result.filter(t => t.status === filter);
    }

    // Budget filter
    if (budgetFilter === 'under-3000') {
      result = result.filter(t => parseFloat(t.budget || 0) < 3000);
    } else if (budgetFilter === '3000-5000') {
      result = result.filter(t => parseFloat(t.budget || 0) >= 3000 && parseFloat(t.budget || 0) <= 5000);
    } else if (budgetFilter === 'over-5000') {
      result = result.filter(t => parseFloat(t.budget || 0) > 5000);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '');
      if (sortBy === 'budget-desc') return parseFloat(b.budget || 0) - parseFloat(a.budget || 0);
      if (sortBy === 'budget-asc') return parseFloat(a.budget || 0) - parseFloat(b.budget || 0);
      if (sortBy === 'spent-desc') return parseFloat(b.spent || 0) - parseFloat(a.spent || 0);
      if (sortBy === 'date-asc') return new Date(a.start_date || 0) - new Date(b.start_date || 0);
      // default: date-desc
      return new Date(b.start_date || 0) - new Date(a.start_date || 0);
    });

    return result;
  }, [trips, filter, budgetFilter, sortBy]);

  const sections = [
    { key: 'ongoing',   label: 'Ongoing Trips',   icon: '🟢', filterFn: t => t.status === 'ongoing' },
    { key: 'upcoming',  label: 'Upcoming Trips',   icon: '🔵', filterFn: t => t.status === 'upcoming' },
    { key: 'completed', label: 'Completed Trips',  icon: '⚫', filterFn: t => t.status === 'completed' },
  ];

  const hasCustomFilter = filter !== 'all' || budgetFilter !== 'all' || sortBy !== 'date-desc';

  return (
    <AppLayout
      headerProps={{
        searchPlaceholder: 'Search trips...',
        title: 'My Trips',
        showFilters: true,
        filter,
        onFilterChange: setFilter,
        budgetFilter,
        onBudgetFilterChange: setBudgetFilter,
        sortBy,
        onSortChange: setSortBy,
        groupBy,
        onGroupByChange: setGroupBy,
      }}
    >
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'var(--space-lg)',flexWrap:'wrap',gap:'var(--space-md)' }}>
          <div>
            <h1 style={{ fontFamily:'var(--font-heading)',fontSize:'1.8rem',fontWeight:800 }}>My Trips</h1>
            <p style={{ color:'var(--text-secondary)',marginTop:4 }}>
              Showing {processedTrips.length} of {trips.length} trip{trips.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/create-trip')}>
            + Plan New Trip
          </button>
        </div>

        {/* Filter Control Bar (Tabs + Dropdowns) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-md)', flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
          <div className="admin-tab-bar" style={{ maxWidth: 440, margin: 0 }}>
            {filterTabs.map(tab => (
              <button
                key={tab}
                className={`admin-tab ${filter === tab ? 'active' : ''}`}
                onClick={() => setFilter(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GroupByDropdown groupBy={groupBy} onGroupByChange={setGroupBy} />
            <FilterDropdown
              filter={filter}
              onFilterChange={setFilter}
              budgetFilter={budgetFilter}
              onBudgetFilterChange={setBudgetFilter}
            />
            <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasCustomFilter && (
          <div className="active-filters-row animate-fadeInUp">
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active filters:</span>
            {filter !== 'all' && (
              <span className="active-filter-badge">
                Status: {filter}
                <span className="active-filter-remove" onClick={() => setFilter('all')}>✕</span>
              </span>
            )}
            {budgetFilter !== 'all' && (
              <span className="active-filter-badge">
                Budget: {budgetFilter.replace('-', ' ')}
                <span className="active-filter-remove" onClick={() => setBudgetFilter('all')}>✕</span>
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
              onClick={() => {
                setFilter('all');
                setBudgetFilter('all');
                setSortBy('date-desc');
              }}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign:'center',padding:'var(--space-2xl)',color:'var(--text-muted)' }}>⏳ Loading trips...</div>
      ) : processedTrips.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🧳</div>
          <h3>No matching trips</h3>
          <p>Try changing or clearing your filter criteria.</p>
          <button
            className="btn btn-secondary"
            style={{ marginTop:'var(--space-md)' }}
            onClick={() => { setFilter('all'); setBudgetFilter('all'); }}
          >
            Reset Filters
          </button>
        </div>
      ) : groupBy === 'status' && filter === 'all' ? (
        sections.map(({ key, label, icon, filterFn }) => {
          const sectionTrips = processedTrips.filter(filterFn);
          if (sectionTrips.length === 0) return null;
          return (
            <div key={key} className="trips-section">
              <div className="trips-section-title">
                {icon} {label} ({sectionTrips.length})
              </div>
              <div className="trips-grid animate-stagger">
                {sectionTrips.map(t => <TripCard key={t.id} trip={t} onDelete={handleDelete} />)}
              </div>
            </div>
          );
        })
      ) : (
        <div className="trips-grid animate-stagger">
          {processedTrips.map(t => <TripCard key={t.id} trip={t} onDelete={handleDelete} />)}
        </div>
      )}
    </AppLayout>
  );
}
