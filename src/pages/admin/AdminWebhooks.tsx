import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';
import type { AdminWebhook, AdminWebhookFilters, WebhookType } from '../../types/admin';
import clsx from 'clsx';

const WEBHOOK_TYPES: WebhookType[] = ['CUSTOM', 'DISCORD', 'SLACK', 'EMAIL'];

export default function AdminWebhooks() {
  const {
    webhooks,
    webhooksTotal,
    webhooksPage,
    webhooksPageSize,
    webhookStats,
    loadingWebhooks,
    error,
    fetchWebhooks,
    fetchWebhookStats,
    toggleWebhook,
    deleteWebhook,
  } = useAdminStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<WebhookType | 'all'>('all');
  const [showDeleteModal, setShowDeleteModal] = useState<AdminWebhook | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch webhooks on mount and when filters change
  useEffect(() => {
    const filters: AdminWebhookFilters = {};
    if (searchDebounce) filters.ownerEmail = searchDebounce;
    if (activeFilter !== 'all') filters.active = activeFilter === 'active';
    if (typeFilter !== 'all') filters.type = typeFilter;
    fetchWebhooks(0, webhooksPageSize, filters);
  }, [searchDebounce, activeFilter, typeFilter, webhooksPageSize]);

  // Fetch stats on mount
  useEffect(() => {
    fetchWebhookStats();
  }, []);

  const handlePageChange = (newPage: number) => {
    const filters: AdminWebhookFilters = {};
    if (searchDebounce) filters.ownerEmail = searchDebounce;
    if (activeFilter !== 'all') filters.active = activeFilter === 'active';
    if (typeFilter !== 'all') filters.type = typeFilter;
    fetchWebhooks(newPage, webhooksPageSize, filters);
  };

  const handleToggle = async (webhook: AdminWebhook) => {
    setActionLoading(true);
    try {
      await toggleWebhook(webhook.id);
    } catch {
      // Error handled in store
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteModal) return;
    setActionLoading(true);
    try {
      await deleteWebhook(showDeleteModal.id);
      setShowDeleteModal(null);
    } catch {
      // Error handled in store
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSuccessRate = (webhook: AdminWebhook) => {
    const total = webhook.successCount + webhook.failureCount;
    if (total === 0) return 'N/A';
    const rate = (webhook.successCount / total) * 100;
    return `${rate.toFixed(1)}%`;
  };

  const getTypeColor = (type: WebhookType) => {
    switch (type) {
      case 'DISCORD':
        return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400';
      case 'SLACK':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      case 'EMAIL':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
    }
  };

  const totalPages = Math.ceil(webhooksTotal / webhooksPageSize);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-wide mb-1">
            Webhook Management
          </h1>
          <p className="text-slate-500 font-mono text-xs sm:text-sm uppercase tracking-wider">
            {webhooksTotal} Total Webhooks
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {webhookStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Total Webhooks</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{webhookStats.totalWebhooks}</p>
          </div>
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Active</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{webhookStats.activeWebhooks}</p>
          </div>
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Total Deliveries</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{webhookStats.totalDeliveries.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Total Failures</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{webhookStats.totalFailures.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by owner email..."
            className="input pl-10 w-full"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Active filter */}
          <button
            onClick={() => setActiveFilter('all')}
            className={clsx(
              'px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
              activeFilter === 'all'
                ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
            )}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('active')}
            className={clsx(
              'px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
              activeFilter === 'active'
                ? 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
            )}
          >
            Active
          </button>
          <button
            onClick={() => setActiveFilter('inactive')}
            className={clsx(
              'px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
              activeFilter === 'inactive'
                ? 'border-slate-500 bg-slate-500/10 text-slate-600 dark:text-slate-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
            )}
          >
            Inactive
          </button>

          <span className="mx-2 h-6 w-px bg-slate-200 dark:bg-slate-700" />

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as WebhookType | 'all')}
            className="input text-sm py-2"
          >
            <option value="all">All Types</option>
            {WEBHOOK_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Webhooks Table */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm dark:shadow-none">
        {loadingWebhooks && webhooks.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-slate-500">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="font-mono text-sm uppercase tracking-wider">Loading webhooks...</span>
            </div>
          </div>
        ) : webhooks.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <p className="text-slate-500 font-mono text-sm uppercase tracking-wider">
              {searchDebounce || activeFilter !== 'all' || typeFilter !== 'all' ? 'No webhooks found matching your filters' : 'No webhooks found'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Name / URL</th>
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Type</th>
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Owner</th>
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Success / Failure</th>
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Success Rate</th>
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Created</th>
                    <th className="px-4 py-3 text-right text-2xs font-mono uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {webhooks.map((webhook) => (
                    <tr key={webhook.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/webhooks/${webhook.id}`}
                          className="font-medium text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          {webhook.name}
                        </Link>
                        <p className="text-xs text-slate-500 font-mono mt-0.5 truncate max-w-[200px]" title={webhook.url}>
                          {webhook.url}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx(
                          'text-xs font-medium px-2 py-1 rounded-full',
                          getTypeColor(webhook.type)
                        )}>
                          {webhook.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/users/${webhook.ownerId}`}
                          className="text-sm text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors"
                        >
                          {webhook.ownerEmail}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx(
                          'inline-flex items-center gap-1.5 text-xs font-medium',
                          webhook.active ? 'text-green-600 dark:text-green-400' : 'text-slate-500'
                        )}>
                          <span className={clsx(
                            'w-1.5 h-1.5 rounded-full',
                            webhook.active ? 'bg-green-500' : 'bg-slate-400'
                          )} />
                          {webhook.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="text-green-600 dark:text-green-400">{webhook.successCount.toLocaleString()}</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-red-600 dark:text-red-400">{webhook.failureCount.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {getSuccessRate(webhook)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(webhook.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/webhooks/${webhook.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleToggle(webhook)}
                            disabled={actionLoading}
                            className={clsx(
                              'p-1.5 rounded-lg transition-colors disabled:opacity-50',
                              webhook.active
                                ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-500/10'
                                : 'text-green-500 hover:text-green-600 hover:bg-green-500/10'
                            )}
                            title={webhook.active ? 'Deactivate' : 'Activate'}
                          >
                            {webhook.active ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(webhook)}
                            className="p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors"
                            title="Delete Webhook"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
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
                  Showing {webhooksPage * webhooksPageSize + 1} to {Math.min((webhooksPage + 1) * webhooksPageSize, webhooksTotal)} of {webhooksTotal}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(webhooksPage - 1)}
                    disabled={webhooksPage === 0 || loadingWebhooks}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-500">
                    Page {webhooksPage + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(webhooksPage + 1)}
                    disabled={webhooksPage >= totalPages - 1 || loadingWebhooks}
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

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="relative w-full max-w-md mx-4 animate-slide-up">
            <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-red-500" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-red-500" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-red-500" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-red-500" />

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-red-600 via-red-400 to-red-600" />
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                      Delete Webhook
                    </h3>
                    <p className="text-slate-500 text-sm">This action cannot be undone</p>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Are you sure you want to delete the webhook <span className="font-medium text-slate-900 dark:text-white">{showDeleteModal.name}</span>?
                  All delivery history will be permanently removed.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(null)}
                    className="flex-1 btn btn-secondary"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="flex-1 btn bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                  >
                    {actionLoading ? 'Deleting...' : 'Delete Webhook'}
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
