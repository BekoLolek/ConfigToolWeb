import type { Plan, SubscriptionStatus, AuditAction } from './index';

// Admin Dashboard Types
export interface AdminDashboardStats {
  totalUsers: number;
  totalServers: number;
  onlineServers: number;
  activeSubscriptions: number;
  mrr: number; // Monthly Recurring Revenue in cents
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

export interface RevenueByPlan {
  plan: Plan;
  subscriptionCount: number;
  revenue: number; // in cents
  percentage: number;
}

export interface AdminRevenue {
  totalMrr: number;
  totalArr: number; // Annual Recurring Revenue
  byPlan: RevenueByPlan[];
}

// Admin User Types
export type AdminUserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export interface AdminUser {
  id: string;
  email: string;
  emailVerified: boolean;
  userType: 'OWNER' | 'COLLABORATOR';
  status: AdminUserStatus;
  plan: Plan;
  subscriptionStatus: SubscriptionStatus | null;
  serverCount: number;
  lastActiveAt: string | null;
  createdAt: string;
  suspendedAt: string | null;
  suspendedReason: string | null;
}

export interface AdminUserDetail extends AdminUser {
  stripeCustomerId: string | null;
  totalVersionsCreated: number;
  totalFileEdits: number;
  collaboratorsCount: number;
  apiKeysCount: number;
  webhooksCount: number;
  servers: AdminUserServer[];
}

export interface AdminUserServer {
  id: string;
  name: string;
  online: boolean;
  lastSeenAt: string | null;
  totalConnections: number;
  totalFileEdits: number;
  createdAt: string;
}

// Admin Audit Log Types
export interface AdminAuditLog {
  id: string;
  userId: string | null;
  userEmail: string | null;
  action: AuditAction | string; // string for admin-specific actions
  actionDescription: string;
  targetType: string | null;
  targetId: string | null;
  targetName: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  details: string | null;
  createdAt: string;
}

export interface AdminAuditLogFilters {
  userId?: string;
  userEmail?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  ipAddress?: string;
}

// Admin Template Types
export type TemplateReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AdminTemplate {
  id: string;
  name: string;
  description: string | null;
  pluginName: string;
  pluginVersion: string | null;
  content: string | null;
  fileName: string;
  authorId: string;
  authorEmail: string;
  categoryId: string | null;
  categoryName: string | null;
  isPublic: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  reviewStatus: TemplateReviewStatus;
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
  downloadCount: number;
  viewCount: number;
  averageRating: number | null;
  ratingCount: number;
  tags: string | null;
  createdAt: string;
  updatedAt: string;
}

// Admin Action Requests
export interface SuspendUserRequest {
  reason: string;
}

export interface OverridePlanRequest {
  plan: Plan;
  reason: string;
}

export interface RejectTemplateRequest {
  reason: string;
}

// Paginated response for admin endpoints
export interface AdminPageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Export format for audit logs
export type ExportFormat = 'csv' | 'json';
