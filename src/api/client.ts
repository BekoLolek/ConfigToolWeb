import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
const baseURL = import.meta.env.VITE_API_URL;
if (!baseURL) {
  console.error('[API] VITE_API_URL environment variable is not set. API calls will fail.');
}
export const api = axios.create({ baseURL });
api.interceptors.request.use(c => { const t = useAuthStore.getState().accessToken; if (t) c.headers.Authorization = `Bearer ${t}`; return c; });
api.interceptors.response.use(r => r, async e => {
  const req = e.config;
  // Handle trial expired (402 Payment Required)
  if (e.response?.status === 402) {
    window.dispatchEvent(new CustomEvent('trial-expired', { detail: e.response.data }));
    return Promise.reject(e);
  }
  // Handle unauthorized (401) with token refresh
  if (e.response?.status === 401 && !req._retry) {
    req._retry = true;
    const refresh = useAuthStore.getState().refreshToken;
    if (refresh) try { const res = await axios.post(`${api.defaults.baseURL}/api/auth/refresh`, { refreshToken: refresh }); useAuthStore.getState().setAccessToken(res.data.accessToken); req.headers.Authorization = `Bearer ${res.data.accessToken}`; return api(req); } catch { useAuthStore.getState().logout(); }
  }
  return Promise.reject(e);
});
