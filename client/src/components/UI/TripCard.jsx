import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function TripCard({ trip, onDelete }) {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const statusMap = {
    completed: { label: 'Completed', cls: 'badge-gray' },
    ongoing:   { label: 'Ongoing',   cls: 'badge-teal' },
    upcoming:  { label: 'Upcoming',  cls: 'badge-violet' },
  };
  const status = statusMap[trip.status] || statusMap.upcoming;
  const days   = trip.start_date && trip.end_date
    ? Math.round((new Date(trip.end_date) - new Date(trip.start_date)) / 86400000)
    : 0;
  const pct    = trip.budget > 0 ? Math.min(100, Math.round((trip.spent / trip.budget) * 100)) : 0;

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  const fmtCur  = (n) => '$' + Number(n || 0).toLocaleString();
  const dests   = Array.isArray(trip.destinations) ? trip.destinations.join(', ') : '';

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setConfirmDelete(true);
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setConfirmDelete(false);
  };

  const handleConfirmDelete = async (e) => {
    e.stopPropagation();
    setDeleting(true);
    try {
      await api.delete(`/trips/${trip.id}`);
      showToast(`Deleted "${trip.name}" 🗑️`);
      onDelete?.(trip.id);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete trip.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const tripImage = trip.image_url || (
    trip.name?.toLowerCase().includes('paris') ? '/images/paris.jpg' :
    trip.name?.toLowerCase().includes('japan') || trip.name?.toLowerCase().includes('tokyo') ? '/images/japan.jpg' :
    trip.name?.toLowerCase().includes('nyc') || trip.name?.toLowerCase().includes('new york') ? '/images/nyc.jpg' :
    trip.name?.toLowerCase().includes('bali') ? '/images/bali.jpg' :
    trip.name?.toLowerCase().includes('barcelona') ? '/images/barcelona.jpg' :
    trip.name?.toLowerCase().includes('rome') ? '/images/rome.jpg' :
    '/images/default_trip.jpg'
  );

  return (
    <div
      className="trip-card"
      onClick={() => !confirmDelete && navigate(`/trips/${trip.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div className="trip-card-image">
        <img src={tripImage} alt={trip.name} className="trip-card-photo" />
        <div className="trip-card-badge">
          <span className={`badge ${status.cls}`}>{status.label}</span>
        </div>
      </div>

      <div className="trip-card-body">
        <div className="trip-card-title">{trip.name}</div>
        {dests && <div className="trip-card-meta"><span>📍 {dests}</span></div>}
        <div className="trip-card-meta" style={{ marginTop: 4 }}>
          {trip.start_date && <span>📅 {fmtDate(trip.start_date)}</span>}
          {days > 0 && <><span>•</span><span>🕐 {days} days</span></>}
          {trip.budget > 0 && <><span>•</span><span>💰 {fmtCur(trip.budget)}</span></>}
        </div>

        {trip.status !== 'upcoming' && trip.budget > 0 && (
          <div style={{ marginTop: 'var(--space-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              <span>Spent: {fmtCur(trip.spent)}</span>
              <span>{pct}%</span>
            </div>
            <div className="progress-bar-wrap">
              <div className="progress-bar-fill" style={{ width: `${pct}%` }}></div>
            </div>
          </div>
        )}
      </div>

      <div className="trip-card-actions">
        {confirmDelete ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--odoo-rose)', fontWeight: 600 }}>Delete?</span>
            <button
              className="btn btn-danger btn-sm"
              style={{ flex: 1 }}
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Yes, Delete'}
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleCancelDelete}
              disabled={deleting}
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <button
              className="btn btn-secondary btn-sm"
              onClick={(e) => { e.stopPropagation(); navigate(`/trips/${trip.id}`); }}
            >
              👁️ View
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={(e) => { e.stopPropagation(); navigate(`/trips/${trip.id}/builder`); }}
            >
              ✏️ Edit
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={handleDeleteClick}
              title="Delete trip"
            >
              🗑️
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast toast-success show';
  t.innerHTML = `<span class="toast-icon">🗑️</span><span class="toast-text">${msg}</span>`;
  document.body.appendChild(t);
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, 2500);
}
