import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import api from '../api/axios';

export default function ItineraryBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip]         = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    api.get(`/trips/${id}`)
      .then(r => {
        setTrip(r.data);
        setSections(r.data.stops?.map(s => ({
          id: s.id,
          city: s.city,
          desc: s.description || 'All the necessary information about this section. This can be anything like travel section, hotel or any other activity',
          startDate: s.start_date ? s.start_date.slice(0,10) : '',
          endDate: s.end_date ? s.end_date.slice(0,10) : '',
          budget: s.budget || '',
          isNew: false,
        })) || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const totalBudget = sections.reduce((sum, s) => sum + (parseFloat(s.budget) || 0), 0);

  const addSection = () => {
    setSections(prev => [...prev, {
      id: `new-${Date.now()}`,
      city: '',
      desc: 'All the necessary information about this section. This can be anything like travel section, hotel or any other activity',
      startDate: '', endDate: '', budget: '', isNew: true,
    }]);
  };

  const removeSection = (idx) => {
    setSections(prev => prev.filter((_, i) => i !== idx));
  };

  const updateSection = (idx, field, value) => {
    setSections(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      for (const sec of sections) {
        const payload = { city: sec.city || 'Unknown', description: sec.desc,
          start_date: sec.startDate, end_date: sec.endDate, budget: parseFloat(sec.budget) || 0 };
        if (sec.isNew) {
          await api.post(`/trips/${id}/stops`, payload);
        } else {
          await api.put(`/trips/stops/${sec.id}`, payload);
        }
      }
      showToast('Itinerary saved! 🎉');
      navigate(`/trips/${id}`);
    } catch {
      showToast('Save failed', 'error');
    } finally { setSaving(false); }
  };

  if (loading) return <AppLayout><div style={{ textAlign:'center',padding:'var(--space-3xl)',color:'var(--text-muted)' }}>⏳ Loading...</div></AppLayout>;

  return (
    <AppLayout headerProps={{ showFilters: false }}>
      <div style={{ marginBottom:'var(--space-xl)',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-heading)',fontSize:'1.8rem',fontWeight:800 }}>Build Itinerary</h1>
          <p style={{ color:'var(--text-secondary)',marginTop:4 }}>{trip?.name}</p>
        </div>
        <div style={{ display:'flex',gap:'var(--space-sm)' }}>
          <button className="btn btn-secondary" onClick={() => navigate(`/trips/${id}`)}>👁️ View Trip</button>
          <button className="btn btn-primary" onClick={saveAll} disabled={saving}>
            {saving ? '⏳ Saving...' : '💾 Save All'}
          </button>
        </div>
      </div>

      <div className="itinerary-builder-layout">
        {/* Sections */}
        <div>
          {/* Header banner */}
          <div style={{ background:'var(--bg-card)',border:'1px solid var(--border-card)',
            borderRadius:'var(--radius-lg)',padding:'var(--space-md) var(--space-lg)',
            marginBottom:'var(--space-md)',display:'flex',alignItems:'center',
            justifyContent:'space-between' }}>
            <div style={{ display:'flex',alignItems:'center',gap:'var(--space-sm)' }}>
              <span>🌍</span>
              <span style={{ fontWeight:600 }}>{trip?.name || 'GlobeTrotter'}</span>
            </div>
            <div style={{ width:12,height:12,borderRadius:'50%',background:'var(--accent-emerald)' }} />
          </div>

          {sections.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📍</div>
              <h3>No stops yet</h3>
              <p>Add your first city/stop below</p>
            </div>
          )}

          {sections.map((sec, idx) => (
            <div key={sec.id} className="section-block">
              <div className="section-block-header">
                <div className="section-block-title">Section {idx + 1}: {sec.city || 'New Stop'}</div>
                <button className="btn btn-danger btn-sm" onClick={() => removeSection(idx)}>✕</button>
              </div>

              <div className="form-group" style={{ marginBottom:'var(--space-md)' }}>
                <label className="form-label">City / Place</label>
                <input className="form-input" placeholder="City name"
                  value={sec.city} onChange={e => updateSection(idx,'city',e.target.value)} />
              </div>

              <div className="section-block-desc" contentEditable suppressContentEditableWarning
                onBlur={e => updateSection(idx,'desc',e.target.textContent)}
                style={{ border:'1px solid var(--border-subtle)',borderRadius:'var(--radius-md)',
                  padding:'10px 14px',fontSize:'0.85rem',minHeight:60,outline:'none',
                  background:'rgba(255,255,255,0.02)',color:'var(--text-secondary)' }}>
                {sec.desc}
              </div>

              <div className="section-block-footer">
                <div className="form-group">
                  <label className="form-label">Date Range: start to end</label>
                  <div style={{ display:'flex',gap:8,alignItems:'center' }}>
                    <input type="date" className="form-input" value={sec.startDate}
                      onChange={e => updateSection(idx,'startDate',e.target.value)} />
                    <span style={{ color:'var(--text-muted)',whiteSpace:'nowrap' }}>→</span>
                    <input type="date" className="form-input" value={sec.endDate}
                      onChange={e => updateSection(idx,'endDate',e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Budget of this section</label>
                  <input type="number" className="form-input" placeholder="$0"
                    value={sec.budget} onChange={e => updateSection(idx,'budget',e.target.value)} min="0" />
                </div>
              </div>
            </div>
          ))}

          {/* Add Section Button */}
          <button className="add-section-btn" onClick={addSection}>
            + Add another Section
          </button>
        </div>

        {/* Sidebar Summary */}
        <div className="itinerary-builder-sidebar">
          <h3 style={{ fontFamily:'var(--font-heading)',fontWeight:700,marginBottom:'var(--space-lg)' }}>
            Trip Summary
          </h3>

          <div className="budget-summary">
            <div style={{ fontSize:'0.8rem',color:'var(--text-muted)',marginBottom:4 }}>Total Budget</div>
            <div className="budget-total">${totalBudget.toLocaleString()}</div>
          </div>

          <div className="divider" />

          <div className="budget-breakdown">
            <div style={{ fontSize:'0.85rem',fontWeight:600,marginBottom:'var(--space-sm)' }}>Sections</div>
            {sections.map((s, i) => (
              <div key={i} className="budget-line">
                <span className="budget-line-label">{s.city || `Section ${i+1}`}</span>
                <span className="budget-line-value">${parseFloat(s.budget || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="divider" />

          <div style={{ display:'flex',flexDirection:'column',gap:'var(--space-sm)' }}>
            <button className="btn btn-primary w-full" onClick={saveAll} disabled={saving}>
              {saving ? '⏳' : '💾'} Save Itinerary
            </button>
            <button className="btn btn-secondary w-full" onClick={() => navigate(`/trips/${id}`)}>
              👁️ Preview Trip
            </button>
          </div>

          <div className="divider" />

          <div style={{ fontSize:'0.82rem',color:'var(--text-muted)' }}>
            <div style={{ marginBottom:6 }}>📍 {sections.length} stop{sections.length !== 1 ? 's' : ''}</div>
            <div>💰 ${totalBudget.toLocaleString()} total budget</div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function showToast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `<span class="toast-icon">${type==='success'?'✅':'❌'}</span><span class="toast-text">${msg}</span>`;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 50);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
}
