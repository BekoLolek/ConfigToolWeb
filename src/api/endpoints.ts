import { api } from './client';
import type { AuthResponse, ServerListItem, Server, FileListResponse, FileContent, Version, VersionDetail, SearchResult, UpdateServerRequest, FileChange, Subscription, Invoice, PaymentMethod, Usage, ApiKey, CreateApiKeyRequest, CreateApiKeyResponse, Webhook, CreateWebhookRequest, ScheduledBackup, CreateScheduledBackupRequest, GitConfig, CreateGitConfigRequest, Template, TemplateCategory, TemplateRating, TemplateVariable, PageResponse, CreateTemplateRequest, CreateRatingRequest, CreateVariableRequest, ServerCollaborator, InviteCode, InviteCodeValidation, FileRestriction, CreateFileRestrictionRequest, PathPermissions, PluginAlias, CreatePluginAliasRequest, AuditLog, AuditAction, Plan } from '../types';
import type { AdminDashboardStats, AdminRevenue, AdminUser, AdminUserDetail, AdminAuditLog, AdminAuditLogFilters, AdminTemplate, AdminPageResponse, TemplateReviewStatus, SuspendUserRequest, OverridePlanRequest, RejectTemplateRequest, AdminServer, AdminServerDetail, AdminServerStats, AdminServerFilters, AdminSubscription, AdminSubscriptionDetail, AdminBillingStats, AdminSubscriptionFilters, ExtendTrialRequest, CancelSubscriptionRequest, AdminApiKey, AdminApiKeyDetail, AdminSecurityStats, AdminApiKeyFilters, AdminLoginHistory, AdminLoginHistoryFilters } from '../types/admin';

// Type definitions for API requests
export interface CreateServerRequest {
  name: string;
  groupName?: string;
  notes?: string;
}

export interface CreateSubscriptionRequest {
  plan: string;
  paymentMethodId: string;
  billingCycle: string;
}

export interface AddPaymentMethodRequest {
  paymentMethodId: string;
  setAsDefault?: boolean;
}
export const healthApi = { check: () => api.get('/actuator/health') };
export const authApi = { register: (e: string, p: string) => api.post<AuthResponse>('/api/auth/register', { email: e, password: p }), login: (e: string, p: string) => api.post<AuthResponse>('/api/auth/login', { email: e, password: p }), logout: (t: string) => api.post('/api/auth/logout', { refreshToken: t }), verifyEmail: (token: string) => api.post('/api/auth/verify-email', { token }) };
export const serverApi = {
  list: () => api.get<Server[]>('/api/servers'),
  create: (data: CreateServerRequest) => api.post<Server>('/api/servers', data),
  get: (id: string) => api.get<Server>(`/api/servers/${id}`),
  update: (id: string, data: UpdateServerRequest) => api.patch<Server>(`/api/servers/${id}`, data),
  delete: (id: string) => api.delete(`/api/servers/${id}`),
  regenerateToken: (id: string) => api.post<{ token: string }>(`/api/servers/${id}/regenerate-token`),
  getGroups: () => api.get<string[]>('/api/servers/groups'),
};

export const collaboratorApi = {
  list: (serverId: string) => api.get<ServerCollaborator[]>(`/api/servers/${serverId}/collaborators`),
  remove: (serverId: string, userId: string) => api.delete(`/api/servers/${serverId}/collaborators/${userId}`),
  leave: (serverId: string) => api.post(`/api/servers/${serverId}/leave`),
};

export const inviteCodeApi = {
  list: (serverId: string) => api.get<InviteCode[]>(`/api/servers/${serverId}/invite-codes`),
  generate: (serverId: string) => api.post<InviteCode>(`/api/servers/${serverId}/invite-codes`),
  delete: (serverId: string, codeId: string) => api.delete(`/api/servers/${serverId}/invite-codes/${codeId}`),
  validate: (code: string) => api.get<InviteCodeValidation>(`/api/invite/${code}/validate`),
  use: (code: string) => api.post<ServerCollaborator>(`/api/invite/${code}`),
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

  // Resend email verification
  resendVerification: () => api.post('/api/user/resend-verification'),
};

