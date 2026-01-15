export interface User { id: string; email: string; emailVerified: boolean; createdAt: string; }
export interface AuthResponse { accessToken: string; refreshToken: string; expiresIn: number; user: User; }
export interface Server { id: string; name: string; token: string; online: boolean; lastSeenAt: string | null; createdAt: string; groupName: string | null; notes: string | null; totalConnections: number; totalFileEdits: number; lastFileEditAt: string | null; }
export interface ServerListItem { id: string; name: string; online: boolean; lastSeenAt: string | null; groupName: string | null; }
export interface UpdateServerRequest { name?: string; groupName?: string; notes?: string; }
export interface FileInfo { path: string; name: string; isDirectory: boolean; size: number; }
export interface FileListResponse { files: FileInfo[]; total: number; offset: number; hasMore: boolean; }
export interface FileContent { path: string; content: string; lastModified: string; }
export interface Version { id: string; message: string | null; createdBy: string | null; createdAt: string; }
export interface VersionDetail extends Version { content: string; }
export interface SearchMatch { line: number; content: string; }
export interface SearchResult { filePath: string; matches: SearchMatch[]; }
export interface FileChange {
  path: string;
  fileName: string;
  versionsCount: number;
  latestChange: string;
  rollbackToVersionId: string; // version ID to rollback to (before the selected date)
}

// Billing types
export type Plan = 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE';
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE' | 'TRIALING';
export type InvoiceStatus = 'DRAFT' | 'OPEN' | 'PAID' | 'VOID' | 'UNCOLLECTIBLE';

export interface PlanPricing {
  plan: Plan;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  maxServers: number;
  maxMembers: number;
  versionRetentionDays: number;
  maxVersionsPerFile: number;
  features: string[];
}

export interface Subscription {
  id: string;
  organizationId: string;
  plan: Plan;
  status: SubscriptionStatus;
  trialEndsAt: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

export interface Invoice {
  id: string;
  stripeInvoiceId: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  status: InvoiceStatus;
  invoiceUrl: string | null;
  invoicePdf: string | null;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  cardBrand: string;
  cardLast4: string;
  cardExpMonth: number;
  cardExpYear: number;
  isDefault: boolean;
}

export interface Usage {
  currentServers: number;
  maxServers: number;
  currentMembers: number;
  maxMembers: number;
  currentVersionsCount: number;
  maxVersionsPerFile: number;
  versionRetentionDays: number;
  plan: Plan;
}

export interface BillingPortalResponse {
  url: string;
}

// User types
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserProfile {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  defaultOrganizationId?: string;
  defaultOrganizationName?: string;
}
