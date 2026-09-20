import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import { PieChart } from '../components/UI/Charts';
import api from '../api/axios';

export default function ItineraryView() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [trip, setTrip]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/trips/${id}`)
      .then(r => setTrip(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '';
  const fmtCur  = (n) => '$' + Number(n||0).toLocaleString();

  if (loading) return <AppLayout><div style={{ textAlign:'center',padding:'var(--space-3xl)',color:'var(--text-muted)' }}>⏳ Loading trip...</div></AppLayout>;
  if (!trip) return <AppLayout><div className="empty-state"><div className="empty-icon">😕</div><h3>Trip not found</h3></div></AppLayout>;

  const totalCost = trip.stops?.reduce((sum, stop) =>
    sum + (stop.activities?.reduce((as, a) => as + parseFloat(a.cost||0), 0) || 0), 0) || 0;

  const budgetPieData = [
    { label: 'Activities', value: totalCost * 0.45 },
    { label: 'Stay',       value: totalCost * 0.30 },
    { label: 'Food',       value: totalCost * 0.15 },
    { label: 'Transport',  value: totalCost * 0.10 },
  ].filter(d => d.value > 0);

  const pieColors = ['#714B67', '#00A09D', '#F2994A', '#198754'];

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteTrip = async () => {
    setDeleting(true);
    try {
      await api.delete(`/trips/${id}`);
      navigate('/trips');
    } catch {
      alert('Failed to delete trip.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <AppLayout headerProps={{ showFilters: false }}>
      {/* Trip Header */}
      <div style={{ background: trip.gradient || 'var(--gradient-primary)', borderRadius: 'var(--radius-md)',
        padding: 'var(--space-2xl)', marginBottom: 'var(--space-xl)', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.35) 0%, transparent 60%)' }} />
        <div style={{ position:'relative',zIndex:1,display:'flex',alignItems:'flex-end',justifyContent:'space-between',flexWrap:'wrap',gap:'var(--space-md)' }}>
          <div>
            <div style={{ fontSize:'3.5rem',marginBottom:'var(--space-sm)' }}>{trip.emoji||'✈️'}</div>
            <h1 style={{ fontFamily:'var(--font-heading)',fontSize:'2rem',fontWeight:800,color:'#fff' }}>{trip.name}</h1>
            <p style={{ color:'rgba(255,255,255,.7)',marginTop:4 }}>{trip.description}</p>
            <div style={{ display:'flex',gap:'var(--space-md)',marginTop:'var(--space-md)',flexWrap:'wrap' }}>
              <span className={`badge ${statusMap[trip.status]||'badge-teal'}`}>{trip.status}</span>
              <span style={{ color:'rgba(255,255,255,.7)',fontSize:'0.85rem' }}>📅 {fmtDate(trip.start_date)} → {fmtDate(trip.end_date)}</span>
              {trip.budget>0 && <span style={{ color:'rgba(255,255,255,.7)',fontSize:'0.85rem' }}>💰 Budget: {fmtCur(trip.budget)}</span>}
            </div>
          </div>
          <div style={{ display:'flex',gap:'var(--space-sm)',alignItems:'center' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/trips/${id}/builder`)}>✏️ Edit</button>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/calendar')}>📅 Calendar</button>
            {confirmDelete ? (
              <div style={{ display:'flex',alignItems:'center',gap:'6px',background:'rgba(0,0,0,0.4)',padding:'4px 8px',borderRadius:'var(--radius-sm)' }}>
                <span style={{ color:'#fff',fontSize:'0.8rem',fontWeight:600 }}>Sure?</span>
                <button className="btn btn-danger btn-sm" onClick={handleDeleteTrip} disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setConfirmDelete(false)}>Cancel</button>
              </div>
            ) : (
              <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>🗑️ Delete</button>
            )}
          </div>
        </div>
      </div>

      {/* Budget + Pie */}
      {totalCost > 0 && (
        <div style={{ display:'grid',gridTemplateColumns:'1fr 240px',gap:'var(--space-xl)',marginBottom:'var(--space-xl)' }}>
          <div className="budget-table-wrap">
            <table className="budget-table">
              <thead>
                <tr>
                  <th>Category</th><th>Estimated Cost</th><th>% of Total</th>
                </tr>
              </thead>
              <tbody>
                {[['Activities','45'],['Accommodation','30'],['Food & Dining','15'],['Transport','10']].map(([cat,pct]) => (
                  <tr key={cat}>
                    <td>{cat}</td>
                    <td style={{ color:'var(--accent-teal)',fontWeight:600 }}>{fmtCur(totalCost*(parseInt(pct)/100))}</td>
                    <td><span className="badge badge-teal">{pct}%</span></td>
                  </tr>
                ))}
                <tr>
                  <td style={{ fontWeight:700 }}>Total</td>
                  <td style={{ color:'var(--accent-emerald)',fontWeight:700 }}>{fmtCur(totalCost)}</td>
                  <td><span className="badge badge-emerald">100%</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="chart-card" style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:'var(--space-md)' }}>
            <div className="chart-card-title">Budget Split</div>
            {budgetPieData.length > 0 && <PieChart data={budgetPieData} colors={pieColors} width={180} height={180} />}
            <div style={{ display:'flex',flexDirection:'column',gap:4,width:'100%' }}>
              {budgetPieData.map((d,i) => (
                <div key={d.label} style={{ display:'flex',alignItems:'center',gap:8,fontSize:'0.78rem' }}>
                  <div style={{ width:10,height:10,borderRadius:3,background:pieColors[i],flexShrink:0 }} />
                  <span style={{ flex:1,color:'var(--text-secondary)' }}>{d.label}</span>
                  <span style={{ fontWeight:600 }}>{fmtCur(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Day-by-Day Itinerary */}
      <h2 style={{ fontFamily:'var(--font-heading)',fontSize:'1.3rem',fontWeight:700,marginBottom:'var(--space-lg)' }}>
        Itinerary for {trip.name}
      </h2>

      {(!trip.stops || trip.stops.length === 0) ? (
        <div className="empty-state">
          <div className="empty-icon">📍</div>
          <h3>No stops planned yet</h3>
          <button className="btn btn-primary" style={{ marginTop:'var(--space-lg)' }}
            onClick={() => navigate(`/trips/${id}/builder`)}>+ Build Itinerary</button>
        </div>
      ) : (
        trip.stops.map((stop, si) => {
          const dayGroups = {};
          (stop.activities || []).forEach(a => {
            const day = a.day_number || 1;
            if (!dayGroups[day]) dayGroups[day] = [];
            dayGroups[day].push(a);
          });
          const days = Object.keys(dayGroups).sort((a,b) => +a - +b);

          return (
            <div key={stop.id} style={{ marginBottom:'var(--space-xl)' }}>
              <div style={{ display:'flex',alignItems:'center',gap:'var(--space-md)',marginBottom:'var(--space-md)' }}>
                <div style={{ background:'var(--gradient-primary)',borderRadius:'var(--radius-md)',
                  padding:'6px 16px',fontWeight:700,fontSize:'0.9rem' }}>
                  📍 {stop.city}
                </div>
                <span style={{ color:'var(--text-muted)',fontSize:'0.85rem' }}>
                  {fmtDate(stop.start_date)} → {fmtDate(stop.end_date)}
                </span>
              </div>

              {days.length === 0 ? (
                <div className="day-block">
                  <div className="day-block-header">
                    <span className="day-block-title">Day 1</span>
                  </div>
                  <div className="activity-table">
                    <div className="activity-table-header">
                      <span>Physical Activity</span><span>Time</span><span>Expense</span>
                    </div>
                    <div style={{ padding:'var(--space-lg)',textAlign:'center',color:'var(--text-muted)',fontSize:'0.85rem' }}>
                      No activities yet — <button className="auth-link" style={{ background:'none',border:'none',cursor:'pointer' }}
                        onClick={() => navigate('/search')}>browse activities</button>
                    </div>
                  </div>
                </div>
              ) : (
                days.map(day => (
                  <div key={day} className="day-block" style={{ marginBottom:'var(--space-md)' }}>
                    <div className="day-block-header">
                      <span className="day-block-title">Day {day}</span>
                      <span className="day-block-date">
                        {stop.start_date && (() => {
                          const d = new Date(stop.start_date);
                          d.setDate(d.getDate() + parseInt(day) - 1);
                          return fmtDate(d.toISOString());
                        })()}
                      </span>
                    </div>
                    <div className="activity-table">
                      <div className="activity-table-header">
                        <span>Physical Activity</span><span>Time</span><span>Expense</span>
                      </div>
                      {dayGroups[day].map((act, ai) => (
                        <div key={ai}>
                          <div className="activity-row">
                            <div className="activity-row-name">
                              <span>{act.emoji||'📌'}</span>{act.name}
                            </div>
                            <div className="activity-row-time">🕐 {act.scheduled_time||'--:--'}</div>
                            <div className="activity-row-cost">{fmtCur(act.cost)}</div>
                          </div>
                          {ai < dayGroups[day].length - 1 && (
                            <div className="activity-connector">↓</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        })
      )}
    </AppLayout>
  );
}
