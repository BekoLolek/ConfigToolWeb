import { api } from './client';
import type { AuthResponse, ServerListItem, Server, FileListResponse, FileContent, Version, VersionDetail, SearchResult, UpdateServerRequest, FileChange, PlanPricing, Subscription, Invoice, PaymentMethod, Usage, BillingPortalResponse, ApiKey, CreateApiKeyRequest, CreateApiKeyResponse, Webhook, CreateWebhookRequest, ScheduledBackup, CreateScheduledBackupRequest, GitConfig, CreateGitConfigRequest, Template, TemplateCategory, TemplateRating, TemplateVariable, PageResponse, CreateTemplateRequest, CreateRatingRequest, CreateVariableRequest } from '../types';
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

// API Keys
export const apiKeyApi = {
  list: (orgId: string) => api.get<ApiKey[]>(`/api/organizations/${orgId}/api-keys`),
  create: (orgId: string, data: CreateApiKeyRequest) =>
    api.post<CreateApiKeyResponse>(`/api/organizations/${orgId}/api-keys`, data),
  revoke: (orgId: string, keyId: number) =>
    api.delete(`/api/organizations/${orgId}/api-keys/${keyId}`),
};

// Webhooks
export const webhookApi = {
  list: (orgId: string) => api.get<Webhook[]>(`/api/organizations/${orgId}/webhooks`),
  get: (orgId: string, webhookId: number) =>
    api.get<Webhook>(`/api/organizations/${orgId}/webhooks/${webhookId}`),
  create: (orgId: string, data: CreateWebhookRequest) =>
    api.post<Webhook>(`/api/organizations/${orgId}/webhooks`, data),
  update: (orgId: string, webhookId: number, data: CreateWebhookRequest) =>
    api.put<Webhook>(`/api/organizations/${orgId}/webhooks/${webhookId}`, data),
  delete: (orgId: string, webhookId: number) =>
    api.delete(`/api/organizations/${orgId}/webhooks/${webhookId}`),
  toggle: (orgId: string, webhookId: number, active: boolean) =>
    api.patch(`/api/organizations/${orgId}/webhooks/${webhookId}/toggle`, { active }),
  test: (orgId: string, webhookId: number) =>
    api.post(`/api/organizations/${orgId}/webhooks/${webhookId}/test`),
};

// Scheduled Backups
export const scheduledBackupApi = {
  list: (orgId: string) => api.get<ScheduledBackup[]>(`/api/organizations/${orgId}/scheduled-backups`),
  get: (orgId: string, backupId: number) =>
    api.get<ScheduledBackup>(`/api/organizations/${orgId}/scheduled-backups/${backupId}`),
  create: (orgId: string, data: CreateScheduledBackupRequest) =>
    api.post<ScheduledBackup>(`/api/organizations/${orgId}/scheduled-backups`, data),
  update: (orgId: string, backupId: number, data: CreateScheduledBackupRequest) =>
    api.put<ScheduledBackup>(`/api/organizations/${orgId}/scheduled-backups/${backupId}`, data),
  delete: (orgId: string, backupId: number) =>
    api.delete(`/api/organizations/${orgId}/scheduled-backups/${backupId}`),
  toggle: (orgId: string, backupId: number, enabled: boolean) =>
    api.patch(`/api/organizations/${orgId}/scheduled-backups/${backupId}/toggle`, { enabled }),
};

// Git Configs
export const gitConfigApi = {
  list: (orgId: string) => api.get<GitConfig[]>(`/api/organizations/${orgId}/git-configs`),
  get: (orgId: string, configId: number) =>
    api.get<GitConfig>(`/api/organizations/${orgId}/git-configs/${configId}`),
  create: (orgId: string, data: CreateGitConfigRequest) =>
    api.post<GitConfig>(`/api/organizations/${orgId}/git-configs`, data),
  update: (orgId: string, configId: number, data: CreateGitConfigRequest) =>
    api.put<GitConfig>(`/api/organizations/${orgId}/git-configs/${configId}`, data),
  delete: (orgId: string, configId: number) =>
    api.delete(`/api/organizations/${orgId}/git-configs/${configId}`),
  toggle: (orgId: string, configId: number, enabled: boolean) =>
    api.patch(`/api/organizations/${orgId}/git-configs/${configId}/toggle`, { enabled }),
  sync: (orgId: string, configId: number) =>
    api.post(`/api/organizations/${orgId}/git-configs/${configId}/sync`),
};

