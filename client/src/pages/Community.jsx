import { useState, useEffect } from 'react';
import AppLayout from '../components/Layout/AppLayout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Community() {
  const { user }  = useAuth();
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    api.get('/community')
      .then(r => setPosts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLike = async (id) => {
    try {
      const res = await api.post(`/community/${id}/like`);
      setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: res.data.likes } : p));
    } catch {}
  };

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    try {
      const res = await api.post('/community', { content: newPost, is_public: true, tags: [] });
      setPosts(prev => [{
        ...res.data,
        first_name: user.first_name, last_name: user.last_name, tags: [],
      }, ...prev]);
      setNewPost(''); setShowForm(false);
    } catch {}
    finally { setPosting(false); }
  };

  const fmtTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const diff = Date.now() - d.getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'just now';
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h/24)}d ago`;
  };

  const AVATAR_GRADS = [
    'linear-gradient(135deg,#f093fb,#f5576c)',
    'linear-gradient(135deg,#4facfe,#00f2fe)',
    'linear-gradient(135deg,#43e97b,#38f9d7)',
    'linear-gradient(135deg,#f59e0b,#f43f5e)',
    'linear-gradient(135deg,#667eea,#764ba2)',
  ];

  return (
    <AppLayout headerProps={{ searchPlaceholder:'Search community...', showFilters: true, title: 'Community' }}>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 280px',gap:'var(--space-xl)' }}>
        {/* Main Feed */}
        <div>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'var(--space-xl)' }}>
            <div>
              <h1 style={{ fontFamily:'var(--font-heading)',fontSize:'1.8rem',fontWeight:800 }}>Community</h1>
              <p style={{ color:'var(--text-secondary)',marginTop:4 }}>Discover trips shared by fellow explorers</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              ✏️ Share Trip
            </button>
          </div>

          {/* New Post Form */}
          {showForm && (
            <div className="glass-card" style={{ padding:'var(--space-lg)',marginBottom:'var(--space-lg)',animation:'fadeInUp .3s ease' }}>
              <h3 style={{ fontFamily:'var(--font-heading)',fontSize:'1rem',marginBottom:'var(--space-md)' }}>Share your experience</h3>
              <textarea className="form-textarea" style={{ minHeight:100 }}
                placeholder="Tell the community about your trip — tips, highlights, must-sees..."
                value={newPost} onChange={e => setNewPost(e.target.value)} />
              <div style={{ display:'flex',gap:'var(--space-sm)',marginTop:'var(--space-md)',justifyContent:'flex-end' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={handlePost} disabled={posting}>
                  {posting ? '⏳' : '🌐'} Post
                </button>
              </div>
            </div>
          )}

          {/* Post List */}
          {loading ? (
            <div style={{ textAlign:'center',padding:'var(--space-2xl)',color:'var(--text-muted)' }}>⏳ Loading feed...</div>
          ) : (
            <div style={{ display:'flex',flexDirection:'column',gap:'var(--space-md)' }}>
              {posts.map((post, i) => {
                const name  = `${post.first_name||''} ${post.last_name||''}`.trim();
                const initials = name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
                return (
                  <div key={post.id} className="community-post">
                    <div className="post-header">
                      <div className="avatar" style={{ background: AVATAR_GRADS[i % AVATAR_GRADS.length] }}>
                        {initials}
                      </div>
                      <div className="post-user-info">
                        <h4>{name || 'Anonymous Traveler'}</h4>
                        <span>{post.trip_name ? `✈️ ${post.trip_name}` : '🌍 Travel Post'} · {fmtTime(post.created_at)}</span>
                      </div>
                      {post.is_public && <span className="badge badge-teal" style={{ marginLeft:'auto' }}>Public</span>}
                    </div>

                    <p className="post-content">{post.content}</p>

                    {post.tags?.length > 0 && (
                      <div className="post-tags">
                        {post.tags.map(tag => (
                          <span key={tag} className="badge badge-violet">#{tag}</span>
                        ))}
                      </div>
                    )}

                    <div className="post-actions">
                      <button className="post-action-btn" onClick={() => handleLike(post.id)}>
                        ❤️ {post.likes || 0}
                      </button>
                      <button className="post-action-btn">💬 Comment</button>
                      <button className="post-action-btn">🔗 Share</button>
                      <button className="post-action-btn">🗺️ View Trip</button>
                    </div>
                  </div>
                );
              })}
              {posts.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">🌐</div>
                  <h3>No posts yet</h3>
                  <p>Be the first to share a trip experience!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display:'flex',flexDirection:'column',gap:'var(--space-md)' }}>
          <div className="glass-card" style={{ padding:'var(--space-lg)' }}>
            <h3 style={{ fontFamily:'var(--font-heading)',fontSize:'1rem',marginBottom:'var(--space-md)' }}>
              Community Tab
            </h3>
            <p style={{ fontSize:'0.85rem',color:'var(--text-secondary)',lineHeight:1.7 }}>
              Explore trips shared by fellow GlobeTrotters. Search for a specific city or destination to narrow down posts using the search bar above.
            </p>
          </div>

          <div className="glass-card" style={{ padding:'var(--space-lg)' }}>
            <h4 style={{ fontSize:'0.9rem',fontWeight:600,marginBottom:'var(--space-md)' }}>🔥 Trending Tags</h4>
            <div style={{ display:'flex',flexWrap:'wrap',gap:'var(--space-sm)' }}>
              {['Japan','Paris','Bali','Budget','Luxury','Solo Travel','Adventure','Food'].map(tag => (
                <span key={tag} className="badge badge-violet" style={{ cursor:'pointer' }}>#{tag}</span>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding:'var(--space-lg)' }}>
            <h4 style={{ fontSize:'0.9rem',fontWeight:600,marginBottom:'var(--space-md)' }}>📊 Community Stats</h4>
            <div style={{ display:'flex',flexDirection:'column',gap:'var(--space-sm)' }}>
              {[['🌍','Total Posts',posts.length],['❤️','Total Likes',posts.reduce((s,p)=>s+(p.likes||0),0)],
                ['✈️','Destinations Shared','12+']].map(([icon,label,val]) => (
                <div key={label} style={{ display:'flex',justifyContent:'space-between',fontSize:'0.85rem' }}>
                  <span style={{ color:'var(--text-secondary)' }}>{icon} {label}</span>
                  <span style={{ fontWeight:600 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
