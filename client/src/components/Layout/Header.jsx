import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FilterDropdown, SortDropdown, GroupByDropdown } from '../UI/FilterDropdowns';

export default function Header({
  searchPlaceholder = 'Search destinations, trips...',
  showSearch = true,
  showFilters = true,
  title = '',
  filter = 'all',
  onFilterChange,
  budgetFilter = 'all',
  onBudgetFilterChange,
  sortBy = 'date-desc',
  onSortChange,
  groupBy = 'status',
  onGroupByChange,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
    : 'U';

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  const toggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    sidebar?.classList.toggle('mobile-open');
  };

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <button className="header-icon-btn" onClick={toggleSidebar} title="Toggle Sidebar">
          <span>☰</span>
        </button>
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem', fontWeight: 600 }}>
            <span style={{ opacity: 0.7 }}>GlobeTrotter</span>
            <span style={{ opacity: 0.5 }}>/</span>
            <span style={{ color: '#FFFFFF' }}>{title}</span>
          </div>
        )}
      </div>

      {showSearch && (
        <div className="header-search-wrap">
          <span className="header-search-icon">🔍</span>
          <input
            type="text"
            className="header-search"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      )}

      {showFilters && (
        <div className="header-filter-group">
          <GroupByDropdown groupBy={groupBy} onGroupByChange={onGroupByChange} />
          <FilterDropdown
            filter={filter}
            onFilterChange={onFilterChange}
            budgetFilter={budgetFilter}
            onBudgetFilterChange={onBudgetFilterChange}
            isHeader
          />
          <SortDropdown sortBy={sortBy} onSortChange={onSortChange} />
        </div>
      )}

      <div className="header-actions">
        <button className="header-icon-btn" title="Notifications"
          onClick={() => showToast('No new notifications 🔔')}>
          🔔
        </button>
        <div className="header-user" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          <div className="avatar" style={{ background: 'var(--odoo-primary)', border: '2px solid rgba(255,255,255,0.4)' }}>
            {initials}
          </div>
          <div>
            <div className="header-user-name">{user?.first_name ?? 'User'}</div>
            <div className="header-user-role">Traveler</div>
          </div>
        </div>
      </div>
    </header>
  );
}

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast toast-success';
  t.innerHTML = `<span class="toast-icon">🔔</span><span class="toast-text">${msg}</span>`;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 50);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
}
