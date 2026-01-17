import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';
import type { AdminApiKey, AdminApiKeyFilters, AdminLoginHistoryFilters } from '../../types/admin';
import clsx from 'clsx';

type TabType = 'api-keys' | 'login-history';

export default function AdminSecurity() {
  const {
    apiKeys,
    apiKeysTotal,
    apiKeysPage,
    apiKeysPageSize,
    loginHistory,
    loginHistoryTotal,
    loginHistoryPage,
    loginHistoryPageSize,
    securityStats,
    loadingApiKeys,
    loadingLoginHistory,
    error,
    fetchApiKeys,
    fetchLoginHistory,
    fetchSecurityStats,
    revokeApiKey,
    deleteApiKey,
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState<TabType>('api-keys');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');
  const [showRevokeModal, setShowRevokeModal] = useState<AdminApiKey | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<AdminApiKey | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch data on mount and when filters change
  useEffect(() => {
    if (activeTab === 'api-keys') {
      const filters: AdminApiKeyFilters = {};
      if (searchDebounce) filters.userEmail = searchDebounce;
      fetchApiKeys(0, apiKeysPageSize, filters);
    } else {
      const filters: AdminLoginHistoryFilters = {};
      if (searchDebounce) filters.userEmail = searchDebounce;
      fetchLoginHistory(0, loginHistoryPageSize, filters);
    }
  }, [activeTab, searchDebounce, apiKeysPageSize, loginHistoryPageSize]);

  // Fetch stats on mount
  useEffect(() => {
    fetchSecurityStats();
  }, []);

  const handleApiKeysPageChange = (newPage: number) => {
    const filters: AdminApiKeyFilters = {};
    if (searchDebounce) filters.userEmail = searchDebounce;
    fetchApiKeys(newPage, apiKeysPageSize, filters);
  };

  const handleLoginHistoryPageChange = (newPage: number) => {
    const filters: AdminLoginHistoryFilters = {};
    if (searchDebounce) filters.userEmail = searchDebounce;
    fetchLoginHistory(newPage, loginHistoryPageSize, filters);
  };

  const handleRevoke = async () => {
    if (!showRevokeModal) return;
    setActionLoading(true);
    try {
      await revokeApiKey(showRevokeModal.id);
      setShowRevokeModal(null);
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
      await deleteApiKey(showDeleteModal.id);
      setShowDeleteModal(null);
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

  const apiKeysTotalPages = Math.ceil(apiKeysTotal / apiKeysPageSize);
  const loginHistoryTotalPages = Math.ceil(loginHistoryTotal / loginHistoryPageSize);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-wide mb-1">
            Security & Access
          </h1>
          <p className="text-slate-500 font-mono text-xs sm:text-sm uppercase tracking-wider">
            Monitor API keys and login activity
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {securityStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Active API Keys</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{securityStats.activeApiKeys}</p>
          </div>
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">API Requests (24h)</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{securityStats.totalApiRequests24h}</p>
          </div>
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Failed Logins (24h)</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{securityStats.failedLogins24h}</p>
          </div>
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Unique IPs (24h)</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{securityStats.uniqueIps24h}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('api-keys')}
          className={clsx(
            'pb-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'api-keys'
              ? 'border-red-500 text-red-600 dark:text-red-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          API Keys ({apiKeysTotal})
        </button>
        <button
          onClick={() => setActiveTab('login-history')}
          className={clsx(
            'pb-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'login-history'
              ? 'border-red-500 text-red-600 dark:text-red-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          Login History ({loginHistoryTotal})
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
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
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api-keys' && (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm dark:shadow-none">
          {loadingApiKeys && apiKeys.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-3 text-slate-500">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="font-mono text-sm uppercase tracking-wider">Loading API keys...</span>
              </div>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <p className="text-slate-500 font-mono text-sm uppercase tracking-wider">No API keys found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                      <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Name / Key</th>
                      <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">User</th>
                      <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Scopes</th>
                      <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Requests</th>
                      <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Last Used</th>
                      <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Status</th>
                      <th className="px-4 py-3 text-right text-2xs font-mono uppercase tracking-wider text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {apiKeys.map((apiKey) => {
                      const isRevoked = !!apiKey.revokedAt;
                      const isExpired = apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date();
                      return (
                        <tr key={apiKey.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-3">
                            <Link
                              to={`/admin/security/api-keys/${apiKey.id}`}
                              className="font-medium text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            >
                              {apiKey.name}
                            </Link>
                            <p className="text-xs font-mono text-slate-500 mt-0.5">{apiKey.keyPrefix}...</p>
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              to={`/admin/users/${apiKey.userId}`}
                              className="text-sm text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors"
                            >
                              {apiKey.userEmail}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {apiKey.scopes.slice(0, 2).map((scope) => (
                                <span key={scope} className="text-2xs px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                                  {scope}
                                </span>
                              ))}
                              {apiKey.scopes.length > 2 && (
                                <span className="text-2xs px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                                  +{apiKey.scopes.length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                            {apiKey.requestCount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                            {formatDate(apiKey.lastUsedAt)}
                          </td>
                          <td className="px-4 py-3">
                            {isRevoked ? (
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                Revoked
                              </span>
                            ) : isExpired ? (
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                                Expired
                              </span>
                            ) : (
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/admin/security/api-keys/${apiKey.id}`}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="View Details"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </Link>
                              {!isRevoked && (
                                <button
                                  onClick={() => setShowRevokeModal(apiKey)}
                                  className="p-1.5 rounded-lg text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 transition-colors"
                                  title="Revoke Key"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                  </svg>
                                </button>
                              )}
                              <button
                                onClick={() => setShowDeleteModal(apiKey)}
                                className="p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors"
                                title="Delete Key"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {apiKeysTotalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-sm text-slate-500">
                    Showing {apiKeysPage * apiKeysPageSize + 1} to {Math.min((apiKeysPage + 1) * apiKeysPageSize, apiKeysTotal)} of {apiKeysTotal}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApiKeysPageChange(apiKeysPage - 1)}
                      disabled={apiKeysPage === 0 || loadingApiKeys}
                      className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-slate-500">
                      Page {apiKeysPage + 1} of {apiKeysTotalPages}
                    </span>
                    <button
                      onClick={() => handleApiKeysPageChange(apiKeysPage + 1)}
                      disabled={apiKeysPage >= apiKeysTotalPages - 1 || loadingApiKeys}
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
      )}

      {/* Login History Tab */}
      {activeTab === 'login-history' && (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm dark:shadow-none">
          {loadingLoginHistory && loginHistory.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-3 text-slate-500">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="font-mono text-sm uppercase tracking-wider">Loading login history...</span>
              </div>
            </div>
          ) : loginHistory.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <p className="text-slate-500 font-mono text-sm uppercase tracking-wider">No login history found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                      <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">User</th>
                      <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Status</th>
                      <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">IP Address</th>
                      <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">User Agent</th>
                      <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {loginHistory.map((login) => (
                      <tr key={login.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <Link
                            to={`/admin/users/${login.userId}`}
                            className="font-medium text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          >
                            {login.userEmail}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          {login.success ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              Success
                            </span>
                          ) : (
                            <div>
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                Failed
                              </span>
                              {login.failureReason && (
                                <p className="text-xs text-slate-500 mt-0.5">{login.failureReason}</p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
                            {login.ipAddress || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[200px] block" title={login.userAgent || undefined}>
                            {login.userAgent ? login.userAgent.slice(0, 40) + (login.userAgent.length > 40 ? '...' : '') : 'Unknown'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                          {formatDate(login.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {loginHistoryTotalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-sm text-slate-500">
                    Showing {loginHistoryPage * loginHistoryPageSize + 1} to {Math.min((loginHistoryPage + 1) * loginHistoryPageSize, loginHistoryTotal)} of {loginHistoryTotal}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLoginHistoryPageChange(loginHistoryPage - 1)}
                      disabled={loginHistoryPage === 0 || loadingLoginHistory}
                      className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-slate-500">
                      Page {loginHistoryPage + 1} of {loginHistoryTotalPages}
                    </span>
                    <button
                      onClick={() => handleLoginHistoryPageChange(loginHistoryPage + 1)}
                      disabled={loginHistoryPage >= loginHistoryTotalPages - 1 || loadingLoginHistory}
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
      )}

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
                    <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                      Revoke API Key
                    </h3>
                    <p className="text-slate-500 text-sm">This will disable the key immediately</p>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Are you sure you want to revoke the API key <span className="font-medium text-slate-900 dark:text-white">{showRevokeModal.name}</span> ({showRevokeModal.keyPrefix}...)?
                  Any applications using this key will lose access.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRevokeModal(null)}
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
                    <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                      Delete API Key
                    </h3>
                    <p className="text-slate-500 text-sm">This action cannot be undone</p>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Are you sure you want to delete the API key <span className="font-medium text-slate-900 dark:text-white">{showDeleteModal.name}</span>?
                  This will permanently remove the key and all its usage history.
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
