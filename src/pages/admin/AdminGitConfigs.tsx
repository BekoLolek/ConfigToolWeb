import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';
import type { AdminGitConfig, AdminGitConfigFilters, GitSyncStatus } from '../../types/admin';
import clsx from 'clsx';

const SYNC_STATUSES: GitSyncStatus[] = ['NEVER_SYNCED', 'SUCCESS', 'FAILED', 'IN_PROGRESS'];

export default function AdminGitConfigs() {
  const {
    gitConfigs,
    gitConfigsTotal,
    gitConfigsPage,
    gitConfigsPageSize,
    gitConfigStats,
    loadingGitConfigs,
    error,
    fetchGitConfigs,
    fetchGitConfigStats,
    toggleGitConfig,
    deleteGitConfig,
  } = useAdminStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');
  const [enabledFilter, setEnabledFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [statusFilter, setStatusFilter] = useState<GitSyncStatus | 'all'>('all');
  const [showDeleteModal, setShowDeleteModal] = useState<AdminGitConfig | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<AdminGitConfig | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch git configs on mount and when filters change
  useEffect(() => {
    const filters: AdminGitConfigFilters = {};
    if (searchDebounce) filters.ownerId = searchDebounce;
    if (enabledFilter !== 'all') filters.enabled = enabledFilter === 'enabled';
    if (statusFilter !== 'all') filters.status = statusFilter;
    fetchGitConfigs(0, gitConfigsPageSize, filters);
  }, [searchDebounce, enabledFilter, statusFilter, gitConfigsPageSize]);

  // Fetch stats on mount
  useEffect(() => {
    fetchGitConfigStats();
  }, []);

  const handlePageChange = (newPage: number) => {
    const filters: AdminGitConfigFilters = {};
    if (searchDebounce) filters.ownerId = searchDebounce;
    if (enabledFilter !== 'all') filters.enabled = enabledFilter === 'enabled';
    if (statusFilter !== 'all') filters.status = statusFilter;
    fetchGitConfigs(newPage, gitConfigsPageSize, filters);
  };

  const handleToggle = async (config: AdminGitConfig) => {
    setActionLoading(true);
    try {
      await toggleGitConfig(config.id, !config.enabled);
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
      await deleteGitConfig(showDeleteModal.id);
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

  const getSyncStatusBadge = (status: GitSyncStatus) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Success
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Failed
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            In Progress
          </span>
        );
      case 'NEVER_SYNCED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Never Synced
          </span>
        );
    }
  };

  const truncateUrl = (url: string, maxLength = 40) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  const totalPages = Math.ceil(gitConfigsTotal / gitConfigsPageSize);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-wide mb-1">
            Git Config Management
          </h1>
          <p className="text-slate-500 font-mono text-xs sm:text-sm uppercase tracking-wider">
            {gitConfigsTotal} Total Git Configurations
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {gitConfigStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Total Configs</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{gitConfigStats.totalConfigs}</p>
          </div>
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Enabled</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{gitConfigStats.enabledConfigs}</p>
          </div>
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Failed</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{gitConfigStats.failedConfigs}</p>
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
            placeholder="Search by owner ID or server ID..."
            className="input pl-10 w-full"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Enabled filter */}
          <button
            onClick={() => setEnabledFilter('all')}
            className={clsx(
              'px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
              enabledFilter === 'all'
                ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
            )}
          >
            All
          </button>
          <button
            onClick={() => setEnabledFilter('enabled')}
            className={clsx(
              'px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
              enabledFilter === 'enabled'
                ? 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
            )}
          >
            Enabled
          </button>
          <button
            onClick={() => setEnabledFilter('disabled')}
            className={clsx(
              'px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
              enabledFilter === 'disabled'
                ? 'border-slate-500 bg-slate-500/10 text-slate-600 dark:text-slate-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
            )}
          >
            Disabled
          </button>

          <span className="mx-2 h-6 w-px bg-slate-200 dark:bg-slate-700" />

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as GitSyncStatus | 'all')}
            className="input text-sm py-2"
          >
            <option value="all">All Statuses</option>
            {SYNC_STATUSES.map((status) => (
              <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
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

      {/* Git Configs Table */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm dark:shadow-none">
        {loadingGitConfigs && gitConfigs.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-slate-500">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="font-mono text-sm uppercase tracking-wider">Loading git configs...</span>
            </div>
          </div>
        ) : gitConfigs.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <p className="text-slate-500 font-mono text-sm uppercase tracking-wider">
              {searchDebounce || enabledFilter !== 'all' || statusFilter !== 'all' ? 'No git configs found matching your filters' : 'No git configs found'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Repository URL</th>
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Branch</th>
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Server</th>
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Owner</th>
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Sync Status</th>
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Enabled</th>
                    <th className="px-4 py-3 text-right text-2xs font-mono uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {gitConfigs.map((config) => (
                    <tr key={config.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setShowDetailModal(config)}
                          className="font-medium text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors text-left"
                          title={config.repositoryUrl}
                        >
                          {truncateUrl(config.repositoryUrl)}
                        </button>
                        {config.directoryPath && (
                          <p className="text-xs text-slate-500 mt-0.5">{config.directoryPath}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                          {config.branch}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/servers/${config.serverId}`}
                          className="text-sm text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors"
                        >
                          {config.serverName}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/users/${config.ownerId}`}
                          className="text-sm text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors"
                        >
                          {config.ownerEmail}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {getSyncStatusBadge(config.lastSyncStatus)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggle(config)}
                          disabled={actionLoading}
                          className={clsx(
                            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50',
                            config.enabled ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'
                          )}
                        >
                          <span
                            className={clsx(
                              'inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                              config.enabled ? 'translate-x-5' : 'translate-x-0'
                            )}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setShowDetailModal(config)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(config)}
                            className="p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors"
                            title="Delete Config"
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
                  Showing {gitConfigsPage * gitConfigsPageSize + 1} to {Math.min((gitConfigsPage + 1) * gitConfigsPageSize, gitConfigsTotal)} of {gitConfigsTotal}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(gitConfigsPage - 1)}
                    disabled={gitConfigsPage === 0 || loadingGitConfigs}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-500">
                    Page {gitConfigsPage + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(gitConfigsPage + 1)}
                    disabled={gitConfigsPage >= totalPages - 1 || loadingGitConfigs}
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

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="relative w-full max-w-2xl mx-4 animate-slide-up">
            <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-red-500" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-red-500" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-red-500" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-red-500" />

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-red-600 via-red-400 to-red-600" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                    Git Config Details
                  </h3>
                  <button
                    onClick={() => setShowDetailModal(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Config ID</p>
                      <p className="text-sm text-slate-900 dark:text-white font-mono">{showDetailModal.id}</p>
                    </div>
                    <div>
                      <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Created At</p>
                      <p className="text-sm text-slate-900 dark:text-white">{formatDate(showDetailModal.createdAt)}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Repository URL</p>
                    <p className="text-sm text-slate-900 dark:text-white font-mono break-all">{showDetailModal.repositoryUrl}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Branch</p>
                      <code className="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                        {showDetailModal.branch}
                      </code>
                    </div>
                    <div>
                      <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Directory Path</p>
                      <p className="text-sm text-slate-900 dark:text-white font-mono">{showDetailModal.directoryPath || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Server</p>
                      <Link
                        to={`/admin/servers/${showDetailModal.serverId}`}
                        className="text-sm text-red-500 hover:text-red-600"
                      >
                        {showDetailModal.serverName}
                      </Link>
                    </div>
                    <div>
                      <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Owner</p>
                      <Link
                        to={`/admin/users/${showDetailModal.ownerId}`}
                        className="text-sm text-red-500 hover:text-red-600"
                      >
                        {showDetailModal.ownerEmail}
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Enabled</p>
                      <span className={clsx(
                        'inline-flex items-center gap-1.5 text-sm font-medium',
                        showDetailModal.enabled ? 'text-green-600 dark:text-green-400' : 'text-slate-500'
                      )}>
                        <span className={clsx(
                          'w-1.5 h-1.5 rounded-full',
                          showDetailModal.enabled ? 'bg-green-500' : 'bg-slate-400'
                        )} />
                        {showDetailModal.enabled ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div>
                      <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Sync Status</p>
                      {getSyncStatusBadge(showDetailModal.lastSyncStatus)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Last Sync</p>
                      <p className="text-sm text-slate-900 dark:text-white">{formatDate(showDetailModal.lastSyncAt)}</p>
                    </div>
                  </div>

                  {showDetailModal.lastSyncError && (
                    <div>
                      <p className="text-2xs font-mono uppercase tracking-wider text-red-500 mb-1">Last Sync Error</p>
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400 font-mono">{showDetailModal.lastSyncError}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setShowDetailModal(null)}
                    className="flex-1 btn btn-secondary"
                  >
                    Close
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
                      Delete Git Config
                    </h3>
                    <p className="text-slate-500 text-sm">This action cannot be undone</p>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-400 mb-2">
                  Are you sure you want to delete this git configuration?
                </p>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg mb-6">
                  <p className="text-sm font-mono text-slate-900 dark:text-white break-all">{showDeleteModal.repositoryUrl}</p>
                  <p className="text-xs text-slate-500 mt-1">Branch: {showDeleteModal.branch}</p>
                </div>

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
                    {actionLoading ? 'Deleting...' : 'Delete Config'}
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
