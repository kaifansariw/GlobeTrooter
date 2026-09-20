import { useState, useRef, useEffect } from 'react';

/**
 * Odoo-style Filter, Sort, and Group By dropdown popovers
 */
export function FilterDropdown({ filter, onFilterChange, budgetFilter, onBudgetFilterChange, isHeader = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const hasActive = (filter && filter !== 'all') || (budgetFilter && budgetFilter !== 'all');

  return (
    <div className="filter-dropdown-container" ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        className={`filter-pill ${hasActive ? 'active' : ''}`}
        onClick={() => setOpen(!open)}
        title="Filter trips"
      >
        <span>⚡ Filter</span>
        {hasActive && <span className="filter-active-dot" />}
        <span style={{ fontSize: '0.65rem', opacity: 0.7, marginLeft: 2 }}>▼</span>
      </button>

      {open && (
        <div className="odoo-popover animate-fadeInUp">
          <div className="odoo-popover-header">Filter by Status</div>
          <div className="odoo-popover-item" onClick={() => { onFilterChange?.('all'); setOpen(false); }}>
            <span className="odoo-check">{filter === 'all' ? '✓' : ''}</span>
            <span>All Trips</span>
          </div>
          <div className="odoo-popover-item" onClick={() => { onFilterChange?.('ongoing'); setOpen(false); }}>
            <span className="odoo-check">{filter === 'ongoing' ? '✓' : ''}</span>
            <span>🟢 Ongoing</span>
          </div>
          <div className="odoo-popover-item" onClick={() => { onFilterChange?.('upcoming'); setOpen(false); }}>
            <span className="odoo-check">{filter === 'upcoming' ? '✓' : ''}</span>
            <span>🔵 Upcoming</span>
          </div>
          <div className="odoo-popover-item" onClick={() => { onFilterChange?.('completed'); setOpen(false); }}>
            <span className="odoo-check">{filter === 'completed' ? '✓' : ''}</span>
            <span>⚪ Completed</span>
          </div>

          {onBudgetFilterChange && (
            <>
              <div className="odoo-popover-divider" />
              <div className="odoo-popover-header">Filter by Budget</div>
              <div className="odoo-popover-item" onClick={() => { onBudgetFilterChange('all'); setOpen(false); }}>
                <span className="odoo-check">{(!budgetFilter || budgetFilter === 'all') ? '✓' : ''}</span>
                <span>Any Budget</span>
              </div>
              <div className="odoo-popover-item" onClick={() => { onBudgetFilterChange('under-3000'); setOpen(false); }}>
                <span className="odoo-check">{budgetFilter === 'under-3000' ? '✓' : ''}</span>
                <span>Under $3,000</span>
              </div>
              <div className="odoo-popover-item" onClick={() => { onBudgetFilterChange('3000-5000'); setOpen(false); }}>
                <span className="odoo-check">{budgetFilter === '3000-5000' ? '✓' : ''}</span>
                <span>$3,000 – $5,000</span>
              </div>
              <div className="odoo-popover-item" onClick={() => { onBudgetFilterChange('over-5000'); setOpen(false); }}>
                <span className="odoo-check">{budgetFilter === 'over-5000' ? '✓' : ''}</span>
                <span>Over $5,000</span>
              </div>
            </>
          )}

          {hasActive && (
            <>
              <div className="odoo-popover-divider" />
              <div
                className="odoo-popover-clear"
                onClick={() => {
                  onFilterChange?.('all');
                  onBudgetFilterChange?.('all');
                  setOpen(false);
                }}
              >
                ✕ Reset Filters
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function SortDropdown({ sortBy, onSortChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const sortOptions = [
    { key: 'date-desc', label: '📅 Date: Newest first' },
    { key: 'date-asc',  label: '📅 Date: Oldest first' },
    { key: 'name-asc',  label: '🔤 Name: A → Z' },
    { key: 'name-desc', label: '🔤 Name: Z → A' },
    { key: 'budget-desc', label: '💰 Budget: High → Low' },
    { key: 'budget-asc',  label: '💰 Budget: Low → High' },
    { key: 'spent-desc',  label: '💸 Spent: High → Low' },
  ];

  return (
    <div className="filter-dropdown-container" ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        className={`filter-pill ${sortBy && sortBy !== 'date-desc' ? 'active' : ''}`}
        onClick={() => setOpen(!open)}
        title="Sort trips"
      >
        <span>↕ Sort by...</span>
        <span style={{ fontSize: '0.65rem', opacity: 0.7, marginLeft: 2 }}>▼</span>
      </button>

      {open && (
        <div className="odoo-popover animate-fadeInUp">
          <div className="odoo-popover-header">Sort Options</div>
          {sortOptions.map((opt) => (
            <div
              key={opt.key}
              className="odoo-popover-item"
              onClick={() => {
                onSortChange?.(opt.key);
                setOpen(false);
              }}
            >
              <span className="odoo-check">{sortBy === opt.key ? '✓' : ''}</span>
              <span>{opt.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function GroupByDropdown({ groupBy, onGroupByChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const groupOptions = [
    { key: 'status', label: '🗂️ By Status (Ongoing, Upcoming, Completed)' },
    { key: 'none',   label: '📋 None (Flat View)' },
  ];

  return (
    <div className="filter-dropdown-container" ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        className={`filter-pill ${groupBy && groupBy !== 'status' ? 'active' : ''}`}
        onClick={() => setOpen(!open)}
        title="Group trips"
      >
        <span>⊞ Group by</span>
        <span style={{ fontSize: '0.65rem', opacity: 0.7, marginLeft: 2 }}>▼</span>
      </button>

      {open && (
        <div className="odoo-popover animate-fadeInUp">
          <div className="odoo-popover-header">Group By Options</div>
          {groupOptions.map((opt) => (
            <div
              key={opt.key}
              className="odoo-popover-item"
              onClick={() => {
                onGroupByChange?.(opt.key);
                setOpen(false);
              }}
            >
              <span className="odoo-check">{groupBy === opt.key ? '✓' : ''}</span>
              <span>{opt.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
