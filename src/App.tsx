import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ServerView from './pages/ServerView';
import ToastContainer from './components/Toast';
function PR({ children }: { children: React.ReactNode }) { return useAuthStore().isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />; }
export default function App() {
  return <BrowserRouter><Routes><Route path="/login" element={<Login />} /><Route path="/" element={<PR><Dashboard /></PR>} /><Route path="/servers/:serverId" element={<PR><ServerView /></PR>} /><Route path="*" element={<Navigate to="/" replace />} /></Routes><ToastContainer /></BrowserRouter>;
}
