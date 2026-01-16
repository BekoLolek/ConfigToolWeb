import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import AppShell from './components/AppShell';
import Landing from './pages/Landing';
import Docs from './pages/Docs';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ServerView from './pages/ServerView';
import Pricing from './pages/Pricing';
import Billing from './pages/Billing';
import Profile from './pages/Profile';
import ApiKeys from './pages/ApiKeys';
import Webhooks from './pages/Webhooks';
import ScheduledBackups from './pages/ScheduledBackups';
import GitConfigs from './pages/GitConfigs';
import Marketplace from './pages/Marketplace';
import TemplateLibrary from './pages/TemplateLibrary';
import TemplateDetail from './pages/TemplateDetail';
import VerifyEmail from './pages/VerifyEmail';
import ToastContainer from './components/Toast';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppShell>{children}</AppShell>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Root route that shows landing page for unauthenticated users
function RootRoute() {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <ProtectedRoute><Dashboard /></ProtectedRoute>;
  }
  return <Landing />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes - no AppShell */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/pricing" element={<PublicRoute><Pricing /></PublicRoute>} />
        <Route path="/docs" element={<PublicRoute><Docs /></PublicRoute>} />
        <Route path="/verify-email" element={<PublicRoute><VerifyEmail /></PublicRoute>} />

        {/* Root route - Landing for unauthenticated, Dashboard for authenticated */}
        <Route path="/" element={<RootRoute />} />
        <Route path="/servers/:serverId" element={<ProtectedRoute><ServerView /></ProtectedRoute>} />
        <Route path="/templates" element={<ProtectedRoute><TemplateLibrary /></ProtectedRoute>} />
        <Route path="/templates/:templateId" element={<ProtectedRoute><TemplateDetail /></ProtectedRoute>} />
        <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/api-keys" element={<ProtectedRoute><ApiKeys /></ProtectedRoute>} />
        <Route path="/webhooks" element={<ProtectedRoute><Webhooks /></ProtectedRoute>} />
        <Route path="/scheduled-backups" element={<ProtectedRoute><ScheduledBackups /></ProtectedRoute>} />
        <Route path="/git-configs" element={<ProtectedRoute><GitConfigs /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}