// Billing API
export const billingApi = {
  getPricing: () => api.get('/api/billing/pricing'),
  getSubscription: () => api.get<Subscription>('/api/billing/subscription'),
  createSubscription: (data: CreateSubscriptionRequest) => api.post<Subscription>('/api/billing/subscription', data),
  cancelSubscription: () => api.post('/api/billing/subscription/cancel'),
  resumeSubscription: () => api.post('/api/billing/subscription/resume'),
  cancelPendingDowngrade: () => api.post<Subscription>('/api/billing/subscription/cancel-pending'),
  getInvoices: () => api.get<Invoice[]>('/api/billing/invoices'),
  getPaymentMethods: () => api.get<PaymentMethod[]>('/api/billing/payment-methods'),
  addPaymentMethod: (data: AddPaymentMethodRequest) => api.post<PaymentMethod>('/api/billing/payment-methods', data),
  removePaymentMethod: (pmId: string) => api.delete(`/api/billing/payment-methods/${pmId}`),
  setDefaultPaymentMethod: (pmId: string) => api.post(`/api/billing/payment-methods/${pmId}/default`),
  getUsage: () => api.get<Usage>('/api/billing/usage'),
  createPortalSession: (returnUrl: string) => api.post<{ url: string }>('/api/billing/portal', { returnUrl }),
};

// API Keys
export const apiKeyApi = {
  list: () => api.get<ApiKey[]>('/api/api-keys'),
  create: (data: CreateApiKeyRequest) => api.post<CreateApiKeyResponse>('/api/api-keys', data),
  revoke: (keyId: number) => api.delete(`/api/api-keys/${keyId}`),
};

// Webhooks
export const webhookApi = {
  list: () => api.get<Webhook[]>('/api/webhooks'),
  get: (webhookId: number) => api.get<Webhook>(`/api/webhooks/${webhookId}`),
  create: (data: CreateWebhookRequest) => api.post<Webhook>('/api/webhooks', data),
  update: (webhookId: number, data: CreateWebhookRequest) => api.put<Webhook>(`/api/webhooks/${webhookId}`, data),
  delete: (webhookId: number) => api.delete(`/api/webhooks/${webhookId}`),
  toggle: (webhookId: number, active: boolean) => api.patch(`/api/webhooks/${webhookId}/toggle`, { active }),
  test: (webhookId: number) => api.post(`/api/webhooks/${webhookId}/test`),
};

// Scheduled Backups
export const scheduledBackupApi = {
  list: () => api.get<ScheduledBackup[]>('/api/scheduled-backups'),
  get: (backupId: number) => api.get<ScheduledBackup>(`/api/scheduled-backups/${backupId}`),
  create: (data: CreateScheduledBackupRequest) => api.post<ScheduledBackup>('/api/scheduled-backups', data),
  update: (backupId: number, data: CreateScheduledBackupRequest) => api.put<ScheduledBackup>(`/api/scheduled-backups/${backupId}`, data),
  delete: (backupId: number) => api.delete(`/api/scheduled-backups/${backupId}`),
  toggle: (backupId: number, enabled: boolean) => api.patch(`/api/scheduled-backups/${backupId}/toggle`, { enabled }),
};

