import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
interface AuthState { user: User | null; accessToken: string | null; refreshToken: string | null; isAuthenticated: boolean; setAuth: (u: User, a: string, r: string) => void; setAccessToken: (t: string) => void; logout: () => void; }
export const useAuthStore = create<AuthState>()(persist((set) => ({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, setAuth: (user, accessToken, refreshToken) => set({ user, accessToken, refreshToken, isAuthenticated: true }), setAccessToken: (accessToken) => set({ accessToken }), logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }) }), { name: 'auth' }));
