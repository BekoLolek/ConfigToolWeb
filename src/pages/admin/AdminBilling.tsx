import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';
import type { AdminSubscription, AdminSubscriptionFilters } from '../../types/admin';
import type { Plan, SubscriptionStatus } from '../../types';
import clsx from 'clsx';

export default function AdminBilling() {
  const {
    subscriptions,
    subscriptionsTotal,
    subscriptionsPage,
    subscriptionsPageSize,
    billingStats,
    loadingSubscriptions,
    error,
    fetchSubscriptions,
    fetchBillingStats,
    cancelSubscription,
  } = useAdminStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | 'all'>('all');
  const [planFilter, setPlanFilter] = useState<Plan | 'all'>('all');
  const [showCancelModal, setShowCancelModal] = useState<AdminSubscription | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelImmediate, setCancelImmediate] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch subscriptions on mount and when filters change
  useEffect(() => {
    const filters: AdminSubscriptionFilters = {};
    if (searchDebounce) filters.userEmail = searchDebounce;
    if (statusFilter !== 'all') filters.status = statusFilter;
    if (planFilter !== 'all') filters.plan = planFilter;
    fetchSubscriptions(0, subscriptionsPageSize, filters);
  }, [searchDebounce, statusFilter, planFilter, subscriptionsPageSize]);

  // Fetch stats on mount
  useEffect(() => {
    fetchBillingStats();
  }, []);

  const handlePageChange = (newPage: number) => {
    const filters: AdminSubscriptionFilters = {};
    if (searchDebounce) filters.userEmail = searchDebounce;
    if (statusFilter !== 'all') filters.status = statusFilter;
    if (planFilter !== 'all') filters.plan = planFilter;
    fetchSubscriptions(newPage, subscriptionsPageSize, filters);
  };

  const handleCancel = async () => {
    if (!showCancelModal || !cancelReason.trim()) return;
    setActionLoading(true);
    try {
      await cancelSubscription(showCancelModal.id, cancelReason, cancelImmediate);
      setShowCancelModal(null);
      setCancelReason('');
      setCancelImmediate(false);
    } catch {
      // Error handled in store
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getStatusColor = (status: SubscriptionStatus) => {
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

  const totalPages = Math.ceil(subscriptionsTotal / subscriptionsPageSize);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-wide mb-1">
            Billing Oversight
          </h1>
          <p className="text-slate-500 font-mono text-xs sm:text-sm uppercase tracking-wider">
            {subscriptionsTotal} Total Subscriptions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {billingStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">MRR</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(billingStats.mrr)}</p>
          </div>
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Active</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{billingStats.activeSubscriptions}</p>
          </div>
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Trialing</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{billingStats.trialingSubscriptions}</p>
          </div>
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Avg Revenue/User</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(billingStats.averageRevenuePerUser)}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email..."
            className="input pl-10 w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as SubscriptionStatus | 'all')}
          className="input min-w-[140px]"
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="TRIALING">Trialing</option>
          <option value="PAST_DUE">Past Due</option>
          <option value="CANCELED">Canceled</option>
          <option value="TRIAL_EXPIRED">Trial Expired</option>
        </select>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value as Plan | 'all')}
          className="input min-w-[120px]"
        >
          <option value="all">All Plans</option>
          <option value="FREE">Free</option>
          <option value="PRO">Pro</option>
          <option value="TEAM">Team</option>
          <option value="ENTERPRISE">Enterprise</option>
        </select>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Subscriptions Table */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm dark:shadow-none">
        {loadingSubscriptions && subscriptions.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-slate-500">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="font-mono text-sm uppercase tracking-wider">Loading subscriptions...</span>
            </div>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <p className="text-slate-500 font-mono text-sm uppercase tracking-wider">
              No subscriptions found
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">User</th>
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Plan</th>
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Trial</th>
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Period End</th>
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Created</th>
                    <th className="px-4 py-3 text-right text-2xs font-mono uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/billing/${sub.id}`}
                          className="font-medium text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          {sub.userEmail}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx(
                          'text-xs font-medium px-2 py-1 rounded-full',
                          getPlanColor(sub.plan)
                        )}>
                          {sub.plan}
                        </span>
                        {sub.pendingPlan && (
                          <span className="ml-2 text-xs text-slate-500">
                            -&gt; {sub.pendingPlan}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx(
                          'text-xs font-medium px-2 py-1 rounded-full',
                          getStatusColor(sub.status)
                        )}>
                          {sub.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {sub.isTrialing ? (
                          <span className="text-sm text-blue-600 dark:text-blue-400">
                            {sub.trialDaysRemaining}d left
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(sub.currentPeriodEnd)}
                        {sub.cancelAtPeriodEnd && (
                          <span className="ml-1 text-xs text-red-500">(canceling)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(sub.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/billing/${sub.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          {sub.status !== 'CANCELED' && (
                            <button
                              onClick={() => setShowCancelModal(sub)}
                              className="p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors"
                              title="Cancel Subscription"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
                <div className="text-sm text-slate-500">
                  Showing {subscriptionsPage * subscriptionsPageSize + 1} to {Math.min((subscriptionsPage + 1) * subscriptionsPageSize, subscriptionsTotal)} of {subscriptionsTotal}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(subscriptionsPage - 1)}
                    disabled={subscriptionsPage === 0 || loadingSubscriptions}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-500">
                    Page {subscriptionsPage + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(subscriptionsPage + 1)}
                    disabled={subscriptionsPage >= totalPages - 1 || loadingSubscriptions}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

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
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-1">
                  Cancel Subscription
                </h3>
                <p className="text-slate-500 text-sm mb-4">
                  Canceling subscription for <span className="font-medium text-slate-700 dark:text-slate-300">{showCancelModal.userEmail}</span>
                </p>

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
                      setShowCancelModal(null);
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
                    className="flex-1 btn bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
