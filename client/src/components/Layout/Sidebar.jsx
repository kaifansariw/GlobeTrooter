import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard',         icon: '🏠', label: 'Dashboard' },
  { to: '/trips',             icon: '🧳', label: 'My Trips' },
  { to: '/create-trip',       icon: '✈️', label: 'Plan a Trip' },
  { to: '/search',            icon: '🔍', label: 'Explore' },
  { to: '/calendar',          icon: '📅', label: 'Calendar' },
  { to: '/community',         icon: '🌐', label: 'Community' },
  { to: '/profile',           icon: '👤', label: 'Profile' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sidebar" id="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">🌍</span>
        <span className="logo-text">GlobeTrotter</span>
      </div>

      <ul className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{icon}</span>
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        {user?.is_admin && (
          <NavLink
            to="/admin"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">⚙️</span>
            <span>Admin</span>
          </NavLink>
        )}
        <button className="nav-link logout-link" onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
