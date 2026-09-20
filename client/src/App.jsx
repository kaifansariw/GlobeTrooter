import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login            from './pages/Login';
import Register         from './pages/Register';
import Dashboard        from './pages/Dashboard';
import MyTrips          from './pages/MyTrips';
import CreateTrip       from './pages/CreateTrip';
import ItineraryBuilder from './pages/ItineraryBuilder';
import ItineraryView    from './pages/ItineraryView';
import CalendarView     from './pages/CalendarView';
import Search           from './pages/Search';
import Community        from './pages/Community';
import Profile          from './pages/Profile';
import Admin            from './pages/Admin';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected App Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/trips"     element={<ProtectedRoute><MyTrips /></ProtectedRoute>} />
          <Route path="/trips/:id" element={<ProtectedRoute><ItineraryView /></ProtectedRoute>} />
          <Route path="/trips/:id/builder" element={<ProtectedRoute><ItineraryBuilder /></ProtectedRoute>} />
          <Route path="/create-trip"       element={<ProtectedRoute><CreateTrip /></ProtectedRoute>} />
          <Route path="/calendar"          element={<ProtectedRoute><CalendarView /></ProtectedRoute>} />
          <Route path="/search"            element={<ProtectedRoute><Search /></ProtectedRoute>} />
          <Route path="/community"         element={<ProtectedRoute><Community /></ProtectedRoute>} />
          <Route path="/profile"           element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin"             element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
