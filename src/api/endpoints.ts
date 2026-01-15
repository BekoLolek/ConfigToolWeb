import { api } from './client';
import type { AuthResponse, ServerListItem, Server, FileListResponse, FileContent, Version, VersionDetail, SearchResult, UpdateServerRequest, FileChange, PlanPricing, Subscription, Invoice, PaymentMethod, Usage, BillingPortalResponse } from '../types';
export const healthApi = { check: () => api.get('/api/health') };
export const authApi = { register: (e: string, p: string) => api.post<AuthResponse>('/api/auth/register', { email: e, password: p }), login: (e: string, p: string) => api.post<AuthResponse>('/api/auth/login', { email: e, password: p }), logout: (t: string) => api.post('/api/auth/logout', { refreshToken: t }) };
export const serverApi = {
  list: () => api.get<ServerListItem[]>('/api/servers'),
  get: (id: string) => api.get<Server>(`/api/servers/${id}`),
  create: (name: string) => api.post<Server>('/api/servers', { name }),
  update: (id: string, data: UpdateServerRequest) => api.patch<Server>(`/api/servers/${id}`, data),
  delete: (id: string) => api.delete(`/api/servers/${id}`),
  getGroups: () => api.get<string[]>('/api/servers/groups')
};
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
  search: (serverId: string, query: string) => api.get<SearchResult[]>(`/api/servers/${serverId}/files/search`, { params: { query } }),
  download: (serverId: string, path: string) => api.get(`/api/servers/${serverId}/files/download`, { params: { path }, responseType: 'blob' }),
  getChangesSince: (serverId: string, since: string) => api.get<FileChange[]>(`/api/servers/${serverId}/files/changes`, { params: { since } }),
  rollbackFiles: (serverId: string, files: { path: string; toVersionId: string }[]) => api.post(`/api/servers/${serverId}/files/rollback-bulk`, { files })
};

// User API
export const userApi = {
  // Change password
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/api/user/change-password', { currentPassword, newPassword }),

  // Delete account
  deleteAccount: () => api.delete('/api/user/account'),

  // Get current user profile
  getProfile: () => api.get('/api/user/profile'),

  // Update profile
  updateProfile: (data: { email?: string }) => api.patch('/api/user/profile', data),
};

// Billing API
export const billingApi = {
  // Public pricing endpoint (no auth required)
  getPricing: () => api.get<PlanPricing[]>('/api/billing/pricing'),

  // Organization-scoped billing endpoints
  getSubscription: (orgId: string) => api.get<Subscription>(`/api/organizations/${orgId}/billing/subscription`),
  createSubscription: (orgId: string, plan: string, paymentMethodId: string, billingCycle: string) =>
    api.post<Subscription>(`/api/organizations/${orgId}/billing/subscription`, { plan, paymentMethodId, billingCycle }),
  cancelSubscription: (orgId: string) => api.post<Subscription>(`/api/organizations/${orgId}/billing/subscription/cancel`),
  resumeSubscription: (orgId: string) => api.post<Subscription>(`/api/organizations/${orgId}/billing/subscription/resume`),

  // Invoices
  getInvoices: (orgId: string) => api.get<Invoice[]>(`/api/organizations/${orgId}/billing/invoices`),

  // Payment methods
  getPaymentMethods: (orgId: string) => api.get<PaymentMethod[]>(`/api/organizations/${orgId}/billing/payment-methods`),
  addPaymentMethod: (orgId: string, paymentMethodId: string, setAsDefault = true) =>
    api.post<PaymentMethod>(`/api/organizations/${orgId}/billing/payment-methods`, { paymentMethodId, setAsDefault }),
  removePaymentMethod: (orgId: string, paymentMethodId: string) =>
    api.delete(`/api/organizations/${orgId}/billing/payment-methods/${paymentMethodId}`),
  setDefaultPaymentMethod: (orgId: string, paymentMethodId: string) =>
    api.post(`/api/organizations/${orgId}/billing/payment-methods/${paymentMethodId}/default`),

  // Billing portal
  createBillingPortal: (orgId: string, returnUrl: string) =>
    api.post<BillingPortalResponse>(`/api/organizations/${orgId}/billing/portal`, null, { params: { returnUrl } }),

  // Usage
  getUsage: (orgId: string) => api.get<Usage>(`/api/organizations/${orgId}/usage`),
};
