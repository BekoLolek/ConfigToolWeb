import { create } from 'zustand';
import { adminDashboardApi, adminUserApi, adminAuditLogApi, adminTemplateApi, adminServerApi, adminBillingApi, adminSecurityApi } from '../api/endpoints';
import type {
  AdminDashboardStats,
  AdminRevenue,
  AdminUser,
  AdminUserDetail,
  AdminAuditLog,
  AdminAuditLogFilters,
  AdminTemplate,
  TemplateReviewStatus,
  AdminPageResponse,
  // P1: Server Management Types
  AdminServer,
  AdminServerDetail,
  AdminServerStats,
  AdminServerFilters,
  // P1: Billing Types
  AdminSubscription,
  AdminSubscriptionDetail,
  AdminBillingStats,
  AdminSubscriptionFilters,
  // P1: Security Types
  AdminApiKey,
  AdminApiKeyDetail,
  AdminSecurityStats,
  AdminApiKeyFilters,
  AdminLoginHistory,
  AdminLoginHistoryFilters,
} from '../types/admin';
import type { Plan, SubscriptionStatus } from '../types';

interface AdminState {
  // Dashboard
  dashboardStats: AdminDashboardStats | null;
  revenue: AdminRevenue | null;
  loadingDashboard: boolean;

  // Users
  users: AdminUser[];
  usersTotal: number;
  usersPage: number;
  usersPageSize: number;
  selectedUser: AdminUserDetail | null;
  loadingUsers: boolean;
  loadingUserDetail: boolean;

  // Audit Logs
  auditLogs: AdminAuditLog[];
  auditLogsTotal: number;
  auditLogsPage: number;
  auditLogsPageSize: number;
  auditLogFilters: AdminAuditLogFilters;
  loadingAuditLogs: boolean;
  exportingAuditLogs: boolean;

  // Templates
  templates: AdminTemplate[];
  templatesTotal: number;
  templatesPage: number;
  templatesPageSize: number;
  templatesTab: TemplateReviewStatus;
  loadingTemplates: boolean;

  // P1: Servers
  servers: AdminServer[];
  serversTotal: number;
  serversPage: number;
  serversPageSize: number;
  serverFilters: AdminServerFilters;
  selectedServer: AdminServerDetail | null;
  serverStats: AdminServerStats | null;
  loadingServers: boolean;
  loadingServerDetail: boolean;

  // P1: Billing/Subscriptions
  subscriptions: AdminSubscription[];
  subscriptionsTotal: number;
  subscriptionsPage: number;
  subscriptionsPageSize: number;
  subscriptionFilters: AdminSubscriptionFilters;
  selectedSubscription: AdminSubscriptionDetail | null;
  billingStats: AdminBillingStats | null;
  loadingSubscriptions: boolean;
  loadingSubscriptionDetail: boolean;

  // P1: Security
  apiKeys: AdminApiKey[];
  apiKeysTotal: number;
  apiKeysPage: number;
  apiKeysPageSize: number;
  apiKeyFilters: AdminApiKeyFilters;
  selectedApiKey: AdminApiKeyDetail | null;
  securityStats: AdminSecurityStats | null;
  loginHistory: AdminLoginHistory[];
  loginHistoryTotal: number;
  loginHistoryPage: number;
  loginHistoryPageSize: number;
  loginHistoryFilters: AdminLoginHistoryFilters;
  loadingApiKeys: boolean;
  loadingApiKeyDetail: boolean;
  loadingLoginHistory: boolean;

  // Error state
  error: string | null;

  // Dashboard actions
  fetchDashboardStats: () => Promise<void>;
  fetchRevenue: () => Promise<void>;

  // User actions
  fetchUsers: (page?: number, size?: number, search?: string) => Promise<void>;
  fetchUserDetail: (userId: string) => Promise<void>;
  suspendUser: (userId: string, reason: string) => Promise<void>;
  unsuspendUser: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  overridePlan: (userId: string, plan: Plan, reason: string) => Promise<void>;
  clearSelectedUser: () => void;

  // Audit log actions
  fetchAuditLogs: (page?: number, size?: number, filters?: AdminAuditLogFilters) => Promise<void>;
  setAuditLogFilters: (filters: AdminAuditLogFilters) => void;
  exportAuditLogs: (format: 'csv' | 'json') => Promise<Blob>;