// Template & Marketplace API
export const templateApi = {
  // Public marketplace
  getMarketplace: (page = 0, size = 20, sort = 'downloadCount', direction = 'desc') =>
    api.get<PageResponse<Template>>(`/api/marketplace/templates`, { params: { page, size, sort, direction } }),

  getPopular: (page = 0, size = 20) =>
    api.get<PageResponse<Template>>(`/api/marketplace/templates/popular`, { params: { page, size } }),

  getRecent: (page = 0, size = 20) =>
    api.get<PageResponse<Template>>(`/api/marketplace/templates/recent`, { params: { page, size } }),

  getTopRated: (page = 0, size = 20) =>
    api.get<PageResponse<Template>>(`/api/marketplace/templates/top-rated`, { params: { page, size } }),

  getVerified: (page = 0, size = 20) =>
    api.get<PageResponse<Template>>(`/api/marketplace/templates/verified`, { params: { page, size } }),

  search: (query: string, page = 0, size = 20) =>
    api.get<PageResponse<Template>>(`/api/marketplace/templates/search`, { params: { query, page, size } }),

  getByPlugin: (pluginName: string, page = 0, size = 20) =>
    api.get<PageResponse<Template>>(`/api/marketplace/templates/plugin/${pluginName}`, { params: { page, size } }),

  getByCategory: (categoryId: string, page = 0, size = 20) =>
    api.get<PageResponse<Template>>(`/api/marketplace/templates/category/${categoryId}`, { params: { page, size } }),

  getPluginNames: () =>
    api.get<string[]>(`/api/marketplace/plugins`),

  // Single template operations
  get: (id: string) =>
    api.get<Template>(`/api/templates/${id}`),

  download: (id: string) =>
    api.get<Template>(`/api/templates/${id}/download`),

  // User templates
  getUserTemplates: (page = 0, size = 20) =>
    api.get<PageResponse<Template>>(`/api/user/templates`, { params: { page, size } }),

  create: (data: CreateTemplateRequest) =>
    api.post<Template>(`/api/templates`, data),

  update: (id: string, data: Partial<CreateTemplateRequest>) =>
    api.patch<Template>(`/api/templates/${id}`, data),

  delete: (id: string) =>
    api.delete(`/api/templates/${id}`),

  // Organization templates
  getOrgTemplates: (orgId: string, page = 0, size = 20) =>
    api.get<PageResponse<Template>>(`/api/organizations/${orgId}/templates`, { params: { page, size } }),

  // Variables
  getVariables: (templateId: string) =>
    api.get<TemplateVariable[]>(`/api/templates/${templateId}/variables`),

  addVariable: (templateId: string, data: CreateVariableRequest) =>
    api.post<TemplateVariable>(`/api/templates/${templateId}/variables`, data),

  deleteVariable: (variableId: string) =>
    api.delete(`/api/templates/variables/${variableId}`),

  applyVariables: (templateId: string, values: Record<string, string>) =>
    api.post<{ content: string }>(`/api/templates/${templateId}/apply`, { values }),

  // Ratings
  getRatings: (templateId: string, page = 0, size = 20) =>
    api.get<PageResponse<TemplateRating>>(`/api/templates/${templateId}/ratings`, { params: { page, size } }),

  rate: (templateId: string, data: CreateRatingRequest) =>
    api.post<TemplateRating>(`/api/templates/${templateId}/ratings`, data),

  deleteRating: (templateId: string) =>
    api.delete(`/api/templates/${templateId}/ratings`),
};

// Categories API
export const categoryApi = {
  getAll: () =>
    api.get<TemplateCategory[]>(`/api/marketplace/categories`),

  getActive: () =>
    api.get<TemplateCategory[]>(`/api/marketplace/categories/active`),

  get: (id: string) =>
    api.get<TemplateCategory>(`/api/marketplace/categories/${id}`),

  getBySlug: (slug: string) =>
    api.get<TemplateCategory>(`/api/marketplace/categories/slug/${slug}`),
};
