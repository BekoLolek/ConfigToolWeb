import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../stores/authStore';
import { toast } from '../stores/toastStore';

const baseURL = import.meta.env.VITE_API_URL;
if (!baseURL) {
  console.error('[API] VITE_API_URL environment variable is not set. API calls will fail.');
}

export const api = axios.create({
  baseURL,
  timeout: 30000, // 30 second timeout
});

// Track if we've already shown a warmup toast recently to avoid spam
let lastWarmupToast = 0;
const WARMUP_TOAST_COOLDOWN = 10000; // 10 seconds between warmup toasts

/**
 * Check if an error indicates the backend is unavailable/warming up
 */
function isBackendUnavailable(error: AxiosError): boolean {
  // Network error (no response at all)
  if (!error.response && error.code === 'ERR_NETWORK') {
    return true;
  }

  // Timeout
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return true;
  }

  // Backend errors (Render warmup or internal errors)
  const status = error.response?.status;
  if (status === 500 || status === 502 || status === 503 || status === 504) {
    return true;
  }

  return false;
}

/**
 * Show a user-friendly toast about backend warmup
 */
function showWarmupToast() {
  const now = Date.now();
  if (now - lastWarmupToast < WARMUP_TOAST_COOLDOWN) {
    return; // Don't spam toasts
  }
  lastWarmupToast = now;

  toast.warning(
    'Server is starting up. Please wait about a minute and try again.',
    8000
  );
}

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const req = error.config;

    // Handle backend unavailable (warmup period)
    if (isBackendUnavailable(error)) {
      showWarmupToast();
      window.dispatchEvent(new CustomEvent('backend-unavailable'));
      return Promise.reject(error);
    }

    // Handle trial expired (402 Payment Required)
    if (error.response?.status === 402) {
      window.dispatchEvent(new CustomEvent('trial-expired', { detail: error.response.data }));
      return Promise.reject(error);
    }

    // Handle unauthorized (401) with token refresh
    if (error.response?.status === 401 && req && !(req as any)._retry) {
      (req as any)._retry = true;
      const refresh = useAuthStore.getState().refreshToken;
      if (refresh) {
        try {
          const res = await axios.post(`${api.defaults.baseURL}/api/auth/refresh`, {
            refreshToken: refresh
          });
          useAuthStore.getState().setAccessToken(res.data.accessToken);
          req.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return api(req);
        } catch {
          useAuthStore.getState().logout();
        }
      }
    }

    return Promise.reject(error);
  }
);
