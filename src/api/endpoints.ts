import { api } from './client';
import type { AuthResponse, ServerListItem, Server, FileInfo, FileContent, Version, VersionDetail } from '../types';
export const authApi = { register: (e: string, p: string) => api.post<AuthResponse>('/api/auth/register', { email: e, password: p }), login: (e: string, p: string) => api.post<AuthResponse>('/api/auth/login', { email: e, password: p }), logout: (t: string) => api.post('/api/auth/logout', { refreshToken: t }) };
export const serverApi = { list: () => api.get<ServerListItem[]>('/api/servers'), get: (id: string) => api.get<Server>(`/api/servers/${id}`), create: (name: string) => api.post<Server>('/api/servers', { name }), delete: (id: string) => api.delete(`/api/servers/${id}`) };
export const fileApi = {
  list: (sid: string, dir?: string) => api.get<{ files: FileInfo[] }>(`/api/servers/${sid}/files`, { params: { directory: dir } }),
  getContent: (sid: string, path: string) => api.get<FileContent>(`/api/servers/${sid}/files/content`, { params: { path } }),
  save: (sid: string, path: string, content: string, msg?: string, reload = false) => api.put(`/api/servers/${sid}/files/content`, { content, message: msg, reload }, { params: { path } }),
  getVersions: (sid: string, path: string) => api.get<Version[]>(`/api/servers/${sid}/files/versions`, { params: { path } }),
  getVersion: (sid: string, vid: string) => api.get<VersionDetail>(`/api/servers/${sid}/files/versions/${vid}`),
  restore: (sid: string, path: string, vid: string) => api.post(`/api/servers/${sid}/files/restore`, null, { params: { path, versionId: vid } })
};
