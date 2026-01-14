import { api } from './client';
import type { AuthResponse, ServerListItem, Server, FileListResponse, FileContent, Version, VersionDetail, SearchResult } from '../types';
export const healthApi = { check: () => api.get('/api/health') };
export const authApi = { register: (e: string, p: string) => api.post<AuthResponse>('/api/auth/register', { email: e, password: p }), login: (e: string, p: string) => api.post<AuthResponse>('/api/auth/login', { email: e, password: p }), logout: (t: string) => api.post('/api/auth/logout', { refreshToken: t }) };
export const serverApi = { list: () => api.get<ServerListItem[]>('/api/servers'), get: (id: string) => api.get<Server>(`/api/servers/${id}`), create: (name: string) => api.post<Server>('/api/servers', { name }), delete: (id: string) => api.delete(`/api/servers/${id}`) };
export const fileApi = {
  list: (sid: string, dir?: string, offset = 0, limit = 100) => api.get<FileListResponse>(`/api/servers/${sid}/files`, { params: { directory: dir, offset, limit } }),
  getContent: (sid: string, path: string) => api.get<FileContent>(`/api/servers/${sid}/files/content`, { params: { path } }),
  save: (sid: string, path: string, content: string, msg?: string, reload = false) => api.put(`/api/servers/${sid}/files/content`, { content, message: msg, reload }, { params: { path } }),
  getVersions: (sid: string, path: string) => api.get<Version[]>(`/api/servers/${sid}/files/versions`, { params: { path } }),
  getVersion: (sid: string, vid: string) => api.get<VersionDetail>(`/api/servers/${sid}/files/versions/${vid}`),
  restore: (sid: string, path: string, vid: string) => api.post(`/api/servers/${sid}/files/restore`, null, { params: { path, versionId: vid } }),
  createFile: (serverId: string, path: string, isDirectory: boolean) => api.post(`/api/servers/${serverId}/files`, { path, isDirectory }),
  renameFile: (serverId: string, oldPath: string, newPath: string) => api.put(`/api/servers/${serverId}/files/rename`, { oldPath, newPath }),
  deleteFile: (serverId: string, path: string) => api.delete(`/api/servers/${serverId}/files`, { params: { path } }),
  search: (serverId: string, query: string) => api.get<SearchResult[]>(`/api/servers/${serverId}/files/search`, { params: { query } })
};
