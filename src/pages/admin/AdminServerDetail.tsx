import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';
import clsx from 'clsx';

export default function AdminServerDetail() {
  const { serverId } = useParams<{ serverId: string }>();
  const navigate = useNavigate();
  const {
    selectedServer,
    loadingServerDetail,
    error,
    fetchServerDetail,
    disconnectServer,
    regenerateServerToken,
    deleteServer,
    clearSelectedServer,
  } = useAdminStore();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (serverId) {
      fetchServerDetail(serverId);
    }
    return () => clearSelectedServer();
  }, [serverId, fetchServerDetail, clearSelectedServer]);

  const handleDisconnect = async () => {
    if (!serverId || !selectedServer?.online) return;
    setActionLoading(true);
    try {
      await disconnectServer(serverId);
    } catch {
      // Error handled in store
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegenerateToken = async () => {
    if (!serverId) return;
    setActionLoading(true);
    try {
      const token = await regenerateServerToken(serverId);
      setNewToken(token);
    } catch {
      // Error handled in store
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!serverId) return;
    setActionLoading(true);
    try {
      await deleteServer(serverId);
      navigate('/admin/servers');
    } catch {
      // Error handled in store
    } finally {
      setActionLoading(false);
    }
  };

  const copyToken = async (token: string) => {
    await navigator.clipboard.writeText(token);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
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

  if (loadingServerDetail && !selectedServer) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-slate-500">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="font-mono text-sm uppercase tracking-wider">Loading server...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedServer) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-center py-20">
          <svg className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
          </svg>
          <p className="text-slate-500 font-mono text-sm uppercase tracking-wider mb-4">Server not found</p>
          <Link to="/admin/servers" className="btn btn-primary">
            Back to Servers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Back link */}
      <Link
        to="/admin/servers"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm font-medium">Back to Servers</span>
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
            selectedServer.online
              ? 'bg-green-100 dark:bg-green-900/30'
              : 'bg-slate-100 dark:bg-slate-800'
          )}>
            <svg className={clsx(
              'w-8 h-8',
              selectedServer.online ? 'text-green-500' : 'text-slate-400'
            )} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-wide">
              {selectedServer.name}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={clsx(
                'inline-flex items-center gap-1.5 text-sm font-medium',
                selectedServer.online ? 'text-green-600 dark:text-green-400' : 'text-slate-500'
              )}>
                <span className={clsx(
                  'w-2 h-2 rounded-full',
                  selectedServer.online ? 'bg-green-500' : 'bg-slate-400'
                )} />
                {selectedServer.online ? 'Online' : 'Offline'}
              </span>
              {selectedServer.groupName && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {selectedServer.groupName}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedServer.online && (
            <button
              onClick={handleDisconnect}
              disabled={actionLoading}
              className="btn bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Disconnect
            </button>
          )}
          <button
            onClick={() => setShowRegenerateModal(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Regenerate Token
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
        {/* Server Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Server Details */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Server Details
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Server ID</dt>
                <dd className="text-sm font-mono text-slate-700 dark:text-slate-300 mt-1 break-all">{selectedServer.id}</dd>
              </div>
              <div>
                <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Owner</dt>
                <dd className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                  <Link to={`/admin/users/${selectedServer.ownerId}`} className="hover:text-red-500 transition-colors">
                    {selectedServer.ownerEmail}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Token</dt>
                <dd className="mt-1">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      {selectedServer.token.slice(0, 12)}...
                    </code>
                    <button
                      onClick={() => copyToken(selectedServer.token)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Copy Token"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </dd>
              </div>
              <div>
                <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Created</dt>
                <dd className="text-sm text-slate-700 dark:text-slate-300 mt-1">{formatDate(selectedServer.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Last Seen</dt>
                <dd className="text-sm text-slate-700 dark:text-slate-300 mt-1">{formatDate(selectedServer.lastSeenAt)}</dd>
              </div>
              {selectedServer.notes && (
                <div>
                  <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Notes</dt>
                  <dd className="text-sm text-slate-700 dark:text-slate-300 mt-1">{selectedServer.notes}</dd>
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
                <dt className="text-sm text-slate-500">Total Connections</dt>
                <dd className="text-lg font-bold text-slate-900 dark:text-white">{selectedServer.totalConnections}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500">File Edits</dt>
                <dd className="text-lg font-bold text-slate-900 dark:text-white">{selectedServer.totalFileEdits}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500">Config Files</dt>
                <dd className="text-lg font-bold text-slate-900 dark:text-white">{selectedServer.configFilesCount}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500">Versions</dt>
                <dd className="text-lg font-bold text-slate-900 dark:text-white">{selectedServer.versionsCount}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500">Collaborators</dt>
                <dd className="text-lg font-bold text-slate-900 dark:text-white">{selectedServer.collaboratorCount}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Collaborators */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                Collaborators ({selectedServer.collaborators.length})
              </h2>
            </div>
            {selectedServer.collaborators.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className="text-slate-500 font-mono text-sm uppercase tracking-wider">No collaborators</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {selectedServer.collaborators.map((collab) => (
                  <div key={collab.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold uppercase">
                        {collab.email.charAt(0)}
                      </div>
                      <div>
                        <Link
                          to={`/admin/users/${collab.userId}`}
                          className="font-medium text-slate-900 dark:text-white hover:text-red-500 transition-colors"
                        >
                          {collab.email}
                        </Link>
                        <p className="text-xs text-slate-500 font-mono">{collab.userId.slice(0, 8)}...</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Joined {formatDate(collab.joinedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Regenerate Token Modal */}
      {showRegenerateModal && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="relative w-full max-w-md mx-4 animate-slide-up">
            <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-amber-500" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-amber-500" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-amber-500" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-amber-500" />

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />
              <div className="p-6">
                {newToken ? (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                          Token Regenerated
                        </h3>
                        <p className="text-slate-500 text-sm">Copy the new token below</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                        New Server Token
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded break-all">
                          {newToken}
                        </code>
                        <button
                          onClick={() => copyToken(newToken)}
                          className={clsx(
                            'p-2 rounded-lg transition-colors',
                            tokenCopied
                              ? 'bg-green-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                          )}
                        >
                          {tokenCopied ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowRegenerateModal(false);
                        setNewToken(null);
                      }}
                      className="w-full btn btn-primary"
                    >
                      Done
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                          Regenerate Token
                        </h3>
                        <p className="text-slate-500 text-sm">This will disconnect the server</p>
                      </div>
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      Regenerating the token will invalidate the current token and disconnect the server. The server owner will need to update their configuration with the new token.
                    </p>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowRegenerateModal(false)}
                        className="flex-1 btn btn-secondary"
                        disabled={actionLoading}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRegenerateToken}
                        disabled={actionLoading}
                        className="flex-1 btn bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50"
                      >
                        {actionLoading ? 'Regenerating...' : 'Regenerate Token'}
                      </button>
                    </div>
                  </>
                )}
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
                    <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">Delete Server</h3>
                    <p className="text-slate-500 text-sm">This action cannot be undone</p>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Are you sure you want to delete <span className="font-medium text-slate-900 dark:text-white">{selectedServer.name}</span>?
                  All configuration files, versions, and collaborator access will be permanently removed.
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
                    {actionLoading ? 'Deleting...' : 'Delete Server'}
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
