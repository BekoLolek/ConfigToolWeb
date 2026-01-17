import { create } from 'zustand';
import { adminDashboardApi, adminUserApi, adminAuditLogApi, adminTemplateApi } from '../api/endpoints';
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
} from '../types/admin';
import type { Plan } from '../types';

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

  // General
  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));
