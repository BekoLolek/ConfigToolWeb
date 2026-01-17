import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useBillingStore } from '../stores/billingStore';
import PaymentMethodManager from '../components/PaymentMethodManager';
import type { Plan, SubscriptionStatus, InvoiceStatus } from '../types';

function formatLongDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

const PLAN_NAMES: Record<Plan, string> = {
  FREE: 'Free',
  PRO: 'Pro',
  TEAM: 'Team',
  ENTERPRISE: 'Enterprise',
};

const PLAN_PRICES: Record<Plan, number> = {
  FREE: 0,
  PRO: 1999,
  TEAM: 4999,
  ENTERPRISE: -1,
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function getStatusColor(status: SubscriptionStatus | InvoiceStatus): string {
  switch (status) {
    case 'ACTIVE':
    case 'PAID':
      return 'text-status-online bg-status-online/10 border-status-online/30';
    case 'TRIALING':
      return 'text-cyber-500 bg-cyber-500/10 border-cyber-500/30';
    case 'PAST_DUE':
    case 'OPEN':
      return 'text-status-warning bg-status-warning/10 border-status-warning/30';
    case 'CANCELED':
    case 'VOID':
    case 'UNCOLLECTIBLE':
      return 'text-status-error bg-status-error/10 border-status-error/30';
    default:
      return 'text-slate-500 bg-slate-500/10 border-slate-500/30';
  }
}

function UsageBar({ current, max, label }: { current: number; max: number; label: string }) {
  const percentage = max === 2147483647 || max === Infinity ? 0 : Math.min((current / max) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-500">{label}</span>
        <span className={`font-display font-bold ${isAtLimit ? 'text-status-error' : isNearLimit ? 'text-status-warning' : 'text-slate-900 dark:text-white'}`}>
          {current.toLocaleString()} / {max === 2147483647 ? '∞' : max.toLocaleString()}
        </span>
      </div>
      <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isAtLimit ? 'bg-status-error' : isNearLimit ? 'bg-status-warning' : 'bg-cyber-500'
          }`}
          style={{ width: `${Math.max(percentage, 2)}%` }}
        />
      </div>
    </div>
  );
}

function CardBrandIcon({ brand }: { brand: string }) {
  // Simple card brand display
  return (
    <div className="w-10 h-7 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded flex items-center justify-center">
      <span className="text-2xs font-mono uppercase text-slate-600 dark:text-slate-400">
        {brand.slice(0, 4)}
      </span>
    </div>
  );
}

// Loading skeleton component
function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`} />
  );
}

