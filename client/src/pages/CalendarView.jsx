import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import api from '../api/axios';

const WEEKDAYS = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

const TRIP_COLORS = ['trip-event-paris','trip-event-nyc','trip-event-japan'];

export default function CalendarView() {
  const navigate = useNavigate();
  const [trips, setTrips]   = useState([]);
  const [curDate, setCurDate] = useState(new Date(2024, 0, 1));

  useEffect(() => {
    api.get('/trips').then(r => setTrips(r.data)).catch(() => {});
  }, []);

  const year  = curDate.getFullYear();
  const month = curDate.getMonth();
  const monthName = curDate.toLocaleString('default', { month:'long' });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const today = new Date();

  const prevMonth = () => setCurDate(new Date(year, month-1, 1));
  const nextMonth = () => setCurDate(new Date(year, month+1, 1));

  // Get trips that overlap this month
  const monthTrips = trips
    .filter(t => t.start_date && t.end_date)
    .map((t, i) => ({
      ...t,
      startD: new Date(t.start_date),
      endD:   new Date(t.end_date),
      colorCls: TRIP_COLORS[i % TRIP_COLORS.length],
    }))
    .filter(t => {
      const monthStart = new Date(year, month, 1);
      const monthEnd   = new Date(year, month+1, 0);
      return t.startD <= monthEnd && t.endD >= monthStart;
    });

  const getTripsForDay = (day) => {
    const d = new Date(year, month, day);
    return monthTrips.filter(t => d >= t.startD && d <= t.endD);
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: null });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });

  return (
    <AppLayout headerProps={{ showSearch: false, showFilters: false, title: 'Calendar' }}>
      <div style={{ marginBottom:'var(--space-xl)' }}>
        <h1 style={{ fontFamily:'var(--font-heading)',fontSize:'1.8rem',fontWeight:800 }}>Calendar View</h1>
        <p style={{ color:'var(--text-secondary)',marginTop:4 }}>Visualize your trip timeline</p>
      </div>

      <div className="calendar-wrap">
        {/* Calendar Header */}
        <div className="calendar-header">
          <button className="calendar-nav-btn" onClick={prevMonth}>←</button>
          <div className="calendar-title">{monthName} {year}</div>
          <button className="calendar-nav-btn" onClick={nextMonth}>→</button>
        </div>

        <div className="calendar-grid">
          {/* Weekday labels */}
          <div className="calendar-weekdays">
            {WEEKDAYS.map(d => (
              <div key={d} className="calendar-weekday">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="calendar-days">
            {cells.map((cell, i) => {
              if (!cell.day) return <div key={`e-${i}`} />;
              const dayTrips = getTripsForDay(cell.day);
              const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === cell.day;
              return (
                <div
                  key={cell.day}
                  className={`calendar-day ${isToday ? 'today' : ''} ${dayTrips.length > 0 ? 'has-trip' : ''}`}
                  style={{ flexDirection:'column', alignItems:'center', padding:'4px 2px', minHeight: 56 }}
                >
                  <span style={{ fontSize:'0.8rem', fontWeight: dayTrips.length > 0 ? 700 : 400 }}>
                    {cell.day}
                  </span>
                  {dayTrips.slice(0,2).map(t => (
                    <div key={t.id} className={`trip-event-label ${t.colorCls}`}
                      onClick={() => navigate(`/trips/${t.id}`)}
                      style={{ cursor:'pointer', marginTop: 2, fontSize:'0.6rem', maxWidth:'95%' }}
                      title={t.name}>
                      {t.emoji} {t.name.toUpperCase().slice(0,12)}
                    </div>
                  ))}
                  {dayTrips.length > 2 && (
                    <div style={{ fontSize:'0.6rem',color:'var(--text-muted)' }}>+{dayTrips.length-2}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="calendar-legend">
          {monthTrips.map((t, i) => (
            <div key={t.id} className="legend-item">
              <div className={`legend-dot ${t.colorCls}`} />
              <span>{t.emoji} {t.name}</span>
            </div>
          ))}
          {monthTrips.length === 0 && (
            <span style={{ color:'var(--text-muted)',fontSize:'0.85rem' }}>
              No trips this month.{' '}
              <button className="auth-link" style={{ background:'none',border:'none',cursor:'pointer' }}
                onClick={() => navigate('/create-trip')}>Plan one!</button>
            </span>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
