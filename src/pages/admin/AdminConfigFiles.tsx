import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';
import type { AdminConfigFile, AdminConfigFileFilters } from '../../types/admin';
import clsx from 'clsx';

export default function AdminConfigFiles() {
  const {
    configFiles,
    configFilesTotal,
    configFilesPage,
    configFilesPageSize,
    configStats,
    configFileVersions,
    configFileVersionsTotal,
    configFileVersionsPage,
    loadingConfigFiles,
    loadingConfigFileVersions,
    error,
    fetchConfigFiles,
    fetchConfigStats,
    fetchConfigFileVersions,
  } = useAdminStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');
  const [showDetailModal, setShowDetailModal] = useState<AdminConfigFile | null>(null);
  const [showVersionsModal, setShowVersionsModal] = useState<AdminConfigFile | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch config files on mount and when filters change
  useEffect(() => {
    const filters: AdminConfigFileFilters = {};
    if (searchDebounce) {
      // Try to interpret as server ID or owner ID
      filters.serverId = searchDebounce;
    }
    fetchConfigFiles(0, configFilesPageSize, filters);
  }, [searchDebounce, configFilesPageSize]);

  // Fetch stats on mount
  useEffect(() => {
    fetchConfigStats();
  }, []);

  // Fetch versions when versions modal opens
  useEffect(() => {
    if (showVersionsModal) {
      fetchConfigFileVersions(showVersionsModal.id, 0, 20);
    }
  }, [showVersionsModal]);

  const handlePageChange = (newPage: number) => {
    const filters: AdminConfigFileFilters = {};
    if (searchDebounce) {
      filters.serverId = searchDebounce;
    }
    fetchConfigFiles(newPage, configFilesPageSize, filters);
  };

  const handleVersionsPageChange = (newPage: number) => {
    if (showVersionsModal) {
      fetchConfigFileVersions(showVersionsModal.id, newPage, 20);
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

  const getFileIcon = (filePath: string) => {
    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'yml':
      case 'yaml':
        return (
          <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'json':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      case 'properties':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const truncatePath = (path: string, maxLength = 50) => {
    if (path.length <= maxLength) return path;
    const parts = path.split('/');
    if (parts.length > 3) {
      return parts[0] + '/.../' + parts.slice(-2).join('/');
    }
    return path.substring(0, maxLength) + '...';
  };

  const totalPages = Math.ceil(configFilesTotal / configFilesPageSize);
  const versionsPages = Math.ceil(configFileVersionsTotal / 20);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-wide mb-1">
            Config Files Management
          </h1>
          <p className="text-slate-500 font-mono text-xs sm:text-sm uppercase tracking-wider">
            {configFilesTotal} Total Configuration Files
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {configStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Total Files</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{configStats.totalFiles}</p>
          </div>
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Total Versions</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{configStats.totalVersions}</p>
          </div>
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Servers with Configs</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{configStats.serversWithConfigs}</p>
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
            placeholder="Search by server ID or owner ID..."
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

      {/* Config Files Table */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm dark:shadow-none">
        {loadingConfigFiles && configFiles.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-slate-500">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="font-mono text-sm uppercase tracking-wider">Loading config files...</span>
            </div>
          </div>
        ) : configFiles.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-slate-500 font-mono text-sm uppercase tracking-wider">
              {searchDebounce ? 'No config files found matching your search' : 'No config files found'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">File Path</th>
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Server</th>
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Owner</th>
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Last Modified</th>
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Versions</th>
                    <th className="px-4 py-3 text-right text-2xs font-mono uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {configFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.filePath)}
                          <button
                            onClick={() => setShowDetailModal(file)}
                            className="font-medium text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors text-left font-mono text-sm"
                            title={file.filePath}
                          >
                            {truncatePath(file.filePath)}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/servers/${file.serverId}`}
                          className="text-sm text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors"
                        >
                          {file.serverName}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/users/${file.ownerId}`}
                          className="text-sm text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors"
                        >
                          {file.ownerEmail}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(file.lastModified)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setShowVersionsModal(file)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {file.versionCount}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setShowDetailModal(file)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setShowVersionsModal(file)}
                            className="p-1.5 rounded-lg text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 transition-colors"
                            title="View Versions"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                  Showing {configFilesPage * configFilesPageSize + 1} to {Math.min((configFilesPage + 1) * configFilesPageSize, configFilesTotal)} of {configFilesTotal}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(configFilesPage - 1)}
                    disabled={configFilesPage === 0 || loadingConfigFiles}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-500">
                    Page {configFilesPage + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(configFilesPage + 1)}
                    disabled={configFilesPage >= totalPages - 1 || loadingConfigFiles}
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
          <div className="relative w-full max-w-lg mx-4 animate-slide-up">
            <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-red-500" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-red-500" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-red-500" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-red-500" />

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-red-600 via-red-400 to-red-600" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                    Config File Details
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
                  <div>
                    <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">File ID</p>
                    <p className="text-sm text-slate-900 dark:text-white font-mono break-all">{showDetailModal.id}</p>
                  </div>

                  <div>
                    <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">File Path</p>
                    <div className="flex items-center gap-2">
                      {getFileIcon(showDetailModal.filePath)}
                      <p className="text-sm text-slate-900 dark:text-white font-mono break-all">{showDetailModal.filePath}</p>
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
                      <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Last Modified</p>
                      <p className="text-sm text-slate-900 dark:text-white">{formatDate(showDetailModal.lastModified)}</p>
                    </div>
                    <div>
                      <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Version Count</p>
                      <p className="text-sm text-slate-900 dark:text-white">{showDetailModal.versionCount}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      setShowDetailModal(null);
                      setShowVersionsModal(showDetailModal);
                    }}
                    className="flex-1 btn btn-secondary"
                  >
                    View Versions
                  </button>
                  <button
                    onClick={() => setShowDetailModal(null)}
                    className="flex-1 btn bg-red-500 hover:bg-red-600 text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Versions Modal */}
      {showVersionsModal && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="relative w-full max-w-3xl mx-4 animate-slide-up max-h-[80vh] flex flex-col">
            <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-red-500" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-red-500" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-red-500" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-red-500" />

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-full">
              <div className="h-1 bg-gradient-to-r from-red-600 via-red-400 to-red-600" />
              <div className="p-6 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                      Version History
                    </h3>
                    <p className="text-slate-500 text-sm font-mono mt-1">{showVersionsModal.filePath}</p>
                  </div>
                  <button
                    onClick={() => setShowVersionsModal(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto px-6">
                {loadingConfigFileVersions ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3 text-slate-500">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="font-mono text-sm uppercase tracking-wider">Loading versions...</span>
                    </div>
                  </div>
                ) : configFileVersions.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-slate-500 font-mono text-sm uppercase tracking-wider">No versions found</p>
                  </div>
                ) : (
                  <div className="space-y-3 pb-6">
                    {configFileVersions.map((version, index) => (
                      <div
                        key={version.id}
                        className={clsx(
                          'p-4 rounded-lg border transition-colors',
                          index === 0
                            ? 'bg-green-500/5 border-green-500/20'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {index === 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 text-2xs font-mono uppercase tracking-wider rounded">
                                  Current
                                </span>
                              )}
                              <span className="text-xs text-slate-500 font-mono">
                                {version.id.substring(0, 8)}
                              </span>
                            </div>
                            {version.message ? (
                              <p className="text-sm text-slate-900 dark:text-white">{version.message}</p>
                            ) : (
                              <p className="text-sm text-slate-500 italic">No commit message</p>
                            )}
                            {version.createdByEmail && (
                              <p className="text-xs text-slate-500 mt-1">
                                by {version.createdByEmail}
                              </p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {formatDate(version.createdAt)}
                            </p>
                            {version.contentHash && (
                              <p className="text-2xs text-slate-500 font-mono mt-0.5">
                                {version.contentHash.substring(0, 12)}...
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Versions Pagination */}
              {versionsPages > 1 && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                  <div className="text-sm text-slate-500">
                    Showing {configFileVersionsPage * 20 + 1} to {Math.min((configFileVersionsPage + 1) * 20, configFileVersionsTotal)} of {configFileVersionsTotal}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVersionsPageChange(configFileVersionsPage - 1)}
                      disabled={configFileVersionsPage === 0 || loadingConfigFileVersions}
                      className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-slate-500">
                      Page {configFileVersionsPage + 1} of {versionsPages}
                    </span>
                    <button
                      onClick={() => handleVersionsPageChange(configFileVersionsPage + 1)}
                      disabled={configFileVersionsPage >= versionsPages - 1 || loadingConfigFileVersions}
                      className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              <div className="p-6 pt-3 flex-shrink-0">
                <button
                  onClick={() => setShowVersionsModal(null)}
                  className="w-full btn bg-red-500 hover:bg-red-600 text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
