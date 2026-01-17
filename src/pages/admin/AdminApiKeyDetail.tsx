import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';
import clsx from 'clsx';

export default function AdminApiKeyDetail() {
  const { apiKeyId } = useParams<{ apiKeyId: string }>();
  const navigate = useNavigate();
  const {
    selectedApiKey,
    loadingApiKeyDetail,
    error,
    fetchApiKeyDetail,
    revokeApiKey,
    deleteApiKey,
    clearSelectedApiKey,
  } = useAdminStore();

  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (apiKeyId) {
      fetchApiKeyDetail(parseInt(apiKeyId, 10));
    }
    return () => clearSelectedApiKey();
  }, [apiKeyId, fetchApiKeyDetail, clearSelectedApiKey]);

  const handleRevoke = async () => {
    if (!apiKeyId) return;
    setActionLoading(true);
    try {
      await revokeApiKey(parseInt(apiKeyId, 10));
      setShowRevokeModal(false);
    } catch {
      // Error handled in store
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!apiKeyId) return;
    setActionLoading(true);
    try {
      await deleteApiKey(parseInt(apiKeyId, 10));
      navigate('/admin/security');
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

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'POST':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'PUT':
      case 'PATCH':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
      case 'DELETE':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
    }
  };

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return 'text-green-600 dark:text-green-400';
    } else if (statusCode >= 400 && statusCode < 500) {
      return 'text-amber-600 dark:text-amber-400';
    } else if (statusCode >= 500) {
      return 'text-red-600 dark:text-red-400';
    }
    return 'text-slate-600 dark:text-slate-400';
  };

  if (loadingApiKeyDetail && !selectedApiKey) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-slate-500">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="font-mono text-sm uppercase tracking-wider">Loading API key...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedApiKey) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-center py-20">
          <svg className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          <p className="text-slate-500 font-mono text-sm uppercase tracking-wider mb-4">API key not found</p>
          <Link to="/admin/security" className="btn btn-primary">
            Back to Security
          </Link>
        </div>
      </div>
    );
  }

  const isRevoked = !!selectedApiKey.revokedAt;
  const isExpired = selectedApiKey.expiresAt && new Date(selectedApiKey.expiresAt) < new Date();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Back link */}
      <Link
        to="/admin/security"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm font-medium">Back to Security</span>
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
            isRevoked
              ? 'bg-red-100 dark:bg-red-900/30'
              : isExpired
                ? 'bg-amber-100 dark:bg-amber-900/30'
                : 'bg-green-100 dark:bg-green-900/30'
          )}>
            <svg className={clsx(
              'w-8 h-8',
              isRevoked
                ? 'text-red-500'
                : isExpired
                  ? 'text-amber-500'
                  : 'text-green-500'
            )} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-wide">
              {selectedApiKey.name}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <code className="text-sm font-mono text-slate-500">{selectedApiKey.keyPrefix}...</code>
              {isRevoked ? (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                  Revoked
                </span>
              ) : isExpired ? (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                  Expired
                </span>
              ) : (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  Active
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isRevoked && (
            <button
              onClick={() => setShowRevokeModal(true)}
              className="btn bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Revoke
            </button>
          )}
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
        {/* API Key Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Key Details */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Key Details
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Key ID</dt>
                <dd className="text-sm font-mono text-slate-700 dark:text-slate-300 mt-1">{selectedApiKey.id}</dd>
              </div>
              <div>
                <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">User</dt>
                <dd className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                  <Link to={`/admin/users/${selectedApiKey.userId}`} className="hover:text-red-500 transition-colors">
                    {selectedApiKey.userEmail}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Created</dt>
                <dd className="text-sm text-slate-700 dark:text-slate-300 mt-1">{formatDate(selectedApiKey.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Expires</dt>
                <dd className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                  {selectedApiKey.expiresAt ? formatDate(selectedApiKey.expiresAt) : 'Never'}
                </dd>
              </div>
              {selectedApiKey.revokedAt && (
                <div>
                  <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Revoked</dt>
                  <dd className="text-sm text-red-600 dark:text-red-400 mt-1">{formatDate(selectedApiKey.revokedAt)}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Scopes */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Scopes ({selectedApiKey.scopes.length})
            </h2>
            {selectedApiKey.scopes.length === 0 ? (
              <p className="text-sm text-slate-500">No scopes assigned</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedApiKey.scopes.map((scope) => (
                  <span
                    key={scope}
                    className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg font-mono"
                  >
                    {scope}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Usage Stats */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Usage Stats
            </h2>
            <dl className="space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500">Total Requests</dt>
                <dd className="text-lg font-bold text-slate-900 dark:text-white">{selectedApiKey.requestCount.toLocaleString()}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500">Last Used</dt>
                <dd className="text-sm text-slate-700 dark:text-slate-300">{formatDate(selectedApiKey.lastUsedAt)}</dd>
              </div>
              {selectedApiKey.lastUsedIp && (
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-slate-500">Last IP</dt>
                  <dd className="text-sm font-mono text-slate-700 dark:text-slate-300">{selectedApiKey.lastUsedIp}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                Recent Requests ({selectedApiKey.recentRequests?.length || 0})
              </h2>
            </div>
            {!selectedApiKey.recentRequests || selectedApiKey.recentRequests.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-slate-500 font-mono text-sm uppercase tracking-wider">No recent requests</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                      <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Endpoint</th>
                      <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Method</th>
                      <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Status</th>
                      <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Response Time</th>
                      <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">IP</th>
                      <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {selectedApiKey.recentRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-sm font-mono text-slate-700 dark:text-slate-300 truncate max-w-[200px] block" title={request.endpoint}>
                            {request.endpoint}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={clsx(
                            'text-xs font-mono font-medium px-2 py-1 rounded',
                            getMethodColor(request.method)
                          )}>
                            {request.method}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={clsx(
                            'text-sm font-mono font-medium',
                            getStatusColor(request.statusCode)
                          )}>
                            {request.statusCode}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                          {request.responseTime}ms
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
                            {request.ipAddress || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                          {formatDate(request.createdAt)}
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

      {/* Revoke Modal */}
      {showRevokeModal && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="relative w-full max-w-md mx-4 animate-slide-up">
            <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-amber-500" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-amber-500" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-amber-500" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-amber-500" />

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">Revoke API Key</h3>
                    <p className="text-slate-500 text-sm">This will disable the key immediately</p>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Are you sure you want to revoke this API key? Any applications using this key will lose access immediately.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRevokeModal(false)}
                    className="flex-1 btn btn-secondary"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRevoke}
                    disabled={actionLoading}
                    className="flex-1 btn bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50"
                  >
                    {actionLoading ? 'Revoking...' : 'Revoke Key'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">Delete API Key</h3>
                    <p className="text-slate-500 text-sm">This action cannot be undone</p>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Are you sure you want to delete this API key? This will permanently remove the key and all its usage history.
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
                    {actionLoading ? 'Deleting...' : 'Delete Key'}
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
