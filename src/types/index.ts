export interface User { id: string; email: string; emailVerified: boolean; userType: 'OWNER' | 'COLLABORATOR'; createdAt: string; }
export interface AuthResponse { accessToken: string; refreshToken: string; expiresIn: number; user: User; }
export interface Server { id: string; name: string; token: string; online: boolean; lastSeenAt: string | null; createdAt: string; groupName: string | null; notes: string | null; totalConnections: number; totalFileEdits: number; lastFileEditAt: string | null; ownerId: string; }
export interface ServerListItem { id: string; name: string; online: boolean; lastSeenAt: string | null; groupName: string | null; }
export interface UpdateServerRequest { name?: string; groupName?: string; notes?: string; }

// Server Collaborator types
export interface ServerCollaborator {
  id: string;
  serverId: string;
  userId: string;
  email: string;
  joinedAt: string;
}

export interface InviteCode {
  id: string;
  code: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
  usedAt: string | null;
}

export interface InviteCodeValidation {
  valid: boolean;
  serverName: string | null;
  expiresAt: string | null;
}

export interface CollaboratorUsage {
  currentCount: number;
  maxCount: number;
}

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
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE' | 'TRIALING' | 'TRIAL_EXPIRED';
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
  userId: string;
  plan: Plan;
  status: SubscriptionStatus;
  trialEndsAt: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  isTrialing: boolean;
  trialDaysRemaining: number | null;
  trialHoursRemaining: number | null;
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
  userType: 'OWNER' | 'COLLABORATOR';
  createdAt: string;
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

// Template Types
export interface Template {
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
  downloadCount: number;
  viewCount: number;
  averageRating: number | null;
  ratingCount: number;
  tags: string | null;
  minServerVersion: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  displayOrder: number;
  templateCount: number;
  createdAt: string;
}

export interface TemplateRating {
  id: string;
  templateId: string;
  userId: string;
  userEmail: string;
  score: number;
  review: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateVariable {
  id: string;
  templateId: string;
  name: string;
  displayName: string | null;
  description: string | null;
  defaultValue: string | null;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'SELECT' | 'MULTILINE';
  options: string | null;
  isRequired: boolean;
  displayOrder: number;
  placeholder: string | null;
  validationRegex: string | null;
}

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  pluginName: string;
  pluginVersion?: string;
  content: string;
  fileName?: string;
  categoryId?: string;
  isPublic: boolean;
  tags?: string;
  minServerVersion?: string;
}

export interface CreateRatingRequest {
  score: number;
  review?: string;
}

export interface CreateVariableRequest {
  name: string;
  displayName?: string;
  description?: string;
  defaultValue?: string;
  type?: string;
  options?: string;
  isRequired: boolean;
  displayOrder?: number;
  placeholder?: string;
  validationRegex?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// File Permission types
export type RestrictionType = 'READ_DENIED' | 'WRITE_DENIED';

export interface FileRestriction {
  id: string;
  serverId: string;
  collaboratorUserId: string;
  collaboratorEmail: string;
  pathPattern: string;
  restrictionType: RestrictionType;
  createdAt: string;
}

export interface CreateFileRestrictionRequest {
  collaboratorUserId: string;
  pathPattern: string;
  restrictionType: RestrictionType;
}

export interface PathPermissions {
  canRead: boolean;
  canWrite: boolean;
}

// Plugin Alias types
export interface PluginAlias {
  id: string;
  serverId: string;
  folderName: string;
  commandPrefix: string;
  createdAt: string;
}

export interface CreatePluginAliasRequest {
  folderName: string;
  commandPrefix: string;
}
