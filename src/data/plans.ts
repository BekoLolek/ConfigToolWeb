// Plan types matching backend
export type Plan = 'PRO' | 'TEAM' | 'ENTERPRISE';

export interface PlanDetails {
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  maxServers: number;
  maxMembers: number;
  versionRetentionDays: number;
  maxVersionsPerFile: number;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

// Trial: 7-day free trial of TEAM plan for new users
export const TRIAL_DAYS = 7;
export const TRIAL_PLAN: Plan = 'TEAM';

export const PLANS: Record<Plan, PlanDetails> = {
  PRO: {
    name: 'Pro',
    description: 'For individual server administrators',
    priceMonthly: 799,
    priceYearly: 7990,
    maxServers: 5,
    maxMembers: 2,
    versionRetentionDays: 14,
    maxVersionsPerFile: 30,
    features: [
      'Up to 5 servers',
      '2 team members',
      '14 days version history',
      'Template library',
      'Global search',
      'Audit logging',
      'Email support',
    ],
  },
  TEAM: {
    name: 'Team',
    description: 'For networks and organizations',
    priceMonthly: 1999,
    priceYearly: 19990,
    maxServers: 20,
    maxMembers: 10,
    versionRetentionDays: 30,
    maxVersionsPerFile: 60,
    features: [
      'Up to 20 servers',
      '10 team members',
      '30 days version history',
      'Scheduled backups',
      'Git sync',
      'Webhooks & API keys',
      'Priority support',
    ],
    highlighted: true,
    badge: 'Popular',
  },
  ENTERPRISE: {
    name: 'Enterprise',
    description: 'For large-scale deployments',
    priceMonthly: -1,
    priceYearly: -1,
    maxServers: Infinity,
    maxMembers: Infinity,
    versionRetentionDays: Infinity,
    maxVersionsPerFile: Infinity,
    features: [
      'Unlimited everything',
      '24/7 dedicated support',
      'SLA guarantees',
      'SSO/SAML support',
      'Custom development',
      'On-premise option',
    ],
  },
};

export function formatPrice(cents: number, yearly: boolean): string {
  if (cents === -1) return 'Custom';
  if (cents === 0) return 'Free';
  const dollars = cents / 100;
  return `$${dollars.toFixed(2)}`;
}

export function formatLimit(value: number): string {
  if (value === Infinity || value === 2147483647) return 'Unlimited';
  return value.toLocaleString();
}
