export interface User { id: string; email: string; emailVerified: boolean; createdAt: string; defaultOrganizationId?: string; }
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

// API Key types
export interface ApiKey {
  id: number;
  name: string;
  keyPrefix: string;
  scopes: string[];
  requestCount: number;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  createdByEmail: string | null;
}

export interface CreateApiKeyRequest {
  name: string;
  scopes?: string[];
  expiresInDays?: number;
}

export interface CreateApiKeyResponse {
  key: string;
  apiKey: ApiKey;
}

// Webhook types
export type WebhookType = 'DISCORD' | 'SLACK' | 'CUSTOM' | 'EMAIL';

export type WebhookEventType =
  | 'SERVER_ONLINE' | 'SERVER_OFFLINE' | 'SERVER_CREATED' | 'SERVER_DELETED'
  | 'FILE_CREATED' | 'FILE_UPDATED' | 'FILE_DELETED' | 'FILE_RESTORED'
  | 'MEMBER_INVITED' | 'MEMBER_JOINED' | 'MEMBER_REMOVED' | 'MEMBER_ROLE_CHANGED'
  | 'SUBSCRIPTION_CREATED' | 'SUBSCRIPTION_CANCELED' | 'PAYMENT_SUCCEEDED' | 'PAYMENT_FAILED'
  | 'BACKUP_COMPLETED' | 'BACKUP_FAILED';

export interface Webhook {
  id: number;
  name: string;
  url: string;
  type: WebhookType;
  events: WebhookEventType[];
  active: boolean;
  deliverySuccessCount: number;
  deliveryFailureCount: number;
  successRate: number;
  lastTriggeredAt: string | null;
  lastFailureAt: string | null;
  lastFailureReason: string | null;
  createdAt: string;
  createdByEmail: string | null;
}

export interface CreateWebhookRequest {
  name: string;
  url: string;
  type: WebhookType;
  events: WebhookEventType[];
  secretToken?: string;
}

// Scheduled Backup types
export type BackupStatus = 'SUCCESS' | 'FAILED' | 'NEVER_RUN';

export interface ScheduledBackup {
  id: number;
  serverId: string;
  serverName: string;
  name: string;
  cronExpression: string;
  retentionDays: number;
  enabled: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
  lastStatus: BackupStatus;
  lastError: string | null;
  createdAt: string;
}

export interface CreateScheduledBackupRequest {
  serverId: string;
  name: string;
  cronExpression: string;
  retentionDays?: number;
  enabled?: boolean;
}

// Git Config types
export type GitSyncStatus = 'SUCCESS' | 'FAILED' | 'NEVER_SYNCED';

export interface GitConfig {
  id: number;
  serverId: string | null;
  serverName: string | null;
  repositoryUrl: string;
  branch: string;
  directoryPath: string | null;
  hasAuthToken: boolean;
  enabled: boolean;
  lastSyncAt: string | null;
  lastSyncStatus: GitSyncStatus;
  lastSyncError: string | null;
  createdAt: string;
}

export interface CreateGitConfigRequest {
  serverId?: string;
  repositoryUrl: string;
  branch: string;
  directoryPath?: string;
  authToken?: string;
}