  // Template actions
  fetchTemplates: (status?: TemplateReviewStatus, page?: number, size?: number) => Promise<void>;
  setTemplatesTab: (tab: TemplateReviewStatus) => void;
  approveTemplate: (templateId: string) => Promise<void>;
  rejectTemplate: (templateId: string, reason: string) => Promise<void>;
  featureTemplate: (templateId: string, featured: boolean) => Promise<void>;

  // P1: Server actions
  fetchServers: (page?: number, size?: number, filters?: AdminServerFilters) => Promise<void>;
  fetchServerDetail: (serverId: string) => Promise<void>;
  fetchServerStats: () => Promise<void>;
  setServerFilters: (filters: AdminServerFilters) => void;
  disconnectServer: (serverId: string) => Promise<void>;
  regenerateServerToken: (serverId: string) => Promise<string>;
  deleteServer: (serverId: string) => Promise<void>;
  clearSelectedServer: () => void;

  // P1: Billing actions
  fetchSubscriptions: (page?: number, size?: number, filters?: AdminSubscriptionFilters) => Promise<void>;
  fetchSubscriptionDetail: (subscriptionId: string) => Promise<void>;
  fetchBillingStats: () => Promise<void>;
  setSubscriptionFilters: (filters: AdminSubscriptionFilters) => void;
  overrideSubscriptionPlan: (subscriptionId: string, plan: Plan, reason: string) => Promise<void>;
  cancelSubscription: (subscriptionId: string, reason: string, immediate?: boolean) => Promise<void>;
  extendTrial: (subscriptionId: string, days: number, reason: string) => Promise<void>;
  clearSelectedSubscription: () => void;

  // P1: Security actions
  fetchApiKeys: (page?: number, size?: number, filters?: AdminApiKeyFilters) => Promise<void>;
  fetchApiKeyDetail: (apiKeyId: number) => Promise<void>;
  fetchSecurityStats: () => Promise<void>;
  setApiKeyFilters: (filters: AdminApiKeyFilters) => void;
  revokeApiKey: (apiKeyId: number) => Promise<void>;
  deleteApiKey: (apiKeyId: number) => Promise<void>;
  clearSelectedApiKey: () => void;
  fetchLoginHistory: (page?: number, size?: number, filters?: AdminLoginHistoryFilters) => Promise<void>;
  setLoginHistoryFilters: (filters: AdminLoginHistoryFilters) => void;

  // General
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  // Dashboard
  dashboardStats: null,
  revenue: null,
  loadingDashboard: false,

  // Users
  users: [],
  usersTotal: 0,
  usersPage: 0,
  usersPageSize: 20,
  selectedUser: null,
  loadingUsers: false,
  loadingUserDetail: false,

  // Audit Logs
  auditLogs: [],
  auditLogsTotal: 0,
  auditLogsPage: 0,
  auditLogsPageSize: 50,
  auditLogFilters: {},
  loadingAuditLogs: false,
  exportingAuditLogs: false,

  // Templates
  templates: [],
  templatesTotal: 0,
  templatesPage: 0,
  templatesPageSize: 20,
  templatesTab: 'PENDING' as TemplateReviewStatus,
  loadingTemplates: false,

  // P1: Servers
  servers: [] as AdminServer[],
  serversTotal: 0,
  serversPage: 0,
  serversPageSize: 20,
  serverFilters: {} as AdminServerFilters,
  selectedServer: null as AdminServerDetail | null,
  serverStats: null as AdminServerStats | null,
  loadingServers: false,
  loadingServerDetail: false,

  // P1: Billing/Subscriptions
  subscriptions: [] as AdminSubscription[],
  subscriptionsTotal: 0,
  subscriptionsPage: 0,
  subscriptionsPageSize: 20,
  subscriptionFilters: {} as AdminSubscriptionFilters,
  selectedSubscription: null as AdminSubscriptionDetail | null,
  billingStats: null as AdminBillingStats | null,
  loadingSubscriptions: false,
  loadingSubscriptionDetail: false,

