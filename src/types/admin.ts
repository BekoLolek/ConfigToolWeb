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

// ============================================================================
// P1: Admin Server Management Types
// ============================================================================

export interface AdminServer {
  id: string;
  name: string;
  online: boolean;
  ownerId: string;
  ownerEmail: string;
  groupName: string | null;
  notes: string | null;
  lastSeenAt: string | null;
  totalConnections: number;
  totalFileEdits: number;
  lastFileEditAt: string | null;
  collaboratorCount: number;
  createdAt: string;
}

export interface AdminServerDetail extends AdminServer {
  token: string;
  configFilesCount: number;
  versionsCount: number;
  collaborators: AdminServerCollaborator[];
}

export interface AdminServerCollaborator {
  id: string;
  userId: string;
  email: string;
  joinedAt: string;
}

export interface AdminServerStats {
  totalServers: number;
  onlineServers: number;
  offlineServers: number;
  newServersToday: number;
  newServersThisWeek: number;
  averageConnectionsPerServer: number;
}

export interface AdminServerFilters {
  ownerId?: string;
  ownerEmail?: string;
  online?: boolean;
  search?: string;
}

// ============================================================================
// P1: Admin Billing Oversight Types
// ============================================================================

export interface AdminSubscription {
  id: string;
  userId: string;
  userEmail: string;
  plan: Plan;
  pendingPlan: Plan | null;
  pendingPlanEffectiveDate: string | null;
  status: SubscriptionStatus;
  stripeSubscriptionId: string | null;
  trialEndsAt: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  isTrialing: boolean;
  trialDaysRemaining: number | null;
}

export interface AdminSubscriptionDetail extends AdminSubscription {
  stripeCustomerId: string | null;
  serverCount: number;
  collaboratorCount: number;
  totalPaymentsAmount: number;
  lastPaymentAt: string | null;
  invoices: AdminInvoice[];
}

export interface AdminInvoice {
  id: string;
  stripeInvoiceId: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  status: string;
  invoiceUrl: string | null;
  invoicePdf: string | null;
  createdAt: string;
}

export interface AdminBillingStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  trialingSubscriptions: number;
  canceledSubscriptions: number;
  mrr: number;
  arr: number;
  totalRevenue: number;
  averageRevenuePerUser: number;
}

export interface AdminSubscriptionFilters {
  userId?: string;
  userEmail?: string;
  status?: SubscriptionStatus;
  plan?: Plan;
}

export interface ExtendTrialRequest {
  days: number;
  reason: string;
}

export interface CancelSubscriptionRequest {
  reason: string;
  immediate?: boolean;
}

// ============================================================================
// P1: Admin Security & Access Types
// ============================================================================

export interface AdminApiKey {
  id: number;
  name: string;
  keyPrefix: string;
  userId: string;
  userEmail: string;
  scopes: string[];
  requestCount: number;
  lastUsedAt: string | null;
  lastUsedIp: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export interface AdminApiKeyDetail extends AdminApiKey {
  recentRequests: AdminApiKeyRequest[];
}

export interface AdminApiKeyRequest {
  id: string;
  endpoint: string;
  method: string;
  statusCode: number;
  ipAddress: string | null;
  userAgent: string | null;
  responseTime: number;
  createdAt: string;
}

export interface AdminLoginHistory {
  id: string;
  userId: string;
  userEmail: string;
  ipAddress: string | null;
  userAgent: string | null;
  success: boolean;
  failureReason: string | null;
  createdAt: string;
}

export interface AdminSecurityStats {
  totalApiKeys: number;
  activeApiKeys: number;
  revokedApiKeys: number;
  expiredApiKeys: number;
  totalApiRequests24h: number;
  failedLogins24h: number;
  successfulLogins24h: number;
  uniqueIps24h: number;
}

export interface AdminApiKeyFilters {
  userId?: string;
  userEmail?: string;
  revoked?: boolean;
  expired?: boolean;
}

export interface AdminLoginHistoryFilters {
  userId?: string;
  userEmail?: string;
  success?: boolean;
  ipAddress?: string;
  startDate?: string;
  endDate?: string;
}
