import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';
import type { AdminCollaborator, AdminCollaboratorFilters } from '../../types/admin';
import clsx from 'clsx';

export default function AdminCollaborators() {
  const {
    collaborators,
    collaboratorsTotal,
    collaboratorsPage,
    collaboratorsPageSize,
    collaboratorStats,
    loadingCollaborators,
    error,
    fetchCollaborators,
    fetchCollaboratorStats,
    deleteCollaborator,
  } = useAdminStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');
  const [serverIdFilter, setServerIdFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState<AdminCollaborator | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch collaborators on mount and when filters change
  useEffect(() => {
    const filters: AdminCollaboratorFilters = {};
    if (searchDebounce) filters.userEmail = searchDebounce;
    if (serverIdFilter) filters.serverId = serverIdFilter;
    if (userIdFilter) filters.userId = userIdFilter;
    fetchCollaborators(0, collaboratorsPageSize, filters);
  }, [searchDebounce, serverIdFilter, userIdFilter, collaboratorsPageSize]);

  // Fetch stats on mount
  useEffect(() => {
    fetchCollaboratorStats();
  }, []);

  const handlePageChange = (newPage: number) => {
    const filters: AdminCollaboratorFilters = {};
    if (searchDebounce) filters.userEmail = searchDebounce;
    if (serverIdFilter) filters.serverId = serverIdFilter;
    if (userIdFilter) filters.userId = userIdFilter;
    fetchCollaborators(newPage, collaboratorsPageSize, filters);
  };

  const handleDelete = async () => {
    if (!showDeleteModal) return;
    setActionLoading(true);
    try {
      await deleteCollaborator(showDeleteModal.id);
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

  const totalPages = Math.ceil(collaboratorsTotal / collaboratorsPageSize);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-wide mb-1">
            Collaborator Management
          </h1>
          <p className="text-slate-500 font-mono text-xs sm:text-sm uppercase tracking-wider">
            {collaboratorsTotal} Total Collaborators
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {collaboratorStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Total Collaborators</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{collaboratorStats.totalCollaborators}</p>
          </div>
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Unique Users</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{collaboratorStats.uniqueCollaborators}</p>
          </div>
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <p className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Servers with Collaborators</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{collaboratorStats.serversWithCollaborators}</p>
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
            placeholder="Search by user email..."
            className="input pl-10 w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={serverIdFilter}
            onChange={(e) => setServerIdFilter(e.target.value)}
            placeholder="Filter by Server ID..."
            className="input text-sm w-40"
          />
          <input
            type="text"
            value={userIdFilter}
            onChange={(e) => setUserIdFilter(e.target.value)}
            placeholder="Filter by User ID..."
            className="input text-sm w-40"
          />
          {(serverIdFilter || userIdFilter) && (
            <button
              onClick={() => {
                setServerIdFilter('');
                setUserIdFilter('');
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Clear filters"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Collaborators Table */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm dark:shadow-none">
        {loadingCollaborators && collaborators.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-slate-500">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="font-mono text-sm uppercase tracking-wider">Loading collaborators...</span>
            </div>
          </div>
        ) : collaborators.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-slate-500 font-mono text-sm uppercase tracking-wider">
              {searchDebounce || serverIdFilter || userIdFilter ? 'No collaborators found matching your filters' : 'No collaborators found'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">ID</th>
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Server</th>
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">User</th>
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Owner</th>
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Joined</th>
                    <th className="px-4 py-3 text-right text-2xs font-mono uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {collaborators.map((collab) => (
                    <tr key={collab.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono text-slate-600 dark:text-slate-400">
                          {collab.id.slice(0, 8)}...
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/servers/${collab.serverId}`}
                          className="font-medium text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          {collab.serverName}
                        </Link>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{collab.serverId.slice(0, 8)}...</p>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/users/${collab.userId}`}
                          className="text-sm text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors"
                        >
                          {collab.userEmail}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/users/${collab.ownerId}`}
                          className="text-sm text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors"
                        >
                          {collab.ownerEmail}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(collab.joinedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/collaborators/${collab.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => setShowDeleteModal(collab)}
                            className="p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors"
                            title="Remove Collaborator"
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
                  Showing {collaboratorsPage * collaboratorsPageSize + 1} to {Math.min((collaboratorsPage + 1) * collaboratorsPageSize, collaboratorsTotal)} of {collaboratorsTotal}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(collaboratorsPage - 1)}
                    disabled={collaboratorsPage === 0 || loadingCollaborators}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-500">
                    Page {collaboratorsPage + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(collaboratorsPage + 1)}
                    disabled={collaboratorsPage >= totalPages - 1 || loadingCollaborators}
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
                      Remove Collaborator
                    </h3>
                    <p className="text-slate-500 text-sm">This action cannot be undone</p>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Are you sure you want to remove <span className="font-medium text-slate-900 dark:text-white">{showDeleteModal.userEmail}</span> from server <span className="font-medium text-slate-900 dark:text-white">{showDeleteModal.serverName}</span>?
                  They will lose access to the server immediately.
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
                    {actionLoading ? 'Removing...' : 'Remove Collaborator'}
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
