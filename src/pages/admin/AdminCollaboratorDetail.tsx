import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';

export default function AdminCollaboratorDetail() {
  const { collaboratorId } = useParams<{ collaboratorId: string }>();
  const navigate = useNavigate();
  const {
    selectedCollaborator,
    loadingCollaboratorDetail,
    error,
    fetchCollaboratorDetail,
    deleteCollaborator,
    clearSelectedCollaborator,
  } = useAdminStore();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (collaboratorId) {
      fetchCollaboratorDetail(collaboratorId);
    }
    return () => clearSelectedCollaborator();
  }, [collaboratorId, fetchCollaboratorDetail, clearSelectedCollaborator]);

  const handleDelete = async () => {
    if (!collaboratorId) return;
    setActionLoading(true);
    try {
      await deleteCollaborator(collaboratorId);
      navigate('/admin/collaborators');
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

  if (loadingCollaboratorDetail && !selectedCollaborator) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-slate-500">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="font-mono text-sm uppercase tracking-wider">Loading collaborator...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedCollaborator) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-center py-20">
          <svg className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-slate-500 font-mono text-sm uppercase tracking-wider mb-4">Collaborator not found</p>
          <Link to="/admin/collaborators" className="btn btn-primary">
            Back to Collaborators
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Back link */}
      <Link
        to="/admin/collaborators"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm font-medium">Back to Collaborators</span>
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
          <div className="w-16 h-16 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-wide">
              Collaborator Details
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {selectedCollaborator.userEmail} on {selectedCollaborator.serverName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Remove Collaborator
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collaborator Info */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Collaborator Information
          </h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Collaborator ID</dt>
              <dd className="text-sm font-mono text-slate-700 dark:text-slate-300 mt-1 break-all">{selectedCollaborator.id}</dd>
            </div>
            <div>
              <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">User Email</dt>
              <dd className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                <Link to={`/admin/users/${selectedCollaborator.userId}`} className="hover:text-red-500 transition-colors">
                  {selectedCollaborator.userEmail}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">User ID</dt>
              <dd className="text-sm font-mono text-slate-700 dark:text-slate-300 mt-1 break-all">{selectedCollaborator.userId}</dd>
            </div>
            <div>
              <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Joined At</dt>
              <dd className="text-sm text-slate-700 dark:text-slate-300 mt-1">{formatDate(selectedCollaborator.joinedAt)}</dd>
            </div>
          </dl>
        </div>

        {/* Server Info */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Server Information
          </h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Server Name</dt>
              <dd className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                <Link to={`/admin/servers/${selectedCollaborator.serverId}`} className="hover:text-red-500 transition-colors">
                  {selectedCollaborator.serverName}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Server ID</dt>
              <dd className="text-sm font-mono text-slate-700 dark:text-slate-300 mt-1 break-all">{selectedCollaborator.serverId}</dd>
            </div>
            <div>
              <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Owner Email</dt>
              <dd className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                <Link to={`/admin/users/${selectedCollaborator.ownerId}`} className="hover:text-red-500 transition-colors">
                  {selectedCollaborator.ownerEmail}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Owner ID</dt>
              <dd className="text-sm font-mono text-slate-700 dark:text-slate-300 mt-1 break-all">{selectedCollaborator.ownerId}</dd>
            </div>
          </dl>
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
                    <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">Remove Collaborator</h3>
                    <p className="text-slate-500 text-sm">This action cannot be undone</p>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Are you sure you want to remove <span className="font-medium text-slate-900 dark:text-white">{selectedCollaborator.userEmail}</span> from server <span className="font-medium text-slate-900 dark:text-white">{selectedCollaborator.serverName}</span>?
                  They will lose access to the server immediately.
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