  // P1: Security
  apiKeys: [] as AdminApiKey[],
  apiKeysTotal: 0,
  apiKeysPage: 0,
  apiKeysPageSize: 20,
  apiKeyFilters: {} as AdminApiKeyFilters,
  selectedApiKey: null as AdminApiKeyDetail | null,
  securityStats: null as AdminSecurityStats | null,
  loginHistory: [] as AdminLoginHistory[],
  loginHistoryTotal: 0,
  loginHistoryPage: 0,
  loginHistoryPageSize: 50,
  loginHistoryFilters: {} as AdminLoginHistoryFilters,
  loadingApiKeys: false,
  loadingApiKeyDetail: false,
  loadingLoginHistory: false,

  // Error
  error: null,
};

export const useAdminStore = create<AdminState>((set, get) => ({
  ...initialState,

  // Dashboard actions
  fetchDashboardStats: async () => {
    set({ loadingDashboard: true, error: null });
    try {
      const { data } = await adminDashboardApi.getStats();
      set({ dashboardStats: data, loadingDashboard: false });
    } catch (err: any) {
      set({
        loadingDashboard: false,
        error: err.response?.data?.message || 'Failed to fetch dashboard stats',
      });
    }
  },

  fetchRevenue: async () => {
    set({ loadingDashboard: true, error: null });
    try {
      const { data } = await adminDashboardApi.getRevenue();
      set({ revenue: data, loadingDashboard: false });
    } catch (err: any) {
      set({
        loadingDashboard: false,
        error: err.response?.data?.message || 'Failed to fetch revenue data',
      });
    }
  },

  // User actions
  fetchUsers: async (page = 0, size = 20, search?: string) => {
    set({ loadingUsers: true, error: null });
    try {
      const { data } = await adminUserApi.list(page, size, search);
      set({
        users: data.content,
        usersTotal: data.totalElements,
        usersPage: data.number,
        usersPageSize: data.size,
        loadingUsers: false,
      });
    } catch (err: any) {
      set({
        loadingUsers: false,
        error: err.response?.data?.message || 'Failed to fetch users',
      });
    }
  },

  fetchUserDetail: async (userId: string) => {
    set({ loadingUserDetail: true, error: null });
    try {
      const { data } = await adminUserApi.get(userId);
      set({ selectedUser: data, loadingUserDetail: false });
    } catch (err: any) {
      set({
        loadingUserDetail: false,
        error: err.response?.data?.message || 'Failed to fetch user details',
      });
    }
  },

  suspendUser: async (userId: string, reason: string) => {
    set({ error: null });
    try {
      await adminUserApi.suspend(userId, { reason });
      // Refresh users list
      const { usersPage, usersPageSize } = get();
      await get().fetchUsers(usersPage, usersPageSize);
      // If we have a selected user, refresh that too
      if (get().selectedUser?.id === userId) {
        await get().fetchUserDetail(userId);
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to suspend user' });
      throw err;
    }
  },

  unsuspendUser: async (userId: string) => {
    set({ error: null });
    try {
      await adminUserApi.unsuspend(userId);
      // Refresh users list
      const { usersPage, usersPageSize } = get();
      await get().fetchUsers(usersPage, usersPageSize);
      // If we have a selected user, refresh that too
      if (get().selectedUser?.id === userId) {
        await get().fetchUserDetail(userId);
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to unsuspend user' });
      throw err;
    }
  },

  deleteUser: async (userId: string) => {
    set({ error: null });
    try {
      await adminUserApi.delete(userId);
      // Refresh users list
      const { usersPage, usersPageSize } = get();
      await get().fetchUsers(usersPage, usersPageSize);
      // Clear selected user if it was deleted
      if (get().selectedUser?.id === userId) {
        set({ selectedUser: null });
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to delete user' });
      throw err;
    }
  },

  overridePlan: async (userId: string, plan: Plan, reason: string) => {
    set({ error: null });
    try {
      await adminUserApi.overridePlan(userId, { plan, reason });
      // Refresh users list
      const { usersPage, usersPageSize } = get();
      await get().fetchUsers(usersPage, usersPageSize);
      // If we have a selected user, refresh that too
      if (get().selectedUser?.id === userId) {
        await get().fetchUserDetail(userId);
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to override plan' });
      throw err;
    }
  },

  clearSelectedUser: () => set({ selectedUser: null }),

  // Audit log actions
  fetchAuditLogs: async (page = 0, size = 50, filters?: AdminAuditLogFilters) => {
    set({ loadingAuditLogs: true, error: null });
    const currentFilters = filters || get().auditLogFilters;
    try {
      const { data } = await adminAuditLogApi.list(page, size, currentFilters);
      set({
        auditLogs: data.content,
        auditLogsTotal: data.totalElements,
        auditLogsPage: data.number,
        auditLogsPageSize: data.size,
        auditLogFilters: currentFilters,
        loadingAuditLogs: false,
      });
    } catch (err: any) {
      set({
        loadingAuditLogs: false,
        error: err.response?.data?.message || 'Failed to fetch audit logs',
      });
    }
  },

  setAuditLogFilters: (filters: AdminAuditLogFilters) => {
    set({ auditLogFilters: filters });
  },

  exportAuditLogs: async (format: 'csv' | 'json') => {
    set({ exportingAuditLogs: true, error: null });
    try {
      const { auditLogFilters } = get();
      const blob = await adminAuditLogApi.export(format, auditLogFilters);
      set({ exportingAuditLogs: false });
      return blob;
    } catch (err: any) {
      set({
        exportingAuditLogs: false,
        error: err.response?.data?.message || 'Failed to export audit logs',
      });
      throw err;
    }
  },

  // Template actions
  fetchTemplates: async (status?: TemplateReviewStatus, page = 0, size = 20) => {
    set({ loadingTemplates: true, error: null });
    const currentTab = status || get().templatesTab;
    try {
      const { data } = await adminTemplateApi.list(currentTab, page, size);
      set({
        templates: data.content,
        templatesTotal: data.totalElements,
        templatesPage: data.number,
        templatesPageSize: data.size,
        templatesTab: currentTab,
        loadingTemplates: false,
      });
    } catch (err: any) {
      set({
        loadingTemplates: false,
        error: err.response?.data?.message || 'Failed to fetch templates',
      });
    }
  },

  setTemplatesTab: (tab: TemplateReviewStatus) => {
    set({ templatesTab: tab });
    get().fetchTemplates(tab);
  },

  approveTemplate: async (templateId: string) => {
    set({ error: null });
    try {
      await adminTemplateApi.approve(templateId);
      // Refresh templates list
      const { templatesTab, templatesPage, templatesPageSize } = get();
      await get().fetchTemplates(templatesTab, templatesPage, templatesPageSize);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to approve template' });
      throw err;
    }
  },

  rejectTemplate: async (templateId: string, reason: string) => {
    set({ error: null });
    try {
      await adminTemplateApi.reject(templateId, { reason });
      // Refresh templates list
      const { templatesTab, templatesPage, templatesPageSize } = get();
      await get().fetchTemplates(templatesTab, templatesPage, templatesPageSize);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to reject template' });
      throw err;
    }
  },

  featureTemplate: async (templateId: string, featured: boolean) => {
    set({ error: null });
    try {
      await adminTemplateApi.feature(templateId, featured);
      // Refresh templates list
      const { templatesTab, templatesPage, templatesPageSize } = get();
      await get().fetchTemplates(templatesTab, templatesPage, templatesPageSize);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to update template feature status' });
      throw err;
    }
  },

  // ============================================================================
  // P1: Server Management Actions
  // ============================================================================
  fetchServers: async (page = 0, size = 20, filters?: AdminServerFilters) => {
    set({ loadingServers: true, error: null });
    const currentFilters = filters || get().serverFilters;
    try {
      const { data } = await adminServerApi.list(page, size, currentFilters);
      set({
        servers: data.content,
        serversTotal: data.totalElements,
        serversPage: data.number,
        serversPageSize: data.size,
        serverFilters: currentFilters,
        loadingServers: false,
      });
    } catch (err: any) {
      set({
        loadingServers: false,
        error: err.response?.data?.message || 'Failed to fetch servers',
      });
    }
  },

  fetchServerDetail: async (serverId: string) => {
    set({ loadingServerDetail: true, error: null });
    try {
      const { data } = await adminServerApi.get(serverId);
      set({ selectedServer: data, loadingServerDetail: false });
    } catch (err: any) {
      set({
        loadingServerDetail: false,
        error: err.response?.data?.message || 'Failed to fetch server details',
      });
    }
  },

  fetchServerStats: async () => {
    set({ error: null });
    try {
      const { data } = await adminServerApi.getStats();
      set({ serverStats: data });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch server stats' });
    }
  },

  setServerFilters: (filters: AdminServerFilters) => {
    set({ serverFilters: filters });
  },

  disconnectServer: async (serverId: string) => {
    set({ error: null });
    try {
      await adminServerApi.disconnect(serverId);
      // Refresh servers list
      const { serversPage, serversPageSize, serverFilters } = get();
      await get().fetchServers(serversPage, serversPageSize, serverFilters);
      // If we have a selected server, refresh that too
      if (get().selectedServer?.id === serverId) {
        await get().fetchServerDetail(serverId);
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to disconnect server' });
      throw err;
    }
  },

  regenerateServerToken: async (serverId: string) => {
    set({ error: null });
    try {
      const { data } = await adminServerApi.regenerateToken(serverId);
      // If we have a selected server, refresh that too
      if (get().selectedServer?.id === serverId) {
        await get().fetchServerDetail(serverId);
      }
      return data.token;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to regenerate server token' });
      throw err;
    }
  },

  deleteServer: async (serverId: string) => {
    set({ error: null });
    try {
      await adminServerApi.delete(serverId);
      // Refresh servers list
      const { serversPage, serversPageSize, serverFilters } = get();
      await get().fetchServers(serversPage, serversPageSize, serverFilters);
      // Clear selected server if it was deleted
      if (get().selectedServer?.id === serverId) {
        set({ selectedServer: null });
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to delete server' });
      throw err;
    }
  },

  clearSelectedServer: () => set({ selectedServer: null }),

  // ============================================================================
  // P1: Billing Management Actions
  // ============================================================================
  fetchSubscriptions: async (page = 0, size = 20, filters?: AdminSubscriptionFilters) => {
    set({ loadingSubscriptions: true, error: null });
    const currentFilters = filters || get().subscriptionFilters;
    try {
      const { data } = await adminBillingApi.listSubscriptions(page, size, currentFilters);
      set({
        subscriptions: data.content,
        subscriptionsTotal: data.totalElements,
        subscriptionsPage: data.number,
        subscriptionsPageSize: data.size,
        subscriptionFilters: currentFilters,
        loadingSubscriptions: false,
      });
    } catch (err: any) {
      set({
        loadingSubscriptions: false,
        error: err.response?.data?.message || 'Failed to fetch subscriptions',
      });
    }
  },

  fetchSubscriptionDetail: async (subscriptionId: string) => {
    set({ loadingSubscriptionDetail: true, error: null });
    try {
      const { data } = await adminBillingApi.getSubscription(subscriptionId);
      set({ selectedSubscription: data, loadingSubscriptionDetail: false });
    } catch (err: any) {
      set({
        loadingSubscriptionDetail: false,
        error: err.response?.data?.message || 'Failed to fetch subscription details',
      });
    }
  },

  fetchBillingStats: async () => {
    set({ error: null });
    try {
      const { data } = await adminBillingApi.getStats();
      set({ billingStats: data });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch billing stats' });
    }
  },

  setSubscriptionFilters: (filters: AdminSubscriptionFilters) => {
    set({ subscriptionFilters: filters });
  },

  overrideSubscriptionPlan: async (subscriptionId: string, plan: Plan, reason: string) => {
    set({ error: null });
    try {
      await adminBillingApi.overridePlan(subscriptionId, { plan, reason });
      // Refresh subscriptions list
      const { subscriptionsPage, subscriptionsPageSize, subscriptionFilters } = get();
      await get().fetchSubscriptions(subscriptionsPage, subscriptionsPageSize, subscriptionFilters);
      // If we have a selected subscription, refresh that too
      if (get().selectedSubscription?.id === subscriptionId) {
        await get().fetchSubscriptionDetail(subscriptionId);
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to override subscription plan' });
      throw err;
    }
  },

  cancelSubscription: async (subscriptionId: string, reason: string, immediate = false) => {
    set({ error: null });
    try {
      await adminBillingApi.cancelSubscription(subscriptionId, { reason, immediate });
      // Refresh subscriptions list
      const { subscriptionsPage, subscriptionsPageSize, subscriptionFilters } = get();
      await get().fetchSubscriptions(subscriptionsPage, subscriptionsPageSize, subscriptionFilters);
      // If we have a selected subscription, refresh that too
      if (get().selectedSubscription?.id === subscriptionId) {
        await get().fetchSubscriptionDetail(subscriptionId);
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to cancel subscription' });
      throw err;
    }
  },

  extendTrial: async (subscriptionId: string, days: number, reason: string) => {
    set({ error: null });
    try {
      await adminBillingApi.extendTrial(subscriptionId, { days, reason });
      // Refresh subscriptions list
      const { subscriptionsPage, subscriptionsPageSize, subscriptionFilters } = get();
      await get().fetchSubscriptions(subscriptionsPage, subscriptionsPageSize, subscriptionFilters);
      // If we have a selected subscription, refresh that too
      if (get().selectedSubscription?.id === subscriptionId) {
        await get().fetchSubscriptionDetail(subscriptionId);
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to extend trial' });
      throw err;
    }
  },

  clearSelectedSubscription: () => set({ selectedSubscription: null }),

  // ============================================================================
  // P1: Security Management Actions
  // ============================================================================
  fetchApiKeys: async (page = 0, size = 20, filters?: AdminApiKeyFilters) => {
    set({ loadingApiKeys: true, error: null });
    const currentFilters = filters || get().apiKeyFilters;
    try {
      const { data } = await adminSecurityApi.listApiKeys(page, size, currentFilters);
      set({
        apiKeys: data.content,
        apiKeysTotal: data.totalElements,
        apiKeysPage: data.number,
        apiKeysPageSize: data.size,
        apiKeyFilters: currentFilters,
        loadingApiKeys: false,
      });
    } catch (err: any) {
      set({
        loadingApiKeys: false,
        error: err.response?.data?.message || 'Failed to fetch API keys',
      });
    }
  },

  fetchApiKeyDetail: async (apiKeyId: number) => {
    set({ loadingApiKeyDetail: true, error: null });
    try {
      const { data } = await adminSecurityApi.getApiKey(apiKeyId);
      set({ selectedApiKey: data, loadingApiKeyDetail: false });
    } catch (err: any) {
      set({
        loadingApiKeyDetail: false,
        error: err.response?.data?.message || 'Failed to fetch API key details',
      });
    }
  },

  fetchSecurityStats: async () => {
    set({ error: null });
    try {
      const { data } = await adminSecurityApi.getStats();
      set({ securityStats: data });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch security stats' });
    }
  },

  setApiKeyFilters: (filters: AdminApiKeyFilters) => {
    set({ apiKeyFilters: filters });
  },

  revokeApiKey: async (apiKeyId: number) => {
    set({ error: null });
    try {
      await adminSecurityApi.revokeApiKey(apiKeyId);
      // Refresh API keys list
      const { apiKeysPage, apiKeysPageSize, apiKeyFilters } = get();
      await get().fetchApiKeys(apiKeysPage, apiKeysPageSize, apiKeyFilters);
      // If we have a selected API key, refresh that too
      if (get().selectedApiKey?.id === apiKeyId) {
        await get().fetchApiKeyDetail(apiKeyId);
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to revoke API key' });
      throw err;
    }
  },

  deleteApiKey: async (apiKeyId: number) => {
    set({ error: null });
    try {
      await adminSecurityApi.deleteApiKey(apiKeyId);
      // Refresh API keys list
      const { apiKeysPage, apiKeysPageSize, apiKeyFilters } = get();
      await get().fetchApiKeys(apiKeysPage, apiKeysPageSize, apiKeyFilters);
      // Clear selected API key if it was deleted
      if (get().selectedApiKey?.id === apiKeyId) {
        set({ selectedApiKey: null });
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to delete API key' });
      throw err;
    }
  },

  clearSelectedApiKey: () => set({ selectedApiKey: null }),

  fetchLoginHistory: async (page = 0, size = 50, filters?: AdminLoginHistoryFilters) => {
    set({ loadingLoginHistory: true, error: null });
    const currentFilters = filters || get().loginHistoryFilters;
    try {
      const { data } = await adminSecurityApi.getLoginHistory(page, size, currentFilters);
      set({
        loginHistory: data.content,
        loginHistoryTotal: data.totalElements,
        loginHistoryPage: data.number,
        loginHistoryPageSize: data.size,
        loginHistoryFilters: currentFilters,
        loadingLoginHistory: false,
      });
    } catch (err: any) {
      set({
        loadingLoginHistory: false,
        error: err.response?.data?.message || 'Failed to fetch login history',
      });
    }
  },

  setLoginHistoryFilters: (filters: AdminLoginHistoryFilters) => {
    set({ loginHistoryFilters: filters });
  },

  // General
  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));
