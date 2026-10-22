import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from './features/auth/authStore.js';
import SmoothScroll from './components/SmoothScroll.jsx';
import AppLayout from './components/AppLayout.jsx';
import { LoginPage, RegisterPage } from './pages/AuthPages.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import WorkoutsPage from './pages/WorkoutsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import CoachPage from './pages/CoachPage.jsx';
import IntegrationsPage from './pages/IntegrationsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  return token ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  return token ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <>
      <SmoothScroll />
      <Routes>
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="workouts" element={<WorkoutsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="coach" element={<CoachPage />} />
          <Route path="integrations" element={<IntegrationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
