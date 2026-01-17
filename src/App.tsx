import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import AppShell from './components/AppShell';
import AdminLayout from './components/admin/AdminLayout';
import Landing from './pages/Landing';
import Docs from './pages/Docs';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ServerView from './pages/ServerView';
import Pricing from './pages/Pricing';
import Billing from './pages/Billing';
import Checkout from './pages/Checkout';
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

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminTemplates from './pages/admin/AdminTemplates';
// P1 Admin pages
import AdminServers from './pages/admin/AdminServers';
import AdminServerDetail from './pages/admin/AdminServerDetail';
import AdminBilling from './pages/admin/AdminBilling';
import AdminSubscriptionDetail from './pages/admin/AdminSubscriptionDetail';
import AdminSecurity from './pages/admin/AdminSecurity';
import AdminApiKeyDetail from './pages/admin/AdminApiKeyDetail';
// P2 Admin pages
import AdminCollaborators from './pages/admin/AdminCollaborators';
import AdminCollaboratorDetail from './pages/admin/AdminCollaboratorDetail';
import AdminWebhooks from './pages/admin/AdminWebhooks';
import AdminWebhookDetail from './pages/admin/AdminWebhookDetail';
// P3 Admin pages
import AdminInviteCodes from './pages/admin/AdminInviteCodes';
import AdminInviteCodeDetail from './pages/admin/AdminInviteCodeDetail';
import AdminScheduledBackups from './pages/admin/AdminScheduledBackups';
import AdminScheduledBackupDetail from './pages/admin/AdminScheduledBackupDetail';
// P4 Admin pages
import AdminGitConfigs from './pages/admin/AdminGitConfigs';
import AdminConfigFiles from './pages/admin/AdminConfigFiles';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppShell>{children}</AppShell>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Protected route without AppShell (for pages with custom layouts like Checkout)
function ProtectedRouteNoShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// Admin route with AdminLayout (requires authentication, admin check can be added server-side)
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AdminLayout>{children}</AdminLayout>;
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

        {/* Public landing page */}
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />

        {/* Dashboard - protected */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/servers/:serverId" element={<ProtectedRoute><ServerView /></ProtectedRoute>} />
        <Route path="/templates" element={<ProtectedRoute><TemplateLibrary /></ProtectedRoute>} />
        <Route path="/templates/:templateId" element={<ProtectedRoute><TemplateDetail /></ProtectedRoute>} />
        <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRouteNoShell><Checkout /></ProtectedRouteNoShell>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/api-keys" element={<ProtectedRoute><ApiKeys /></ProtectedRoute>} />
        <Route path="/webhooks" element={<ProtectedRoute><Webhooks /></ProtectedRoute>} />
        <Route path="/scheduled-backups" element={<ProtectedRoute><ScheduledBackups /></ProtectedRoute>} />
        <Route path="/git-configs" element={<ProtectedRoute><GitConfigs /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/users/:userId" element={<AdminRoute><AdminUserDetail /></AdminRoute>} />
        <Route path="/admin/audit-logs" element={<AdminRoute><AdminAuditLogs /></AdminRoute>} />
        <Route path="/admin/templates" element={<AdminRoute><AdminTemplates /></AdminRoute>} />
        {/* P1 Admin routes */}
        <Route path="/admin/servers" element={<AdminRoute><AdminServers /></AdminRoute>} />
        <Route path="/admin/servers/:serverId" element={<AdminRoute><AdminServerDetail /></AdminRoute>} />
        <Route path="/admin/billing" element={<AdminRoute><AdminBilling /></AdminRoute>} />
        <Route path="/admin/billing/:subscriptionId" element={<AdminRoute><AdminSubscriptionDetail /></AdminRoute>} />
        <Route path="/admin/security" element={<AdminRoute><AdminSecurity /></AdminRoute>} />
        <Route path="/admin/security/api-keys/:apiKeyId" element={<AdminRoute><AdminApiKeyDetail /></AdminRoute>} />
        {/* P2 Admin routes */}
        <Route path="/admin/collaborators" element={<AdminRoute><AdminCollaborators /></AdminRoute>} />
        <Route path="/admin/collaborators/:collaboratorId" element={<AdminRoute><AdminCollaboratorDetail /></AdminRoute>} />
        <Route path="/admin/webhooks" element={<AdminRoute><AdminWebhooks /></AdminRoute>} />
        <Route path="/admin/webhooks/:webhookId" element={<AdminRoute><AdminWebhookDetail /></AdminRoute>} />
        {/* P3 Admin routes */}
        <Route path="/admin/invite-codes" element={<AdminRoute><AdminInviteCodes /></AdminRoute>} />
        <Route path="/admin/invite-codes/:inviteCodeId" element={<AdminRoute><AdminInviteCodeDetail /></AdminRoute>} />
        <Route path="/admin/scheduled-backups" element={<AdminRoute><AdminScheduledBackups /></AdminRoute>} />
        <Route path="/admin/scheduled-backups/:backupId" element={<AdminRoute><AdminScheduledBackupDetail /></AdminRoute>} />
        {/* P4 Admin routes */}
        <Route path="/admin/git-configs" element={<AdminRoute><AdminGitConfigs /></AdminRoute>} />
        <Route path="/admin/config-files" element={<AdminRoute><AdminConfigFiles /></AdminRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}