// Git Configs
export const gitConfigApi = {
  list: () => api.get<GitConfig[]>('/api/git-configs'),
  get: (configId: number) => api.get<GitConfig>(`/api/git-configs/${configId}`),
  create: (data: CreateGitConfigRequest) => api.post<GitConfig>('/api/git-configs', data),
  update: (configId: number, data: CreateGitConfigRequest) => api.put<GitConfig>(`/api/git-configs/${configId}`, data),
  delete: (configId: number) => api.delete(`/api/git-configs/${configId}`),
  toggle: (configId: number, enabled: boolean) => api.patch(`/api/git-configs/${configId}/toggle`, { enabled }),
  sync: (configId: number) => api.post(`/api/git-configs/${configId}/sync`),
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

// File Permissions API
export const filePermissionApi = {
  // Get all restrictions for a server (owner only)
  list: (serverId: string) =>
    api.get<FileRestriction[]>(`/api/servers/${serverId}/file-permissions`),

  // Get restrictions for a specific collaborator (owner only)
  getForCollaborator: (serverId: string, userId: string) =>
    api.get<FileRestriction[]>(`/api/servers/${serverId}/file-permissions/collaborators/${userId}`),

  // Get current user's restrictions on a server
  getMyRestrictions: (serverId: string) =>
    api.get<FileRestriction[]>(`/api/servers/${serverId}/file-permissions/my-restrictions`),

  // Add a restriction (owner only)
  add: (serverId: string, data: CreateFileRestrictionRequest) =>
    api.post<FileRestriction>(`/api/servers/${serverId}/file-permissions`, data),

  // Remove a restriction (owner only)
  remove: (serverId: string, restrictionId: string) =>
    api.delete(`/api/servers/${serverId}/file-permissions/${restrictionId}`),

  // Check current user's access to a specific path
  checkAccess: (serverId: string, path: string) =>
    api.get<PathPermissions>(`/api/servers/${serverId}/file-permissions/check`, { params: { path } }),
};

// Plugin Alias API
export const pluginAliasApi = {
  // List all aliases for a server
  list: (serverId: string) =>
    api.get<PluginAlias[]>(`/api/servers/${serverId}/plugin-aliases`),

  // Create a new alias
  create: (serverId: string, data: CreatePluginAliasRequest) =>
    api.post<PluginAlias>(`/api/servers/${serverId}/plugin-aliases`, data),

  // Update an alias
  update: (serverId: string, aliasId: string, data: CreatePluginAliasRequest) =>
    api.put<PluginAlias>(`/api/servers/${serverId}/plugin-aliases/${aliasId}`, data),

  // Delete an alias
  delete: (serverId: string, aliasId: string) =>
    api.delete(`/api/servers/${serverId}/plugin-aliases/${aliasId}`),
};

// Audit Log API
export const auditLogApi = {
  // Get audit logs for a specific server
  getServerLogs: (serverId: string, page = 0, size = 50) =>
    api.get<PageResponse<AuditLog>>(`/api/audit-logs/servers/${serverId}`, { params: { page, size } }),

  // Get all user audit logs (optionally filtered by actions)
  getUserLogs: (page = 0, size = 50, actions?: AuditAction[]) =>
    api.get<PageResponse<AuditLog>>(`/api/audit-logs`, { params: { page, size, actions } }),

  // Get activity feed (recent logs)
  getActivityFeed: (limit = 50) =>
    api.get<AuditLog[]>(`/api/audit-logs/activity`, { params: { limit } }),

  // Get activity statistics
  getActivityStats: () =>
    api.get<{ actionsLast24Hours: number }>(`/api/audit-logs/activity/stats`),
};

// ============================================================================
// Admin APIs (require admin role)
// ============================================================================

// Admin Dashboard API
export const adminDashboardApi = {
  getStats: () =>
    api.get<AdminDashboardStats>('/api/admin/dashboard/stats'),

  getRevenue: () =>
    api.get<AdminRevenue>('/api/admin/dashboard/revenue'),
};

// Admin User Management API
export const adminUserApi = {
  list: (page = 0, size = 20, search?: string) =>
    api.get<AdminPageResponse<AdminUser>>('/api/admin/users', {
      params: { page, size, search },
    }),

  get: (userId: string) =>
    api.get<AdminUserDetail>(`/api/admin/users/${userId}`),

  suspend: (userId: string, data: SuspendUserRequest) =>
    api.post(`/api/admin/users/${userId}/suspend`, data),

  unsuspend: (userId: string) =>
    api.post(`/api/admin/users/${userId}/unsuspend`),

  delete: (userId: string) =>
    api.delete(`/api/admin/users/${userId}`),

  overridePlan: (userId: string, data: OverridePlanRequest) =>
    api.post(`/api/admin/users/${userId}/override-plan`, data),
};

// Admin Audit Log API
export const adminAuditLogApi = {
  list: (page = 0, size = 50, filters?: AdminAuditLogFilters) =>
    api.get<AdminPageResponse<AdminAuditLog>>('/api/admin/audit-logs', {
      params: {
        page,
        size,
        ...filters,
      },
    }),

  export: async (format: 'csv' | 'json', filters?: AdminAuditLogFilters): Promise<Blob> => {
    const response = await api.get('/api/admin/audit-logs/export', {
      params: {
        format,
        ...filters,
      },
      responseType: 'blob',
    });
    return response.data;
  },
};

// Admin Template Review API
export const adminTemplateApi = {
  list: (status: TemplateReviewStatus, page = 0, size = 20) =>
    api.get<AdminPageResponse<AdminTemplate>>('/api/admin/templates', {
      params: { status, page, size },
    }),

  approve: (templateId: string) =>
    api.post(`/api/admin/templates/${templateId}/approve`),

  reject: (templateId: string, data: RejectTemplateRequest) =>
    api.post(`/api/admin/templates/${templateId}/reject`, data),

  feature: (templateId: string, featured: boolean) =>
    api.patch(`/api/admin/templates/${templateId}/feature`, { featured }),
};

// ============================================================================
// P1: Admin Server Management API
// ============================================================================
export const adminServerApi = {
  list: (page = 0, size = 20, filters?: AdminServerFilters) =>
    api.get<AdminPageResponse<AdminServer>>('/api/admin/servers', {
      params: { page, size, ...filters },
    }),

  get: (serverId: string) =>
    api.get<AdminServerDetail>(`/api/admin/servers/${serverId}`),

  getStats: () =>
    api.get<AdminServerStats>('/api/admin/servers/stats'),

  disconnect: (serverId: string) =>
    api.post(`/api/admin/servers/${serverId}/disconnect`),

  regenerateToken: (serverId: string) =>
    api.post<{ token: string }>(`/api/admin/servers/${serverId}/regenerate-token`),

  delete: (serverId: string) =>
    api.delete(`/api/admin/servers/${serverId}`),
};

// ============================================================================
// P1: Admin Billing Oversight API
// ============================================================================
export const adminBillingApi = {
  listSubscriptions: (page = 0, size = 20, filters?: AdminSubscriptionFilters) =>
    api.get<AdminPageResponse<AdminSubscription>>('/api/admin/billing/subscriptions', {
      params: { page, size, ...filters },
    }),

  getSubscription: (subscriptionId: string) =>
    api.get<AdminSubscriptionDetail>(`/api/admin/billing/subscriptions/${subscriptionId}`),

  getStats: () =>
    api.get<AdminBillingStats>('/api/admin/billing/stats'),

  overridePlan: (subscriptionId: string, data: OverridePlanRequest) =>
    api.post(`/api/admin/billing/subscriptions/${subscriptionId}/override-plan`, data),

  cancelSubscription: (subscriptionId: string, data: CancelSubscriptionRequest) =>
    api.post(`/api/admin/billing/subscriptions/${subscriptionId}/cancel`, data),

  extendTrial: (subscriptionId: string, data: ExtendTrialRequest) =>
    api.post(`/api/admin/billing/subscriptions/${subscriptionId}/extend-trial`, data),
};

// ============================================================================
// P1: Admin Security & Access API
// ============================================================================
export const adminSecurityApi = {
  listApiKeys: (page = 0, size = 20, filters?: AdminApiKeyFilters) =>
    api.get<AdminPageResponse<AdminApiKey>>('/api/admin/security/api-keys', {
      params: { page, size, ...filters },
    }),

  getApiKey: (apiKeyId: number) =>
    api.get<AdminApiKeyDetail>(`/api/admin/security/api-keys/${apiKeyId}`),

  getStats: () =>
    api.get<AdminSecurityStats>('/api/admin/security/stats'),

  revokeApiKey: (apiKeyId: number) =>
    api.post(`/api/admin/security/api-keys/${apiKeyId}/revoke`),

  deleteApiKey: (apiKeyId: number) =>
    api.delete(`/api/admin/security/api-keys/${apiKeyId}`),

  getLoginHistory: (page = 0, size = 50, filters?: AdminLoginHistoryFilters) =>
    api.get<AdminPageResponse<AdminLoginHistory>>('/api/admin/security/login-history', {
      params: { page, size, ...filters },
    }),
};
