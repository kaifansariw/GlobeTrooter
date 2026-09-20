import { useState, useEffect } from 'react';
import AppLayout from '../components/Layout/AppLayout';
import { PieChart, LineChart, BarChart } from '../components/UI/Charts';
import api from '../api/axios';

const TABS = ['Manage Users','Popular Cities','Popular Activities','User Trends'];

export default function Admin() {
  const [tab, setTab]     = useState(0);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats').then(r => setStats(r.data)),
      api.get('/admin/users').then(r => setUsers(r.data)),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const PIE_COLORS = ['#714B67', '#00A09D', '#F2994A', '#198754', '#875A7B', '#2C3E50'];
  const LINE_MONTHS = ['Aug','Sep','Oct','Nov','Dec','Jan'];

  return (
    <AppLayout headerProps={{ searchPlaceholder:'Search admin...', showFilters: true, title: 'Admin Dashboard' }}>
      <div style={{ marginBottom:'var(--space-xl)' }}>
        <h1 style={{ fontFamily:'var(--font-heading)',fontSize:'1.8rem',fontWeight:800 }}>Admin Panel</h1>
        <p style={{ color:'var(--text-secondary)',marginTop:4 }}>Platform analytics and management</p>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'var(--space-md)',marginBottom:'var(--space-xl)' }}>
          {[
            ['👥','Total Users',stats.total_users?.toLocaleString(),'badge-teal'],
            ['🧳','Total Trips',stats.total_trips?.toLocaleString(),'badge-violet'],
            ['🟢','Active Today',stats.active_today?.toLocaleString(),'badge-emerald'],
            ['⭐','Top Rated','4.8 / 5','badge-amber'],
          ].map(([icon,label,val,cls]) => (
            <div key={label} className="stat-card">
              <div style={{ fontSize:'1.5rem',marginBottom:'var(--space-sm)' }}>{icon}</div>
              <div className="stat-value">{val}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tab-bar">
        {TABS.map((t, i) => (
          <button key={t} className={`admin-tab ${tab===i?'active':''}`} onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center',padding:'var(--space-2xl)',color:'var(--text-muted)' }}>⏳ Loading admin data...</div>
      ) : (
        <>
          {/* Tab 0: Manage Users */}
          {tab === 0 && (
            <div className="budget-table-wrap">
              <table className="budget-table">
                <thead>
                  <tr>
                    <th>User</th><th>Email</th><th>City</th><th>Trips</th><th>Joined</th><th>Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display:'flex',alignItems:'center',gap:'var(--space-sm)' }}>
                          <div className="avatar" style={{ width:32,height:32,fontSize:'0.8rem',
                            background:'var(--odoo-primary)' }}>
                            {`${u.first_name?.[0]||''}${u.last_name?.[0]||''}`.toUpperCase()}
                          </div>
                          {u.first_name} {u.last_name}
                        </div>
                      </td>
                      <td style={{ color:'var(--text-secondary)' }}>{u.email}</td>
                      <td>{u.city||'—'}</td>
                      <td><span className="badge badge-teal">{u.trips_count}</span></td>
                      <td style={{ color:'var(--text-muted)',fontSize:'0.8rem' }}>
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('en-US',{month:'short',year:'numeric'}) : '—'}
                      </td>
                      <td>
                        {u.is_admin
                          ? <span className="badge badge-violet">Admin</span>
                          : <span className="badge badge-gray">User</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 1: Popular Cities */}
          {tab === 1 && (
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'var(--space-xl)' }}>
              <div className="budget-table-wrap">
                <table className="budget-table">
                  <thead><tr><th>City</th><th>Trips</th><th>Growth</th></tr></thead>
                  <tbody>
                    {(stats?.popular_cities||[]).map(c => (
                      <tr key={c.name}>
                        <td><span style={{ marginRight:6 }}>{c.emoji}</span>{c.name}</td>
                        <td style={{ fontWeight:600 }}>{parseInt(c.trips||0).toLocaleString()}</td>
                        <td><span className="badge badge-emerald">{c.growth||'+0%'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="chart-card">
                <div className="chart-card-title">City Popularity Distribution</div>
                <PieChart
                  data={(stats?.popular_cities||[]).slice(0,6).map(c => ({ label:c.name, value: parseInt(c.trips||1) }))}
                  colors={PIE_COLORS}
                  width={220} height={220}
                />
                <div style={{ display:'flex',flexDirection:'column',gap:4,marginTop:'var(--space-md)' }}>
                  {(stats?.popular_cities||[]).slice(0,6).map((c,i) => (
                    <div key={c.name} style={{ display:'flex',alignItems:'center',gap:8,fontSize:'0.78rem' }}>
                      <div style={{ width:10,height:10,borderRadius:3,background:PIE_COLORS[i],flexShrink:0 }} />
                      <span style={{ flex:1,color:'var(--text-secondary)' }}>{c.emoji} {c.name}</span>
                      <span style={{ fontWeight:600 }}>{c.trips}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Popular Activities */}
          {tab === 2 && (
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'var(--space-xl)' }}>
              <div className="budget-table-wrap">
                <table className="budget-table">
                  <thead><tr><th>Activity</th><th>Category</th><th>Bookings</th><th>Rating</th></tr></thead>
                  <tbody>
                    {(stats?.popular_activities||[]).map(a => (
                      <tr key={a.name}>
                        <td style={{ fontWeight:500 }}>{a.name}</td>
                        <td><span className="badge badge-teal">{a.category}</span></td>
                        <td style={{ fontWeight:600 }}>{parseInt(a.bookings||0).toLocaleString()}</td>
                        <td><span className="badge badge-amber">⭐ {a.rating}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="chart-card">
                <div className="chart-card-title">Activity Bookings</div>
                <BarChart
                  labels={(stats?.popular_activities||[]).slice(0,5).map(a => a.name.split(' ').slice(0,2).join(' '))}
                  values={(stats?.popular_activities||[]).slice(0,5).map(a => parseInt(a.bookings||1))}
                  colors={['#714B67','#00A09D','#F2994A','#198754','#875A7B']}
                  width={360} height={220}
                />
              </div>
            </div>
          )}

          {/* Tab 3: User Trends */}
          {tab === 3 && (
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'var(--space-xl)' }}>
              <div className="chart-card">
                <div className="chart-card-title">Trip Creation Trend (6 months)</div>
                <LineChart
                  labels={LINE_MONTHS}
                  datasets={[{ data:[12,19,8,25,34,28], color:'#714B67' }]}
                  width={380} height={220}
                />
              </div>
              <div className="chart-card">
                <div className="chart-card-title">New Users per Month</div>
                <BarChart
                  labels={LINE_MONTHS}
                  values={[340,420,380,510,680,750]}
                  colors={['#00A09D']}
                  width={380} height={220}
                />
              </div>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
