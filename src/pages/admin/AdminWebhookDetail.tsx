import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';
import type { WebhookType } from '../../types/admin';
import clsx from 'clsx';

export default function AdminWebhookDetail() {
  const { webhookId } = useParams<{ webhookId: string }>();
  const navigate = useNavigate();
  const {
    selectedWebhook,
    loadingWebhookDetail,
    error,
    fetchWebhookDetail,
    toggleWebhook,
    deleteWebhook,
    clearSelectedWebhook,
  } = useAdminStore();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (webhookId) {
      fetchWebhookDetail(parseInt(webhookId, 10));
    }
    return () => clearSelectedWebhook();
  }, [webhookId, fetchWebhookDetail, clearSelectedWebhook]);

  const handleToggle = async () => {
    if (!webhookId) return;
    setActionLoading(true);
    try {
      await toggleWebhook(parseInt(webhookId, 10));
    } catch {
      // Error handled in store
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!webhookId) return;
    setActionLoading(true);
    try {
      await deleteWebhook(parseInt(webhookId, 10));
      navigate('/admin/webhooks');
    } catch {
      // Error handled in store
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSuccessRate = () => {
    if (!selectedWebhook) return 'N/A';
    const total = selectedWebhook.successCount + selectedWebhook.failureCount;
    if (total === 0) return 'N/A';
    const rate = (selectedWebhook.successCount / total) * 100;
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

  if (loadingWebhookDetail && !selectedWebhook) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-slate-500">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="font-mono text-sm uppercase tracking-wider">Loading webhook...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedWebhook) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-center py-20">
          <svg className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <p className="text-slate-500 font-mono text-sm uppercase tracking-wider mb-4">Webhook not found</p>
          <Link to="/admin/webhooks" className="btn btn-primary">
            Back to Webhooks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Back link */}
      <Link
        to="/admin/webhooks"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm font-medium">Back to Webhooks</span>
      </Link>

      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className={clsx(
            'w-16 h-16 rounded-lg flex items-center justify-center',
            selectedWebhook.active
              ? 'bg-green-100 dark:bg-green-900/30'
              : 'bg-slate-100 dark:bg-slate-800'
          )}>
            <svg className={clsx(
              'w-8 h-8',
              selectedWebhook.active ? 'text-green-500' : 'text-slate-400'
            )} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-wide">
              {selectedWebhook.name}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={clsx(
                'inline-flex items-center gap-1.5 text-sm font-medium',
                selectedWebhook.active ? 'text-green-600 dark:text-green-400' : 'text-slate-500'
              )}>
                <span className={clsx(
                  'w-2 h-2 rounded-full',
                  selectedWebhook.active ? 'bg-green-500' : 'bg-slate-400'
                )} />
                {selectedWebhook.active ? 'Active' : 'Inactive'}
              </span>
              <span className={clsx(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                getTypeColor(selectedWebhook.type)
              )}>
                {selectedWebhook.type}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggle}
            disabled={actionLoading}
            className={clsx(
              'btn flex items-center gap-2 disabled:opacity-50',
              selectedWebhook.active
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            )}
          >
            {selectedWebhook.active ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Deactivate
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Activate
              </>
            )}
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Webhook Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Webhook Details */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Webhook Details
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Webhook ID</dt>
                <dd className="text-sm font-mono text-slate-700 dark:text-slate-300 mt-1">{selectedWebhook.id}</dd>
              </div>
              <div>
                <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">URL</dt>
                <dd className="text-sm font-mono text-slate-700 dark:text-slate-300 mt-1 break-all">{selectedWebhook.url}</dd>
              </div>
              <div>
                <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Owner</dt>
                <dd className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                  <Link to={`/admin/users/${selectedWebhook.ownerId}`} className="hover:text-red-500 transition-colors">
                    {selectedWebhook.ownerEmail}
                  </Link>
                </dd>
              </div>
              {selectedWebhook.secret && (
                <div>
                  <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Secret</dt>
                  <dd className="text-sm font-mono text-slate-700 dark:text-slate-300 mt-1">
                    <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      {selectedWebhook.secret.slice(0, 8)}...
                    </code>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Created</dt>
                <dd className="text-sm text-slate-700 dark:text-slate-300 mt-1">{formatDate(selectedWebhook.createdAt)}</dd>
              </div>
            </dl>
          </div>

          {/* Stats */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Delivery Stats
            </h2>
            <dl className="space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500">Successful Deliveries</dt>
                <dd className="text-lg font-bold text-green-600 dark:text-green-400">{selectedWebhook.successCount.toLocaleString()}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500">Failed Deliveries</dt>
                <dd className="text-lg font-bold text-red-600 dark:text-red-400">{selectedWebhook.failureCount.toLocaleString()}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500">Success Rate</dt>
                <dd className="text-lg font-bold text-slate-900 dark:text-white">{getSuccessRate()}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500">Last Triggered</dt>
                <dd className="text-sm text-slate-700 dark:text-slate-300">{formatDate(selectedWebhook.lastTriggeredAt)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Events & Failure Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subscribed Events */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Subscribed Events ({selectedWebhook.events.length})
            </h2>
            {selectedWebhook.events.length === 0 ? (
              <p className="text-slate-500 text-sm">No events subscribed</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedWebhook.events.map((event) => (
                  <span
                    key={event}
                    className="text-xs font-mono px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded"
                  >
                    {event}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Last Failure */}
          {selectedWebhook.lastFailureAt && (
            <div className="bg-white dark:bg-slate-900/60 border border-red-200 dark:border-red-900/50 rounded-lg p-6 shadow-sm">
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Last Failure Information
              </h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Failure Time</dt>
                  <dd className="text-sm text-slate-700 dark:text-slate-300 mt-1">{formatDate(selectedWebhook.lastFailureAt)}</dd>
                </div>
                {selectedWebhook.lastFailureMessage && (
                  <div>
                    <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Error Message</dt>
                    <dd className="text-sm text-red-600 dark:text-red-400 mt-1 font-mono bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      {selectedWebhook.lastFailureMessage}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>
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
                    <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">Delete Webhook</h3>
                    <p className="text-slate-500 text-sm">This action cannot be undone</p>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Are you sure you want to delete <span className="font-medium text-slate-900 dark:text-white">{selectedWebhook.name}</span>?
                  All delivery history will be permanently removed.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
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
