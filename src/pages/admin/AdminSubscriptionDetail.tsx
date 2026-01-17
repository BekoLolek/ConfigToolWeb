import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';
import type { Plan } from '../../types';
import clsx from 'clsx';

export default function AdminSubscriptionDetail() {
  const { subscriptionId } = useParams<{ subscriptionId: string }>();
  const navigate = useNavigate();
  const {
    selectedSubscription,
    loadingSubscriptionDetail,
    error,
    fetchSubscriptionDetail,
    overrideSubscriptionPlan,
    cancelSubscription,
    extendTrial,
    clearSelectedSubscription,
  } = useAdminStore();

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showExtendTrialModal, setShowExtendTrialModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan>('FREE');
  const [planReason, setPlanReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [cancelImmediate, setCancelImmediate] = useState(false);
  const [trialDays, setTrialDays] = useState(7);
  const [trialReason, setTrialReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (subscriptionId) {
      fetchSubscriptionDetail(subscriptionId);
    }
    return () => clearSelectedSubscription();
  }, [subscriptionId, fetchSubscriptionDetail, clearSelectedSubscription]);

  const handleOverridePlan = async () => {
    if (!subscriptionId || !planReason.trim()) return;
    setActionLoading(true);
    try {
      await overrideSubscriptionPlan(subscriptionId, selectedPlan, planReason);
      setShowPlanModal(false);
      setPlanReason('');
    } catch {
      // Error handled in store
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!subscriptionId || !cancelReason.trim()) return;
    setActionLoading(true);
    try {
      await cancelSubscription(subscriptionId, cancelReason, cancelImmediate);
      setShowCancelModal(false);
      setCancelReason('');
      setCancelImmediate(false);
    } catch {
      // Error handled in store
    } finally {
      setActionLoading(false);
    }
  };

  const handleExtendTrial = async () => {
    if (!subscriptionId || !trialReason.trim() || trialDays <= 0) return;
    setActionLoading(true);
    try {
      await extendTrial(subscriptionId, trialDays, trialReason);
      setShowExtendTrialModal(false);
      setTrialReason('');
      setTrialDays(7);
    } catch {
      // Error handled in store
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'TRIALING':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
      case 'PAST_DUE':
        return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30';
      case 'CANCELED':
      case 'TRIAL_EXPIRED':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case 'PAID':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'OPEN':
        return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30';
      default:
        return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800';
    }
  };

  const getPlanColor = (plan: Plan) => {
    switch (plan) {
      case 'FREE':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
      case 'PRO':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'TEAM':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      case 'ENTERPRISE':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
    }
  };

  if (loadingSubscriptionDetail && !selectedSubscription) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-slate-500">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="font-mono text-sm uppercase tracking-wider">Loading subscription...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedSubscription) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-center py-20">
          <svg className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <p className="text-slate-500 font-mono text-sm uppercase tracking-wider mb-4">Subscription not found</p>
          <Link to="/admin/billing" className="btn btn-primary">
            Back to Billing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Back link */}
      <Link
        to="/admin/billing"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm font-medium">Back to Billing</span>
      </Link>

      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-wide">
              {selectedSubscription.userEmail}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={clsx(
              'text-xs font-medium px-2 py-1 rounded-full',
              getPlanColor(selectedSubscription.plan)
            )}>
              {selectedSubscription.plan}
            </span>
            <span className={clsx(
              'text-xs font-medium px-2 py-1 rounded-full',
              getStatusColor(selectedSubscription.status)
            )}>
              {selectedSubscription.status.replace('_', ' ')}
            </span>
            {selectedSubscription.isTrialing && selectedSubscription.trialDaysRemaining !== null && (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                {selectedSubscription.trialDaysRemaining}d trial left
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setSelectedPlan(selectedSubscription.plan);
              setShowPlanModal(true);
            }}
            className="btn btn-secondary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Override Plan
          </button>
          {selectedSubscription.isTrialing && (
            <button
              onClick={() => setShowExtendTrialModal(true)}
              className="btn bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Extend Trial
            </button>
          )}
          {selectedSubscription.status !== 'CANCELED' && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="btn bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscription Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Subscription Details */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Subscription Details
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Subscription ID</dt>
                <dd className="text-sm font-mono text-slate-700 dark:text-slate-300 mt-1 break-all">{selectedSubscription.id}</dd>
              </div>
              <div>
                <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">User</dt>
                <dd className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                  <Link to={`/admin/users/${selectedSubscription.userId}`} className="hover:text-red-500 transition-colors">
                    {selectedSubscription.userEmail}
                  </Link>
                </dd>
              </div>
              {selectedSubscription.stripeSubscriptionId && (
                <div>
                  <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Stripe Subscription</dt>
                  <dd className="text-sm font-mono text-slate-700 dark:text-slate-300 mt-1 break-all">
                    {selectedSubscription.stripeSubscriptionId}
                  </dd>
                </div>
              )}
              {selectedSubscription.stripeCustomerId && (
                <div>
                  <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Stripe Customer</dt>
                  <dd className="text-sm font-mono text-slate-700 dark:text-slate-300 mt-1 break-all">
                    {selectedSubscription.stripeCustomerId}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Created</dt>
                <dd className="text-sm text-slate-700 dark:text-slate-300 mt-1">{formatDate(selectedSubscription.createdAt)}</dd>
              </div>
            </dl>
          </div>

          {/* Billing Period */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Billing Period
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Period Start</dt>
                <dd className="text-sm text-slate-700 dark:text-slate-300 mt-1">{formatDate(selectedSubscription.currentPeriodStart)}</dd>
              </div>
              <div>
                <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Period End</dt>
                <dd className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                  {formatDate(selectedSubscription.currentPeriodEnd)}
                  {selectedSubscription.cancelAtPeriodEnd && (
                    <span className="ml-2 text-xs text-red-500">(cancels)</span>
                  )}
                </dd>
              </div>
              {selectedSubscription.trialEndsAt && (
                <div>
                  <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Trial Ends</dt>
                  <dd className="text-sm text-slate-700 dark:text-slate-300 mt-1">{formatDate(selectedSubscription.trialEndsAt)}</dd>
                </div>
              )}
              {selectedSubscription.pendingPlan && (
                <div>
                  <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Pending Change</dt>
                  <dd className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                    Change to {selectedSubscription.pendingPlan} on {formatDate(selectedSubscription.pendingPlanEffectiveDate)}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Usage Stats */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Usage Stats
            </h2>
            <dl className="space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500">Servers</dt>
                <dd className="text-lg font-bold text-slate-900 dark:text-white">{selectedSubscription.serverCount}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500">Collaborators</dt>
                <dd className="text-lg font-bold text-slate-900 dark:text-white">{selectedSubscription.collaboratorCount}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500">Total Payments</dt>
                <dd className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(selectedSubscription.totalPaymentsAmount)}</dd>
              </div>
              {selectedSubscription.lastPaymentAt && (
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-slate-500">Last Payment</dt>
                  <dd className="text-sm text-slate-700 dark:text-slate-300">{formatDate(selectedSubscription.lastPaymentAt)}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Invoices */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                Invoices ({selectedSubscription.invoices.length})
              </h2>
            </div>
            {selectedSubscription.invoices.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-slate-500 font-mono text-sm uppercase tracking-wider">No invoices</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                      <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Invoice</th>
                      <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Amount</th>
                      <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Status</th>
                      <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Date</th>
                      <th className="px-4 py-3 text-right text-2xs font-mono uppercase tracking-wider text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {selectedSubscription.invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-sm font-mono text-slate-700 dark:text-slate-300">
                            {invoice.stripeInvoiceId.slice(0, 20)}...
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {formatCurrency(invoice.amountDue)}
                          </span>
                          {invoice.amountPaid > 0 && invoice.amountPaid < invoice.amountDue && (
                            <span className="text-xs text-slate-500 ml-1">
                              ({formatCurrency(invoice.amountPaid)} paid)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={clsx(
                            'text-xs font-medium px-2 py-1 rounded-full',
                            getStatusColor(invoice.status)
                          )}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                          {formatDate(invoice.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {invoice.invoiceUrl && (
                              <a
                                href={invoice.invoiceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="View Invoice"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            )}
                            {invoice.invoicePdf && (
                              <a
                                href={invoice.invoicePdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Download PDF"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Override Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="relative w-full max-w-md mx-4 animate-slide-up">
            <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-purple-500" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-purple-500" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-purple-500" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-purple-500" />

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600" />
              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Override Plan
                </h3>
                <div className="mb-4">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                    Select Plan
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['FREE', 'PRO', 'TEAM', 'ENTERPRISE'] as Plan[]).map((plan) => (
                      <button
                        key={plan}
                        onClick={() => setSelectedPlan(plan)}
                        className={clsx(
                          'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                          selectedPlan === plan
                            ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                        )}
                      >
                        {plan}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                    Reason for override
                  </label>
                  <textarea
                    value={planReason}
                    onChange={(e) => setPlanReason(e.target.value)}
                    placeholder="Enter reason..."
                    className="input w-full h-24 resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowPlanModal(false);
                      setPlanReason('');
                    }}
                    className="flex-1 btn btn-secondary"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleOverridePlan}
                    disabled={!planReason.trim() || actionLoading}
                    className="flex-1 btn bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50"
                  >
                    {actionLoading ? 'Updating...' : 'Override Plan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Extend Trial Modal */}
      {showExtendTrialModal && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="relative w-full max-w-md mx-4 animate-slide-up">
            <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-blue-500" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-blue-500" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-blue-500" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-blue-500" />

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600" />
              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Extend Trial
                </h3>
                <div className="mb-4">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                    Days to extend
                  </label>
                  <input
                    type="number"
                    value={trialDays}
                    onChange={(e) => setTrialDays(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max="90"
                    className="input w-full"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                    Reason for extension
                  </label>
                  <textarea
                    value={trialReason}
                    onChange={(e) => setTrialReason(e.target.value)}
                    placeholder="Enter reason..."
                    className="input w-full h-24 resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowExtendTrialModal(false);
                      setTrialReason('');
                      setTrialDays(7);
                    }}
                    className="flex-1 btn btn-secondary"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExtendTrial}
                    disabled={!trialReason.trim() || trialDays <= 0 || actionLoading}
                    className="flex-1 btn bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
                  >
                    {actionLoading ? 'Extending...' : `Extend by ${trialDays} days`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="relative w-full max-w-md mx-4 animate-slide-up">
            <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-red-500" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-red-500" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-red-500" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-red-500" />

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-red-600 via-red-400 to-red-600" />
              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Cancel Subscription
                </h3>
                <div className="mb-4">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                    Reason for cancellation
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Enter reason..."
                    className="input w-full h-24 resize-none"
                    autoFocus
                  />
                </div>
                <div className="mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cancelImmediate}
                      onChange={(e) => setCancelImmediate(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Cancel immediately (otherwise cancels at period end)
                    </span>
                  </label>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setCancelReason('');
                      setCancelImmediate(false);
                    }}
                    className="flex-1 btn btn-secondary"
                    disabled={actionLoading}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={!cancelReason.trim() || actionLoading}
                    className="flex-1 btn bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                  >
                    {actionLoading ? 'Canceling...' : 'Cancel Subscription'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