export default function Billing() {
  const [searchParams] = useSearchParams();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPaymentManager, setShowPaymentManager] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelDowngradeLoading, setCancelDowngradeLoading] = useState(false);

  // Get billing data from store
  const {
    subscription,
    usage,
    invoices,
    paymentMethods,
    loadingSubscription,
    loadingUsage,
    loadingInvoices,
    loadingPaymentMethods,
    error,
    fetchAll,
    cancelSubscription,
    resumeSubscription,
    cancelPendingDowngrade,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    openBillingPortal,
    clearError,
  } = useBillingStore();

  // Fetch billing data on mount
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Show success message if redirected from checkout
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      // Could add a toast notification here
      console.log('Subscription updated successfully!');
    }
  }, [searchParams]);

  // Calculate days remaining
  const daysRemaining = subscription
    ? Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  // Get default payment method for display
  const defaultPaymentMethod = paymentMethods.find(pm => pm.isDefault) || paymentMethods[0] || null;

  const handleCancelSubscription = async () => {
    setActionLoading(true);
    try {
      await cancelSubscription();
      setShowCancelModal(false);
    } catch (err) {
      // Error is already set in store
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeSubscription = async () => {
    setActionLoading(true);
    try {
      await resumeSubscription();
    } catch (err) {
      // Error is already set in store
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenBillingPortal = async () => {
    try {
      await openBillingPortal(window.location.href);
    } catch (err) {
      // Error is already set in store
    }
  };

  const handleCancelPendingDowngrade = async () => {
    setCancelDowngradeLoading(true);
    try {
      await cancelPendingDowngrade();
    } catch (err) {
      // Error is already set in store
    } finally {
      setCancelDowngradeLoading(false);
    }
  };

  // Loading state - show skeleton
  const isLoading = loadingSubscription && !subscription;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-status-error/10 border border-status-error/30 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-status-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-status-error text-sm">{error}</p>
            </div>
            <button onClick={clearError} className="text-status-error hover:text-status-error/80">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white tracking-wide mb-2">
              Billing & Subscription
            </h1>
            <p className="text-slate-500 font-mono text-sm uppercase tracking-wider">
              Manage your plan and payment details
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleOpenBillingPortal} className="btn btn-ghost text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Stripe Portal
            </button>
            <Link to="/pricing" className="btn btn-secondary">
              View All Plans
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Plan Card */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-cyber-600 via-cyber-400 to-cyber-600" />
            <div className="p-6">
              {isLoading ? (
                // Loading skeleton
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <LoadingSkeleton className="h-6 w-32 mb-2" />
                      <LoadingSkeleton className="h-4 w-48" />
                    </div>
                    <LoadingSkeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <LoadingSkeleton className="h-12 w-40" />
                  <LoadingSkeleton className="h-24 w-full" />
                  <div className="flex gap-3">
                    <LoadingSkeleton className="h-10 w-32" />
                    <LoadingSkeleton className="h-10 w-40" />
                  </div>
                </div>
              ) : !subscription ? (
                // No subscription state
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-2">No Active Subscription</h3>
                  <p className="text-slate-500 text-sm mb-4">Get started with a plan to unlock all features</p>
                  <Link to="/pricing" className="btn btn-primary">
                    View Plans
                  </Link>
                </div>
              ) : (
                // Normal subscription display
                <>
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-1">
                        Current Plan
                      </h2>
                      <p className="text-slate-500 text-sm">
                        Your subscription details and billing cycle
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-mono uppercase tracking-wider rounded-full border ${getStatusColor(subscription.status)}`}>
                      {subscription.status === 'TRIALING' ? `Trial (${subscription.trialDaysRemaining}d left)` : subscription.status}
                    </span>
                  </div>

                  {/* Pending Downgrade Banner */}
                  {subscription.pendingPlan && subscription.pendingPlanEffectiveDate && (
                    <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800/50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                              Scheduled Plan Change
                            </p>
                            <p className="text-sm text-amber-700 dark:text-amber-300">
                              Your plan will change to <strong>{PLAN_NAMES[subscription.pendingPlan]}</strong> on {formatLongDate(subscription.pendingPlanEffectiveDate)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleCancelPendingDowngrade}
                          disabled={cancelDowngradeLoading}
                          className="flex-shrink-0 px-4 py-2 text-sm font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-800/50 hover:bg-amber-200 dark:hover:bg-amber-700/50 border border-amber-300 dark:border-amber-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancelDowngradeLoading ? 'Canceling...' : 'Cancel Downgrade'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-6 mb-6">
                    <div className="flex-1">
                      <div className="flex items-baseline gap-3">
                        <span className="font-display text-4xl font-bold text-slate-900 dark:text-white">
                          {PLAN_NAMES[subscription.plan]}
                        </span>
                        {PLAN_PRICES[subscription.plan] > 0 && (
                          <span className="text-slate-500 font-mono">
                            {formatCurrency(PLAN_PRICES[subscription.plan])}/mo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Billing cycle info */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-1">
                          Current Period
                        </p>
                        <p className="text-sm text-slate-900 dark:text-white">
                          {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-1">
                          {subscription.cancelAtPeriodEnd ? 'Ends In' : 'Renews In'}
                        </p>
                        <p className={`font-display text-2xl font-bold ${subscription.cancelAtPeriodEnd ? 'text-status-warning' : 'text-cyber-500'}`}>
                          {daysRemaining} days
                        </p>
                      </div>
                    </div>

                    {subscription.cancelAtPeriodEnd && (
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 text-status-warning">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span className="text-sm font-medium">
                            Your subscription will cancel on {formatDate(subscription.currentPeriodEnd)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <Link to="/pricing" className="btn btn-primary">
                      {subscription.plan === 'FREE' ? 'Upgrade Plan' : 'Change Plan'}
                    </Link>
                    {subscription.plan !== 'FREE' && (
                      subscription.cancelAtPeriodEnd ? (
                        <button
                          onClick={handleResumeSubscription}
                          disabled={actionLoading}
                          className="btn btn-secondary disabled:opacity-50"
                        >
                          {actionLoading ? 'Resuming...' : 'Resume Subscription'}
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowCancelModal(true)}
                          className="btn btn-ghost text-status-error hover:bg-status-error/10"
                        >
                          Cancel Subscription
                        </button>
                      )
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="p-6">
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-4">
                Payment Method
              </h2>

              {loadingPaymentMethods && paymentMethods.length === 0 ? (
                <div className="space-y-4">
                  <LoadingSkeleton className="h-16 w-full" />
                  <LoadingSkeleton className="h-10 w-full" />
                </div>
              ) : defaultPaymentMethod ? (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <CardBrandIcon brand={defaultPaymentMethod.cardBrand} />
                    <div className="flex-1">
                      <p className="font-mono text-slate-900 dark:text-white">
                        •••• •••• •••• {defaultPaymentMethod.cardLast4}
                      </p>
                      <p className="text-xs text-slate-500">
                        Expires {defaultPaymentMethod.cardExpMonth}/{defaultPaymentMethod.cardExpYear}
                      </p>
                    </div>
                    {defaultPaymentMethod.isDefault && (
                      <span className="px-2 py-0.5 text-2xs font-mono uppercase tracking-wider bg-cyber-500/10 text-cyber-600 dark:text-cyber-400 border border-cyber-500/30 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  {paymentMethods.length > 1 && (
                    <p className="text-xs text-slate-500 mt-2">
                      +{paymentMethods.length - 1} more payment method{paymentMethods.length > 2 ? 's' : ''}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 mb-4 text-center">
                  <svg className="w-8 h-8 mx-auto text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <p className="text-sm text-slate-500">No payment method on file</p>
                </div>
              )}

              <button
                onClick={() => setShowPaymentManager(true)}
                className="w-full btn btn-secondary"
              >
                {defaultPaymentMethod ? 'Manage Payment Methods' : 'Add Payment Method'}
              </button>
            </div>
          </div>
        </div>

        {/* Usage Section */}
        <div className="mt-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="p-6">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-6">
              Usage Overview
            </h2>

            {loadingUsage && !usage ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <LoadingSkeleton className="h-12 w-full" />
                <LoadingSkeleton className="h-12 w-full" />
                <LoadingSkeleton className="h-12 w-full" />
              </div>
            ) : usage ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <UsageBar
                  current={usage.currentServers}
                  max={usage.maxServers}
                  label="Servers"
                />
                <UsageBar
                  current={usage.currentMembers}
                  max={usage.maxMembers}
                  label="Team Members"
                />
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Version History</span>
                    <span className="font-display font-bold text-slate-900 dark:text-white">
                      {usage.versionRetentionDays === 2147483647 ? 'Forever' : `${usage.versionRetentionDays} days`}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-cyber-500/50 w-full" />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-4">Usage data unavailable</p>
            )}
          </div>
        </div>

        {/* Invoice History */}
        <div className="mt-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Invoice History
            </h2>
          </div>

          {loadingInvoices && invoices.length === 0 ? (
            <div className="p-4 space-y-4">
              <LoadingSkeleton className="h-16 w-full" />
              <LoadingSkeleton className="h-16 w-full" />
            </div>
          ) : invoices.length > 0 ? (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                      </p>
                      <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">
                        {invoice.stripeInvoiceId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className={`px-2 py-0.5 text-2xs font-mono uppercase tracking-wider rounded border ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                    <span className="font-display font-bold text-slate-900 dark:text-white">
                      {formatCurrency(invoice.amountPaid)}
                    </span>
                    <div className="flex items-center gap-2">
                      {invoice.invoiceUrl && (
                        <a
                          href={invoice.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                          title="View Invoice"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </a>
                      )}
                      {invoice.invoicePdf && (
                        <a
                          href={invoice.invoicePdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                          title="Download PDF"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <svg className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-slate-500 font-mono text-sm uppercase tracking-wider">
                No invoices yet
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelModal && subscription && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="relative w-full max-w-md mx-4 animate-slide-up">
            {/* Corner accents */}
            <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-status-error" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-status-error" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-status-error" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-status-error" />

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl dark:shadow-panel overflow-hidden">
              <div className="h-1 bg-status-error" />

              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-status-error/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-status-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                      Cancel Subscription?
                    </h3>
                    <p className="text-slate-500 text-sm">
                      This action cannot be undone immediately
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Your subscription will remain active until <strong>{formatDate(subscription.currentPeriodEnd)}</strong>.
                    After that, your account will be downgraded to the Free plan.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    disabled={actionLoading}
                    className="flex-1 btn btn-secondary disabled:opacity-50"
                  >
                    Keep Subscription
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    disabled={actionLoading}
                    className="flex-1 btn btn-danger disabled:opacity-50"
                  >
                    {actionLoading ? 'Cancelling...' : 'Cancel Subscription'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Manager Modal */}
      {showPaymentManager && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-slide-up">
            {/* Close button */}
            <button
              onClick={() => setShowPaymentManager(false)}
              className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-white dark:bg-slate-900 rounded-full shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <PaymentMethodManager
              paymentMethods={paymentMethods}
              onAddPaymentMethod={async (pmId, setAsDefault) => {
                await addPaymentMethod(pmId, setAsDefault);
              }}
              onRemovePaymentMethod={removePaymentMethod}
              onSetDefaultPaymentMethod={setDefaultPaymentMethod}
              loading={loadingPaymentMethods}
            />
          </div>
        </div>
      )}
    </div>
  );
}
