import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';
import clsx from 'clsx';

export default function AdminInviteCodeDetail() {
  const { inviteCodeId } = useParams<{ inviteCodeId: string }>();
  const navigate = useNavigate();
  const {
    selectedInviteCode,
    loadingInviteCodeDetail,
    error,
    fetchInviteCodeDetail,
    deleteInviteCode,
    clearSelectedInviteCode,
  } = useAdminStore();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (inviteCodeId) {
      fetchInviteCodeDetail(inviteCodeId);
    }
    return () => clearSelectedInviteCode();
  }, [inviteCodeId, fetchInviteCodeDetail, clearSelectedInviteCode]);

  const handleDelete = async () => {
    if (!inviteCodeId) return;
    setActionLoading(true);
    try {
      await deleteInviteCode(inviteCodeId);
      navigate('/admin/invite-codes');
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

  const getStatusInfo = () => {
    if (!selectedInviteCode) return { label: 'Unknown', color: 'slate', bgColor: 'bg-slate-100 dark:bg-slate-800' };

    if (selectedInviteCode.used) {
      return { label: 'Used', color: 'blue', bgColor: 'bg-blue-100 dark:bg-blue-900/30' };
    }
    if (selectedInviteCode.expired) {
      return { label: 'Expired', color: 'slate', bgColor: 'bg-slate-100 dark:bg-slate-800' };
    }
    return { label: 'Active', color: 'green', bgColor: 'bg-green-100 dark:bg-green-900/30' };
  };

  if (loadingInviteCodeDetail && !selectedInviteCode) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-slate-500">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="font-mono text-sm uppercase tracking-wider">Loading invite code...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedInviteCode) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-center py-20">
          <svg className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          <p className="text-slate-500 font-mono text-sm uppercase tracking-wider mb-4">Invite code not found</p>
          <Link to="/admin/invite-codes" className="btn btn-primary">
            Back to Invite Codes
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Back link */}
      <Link
        to="/admin/invite-codes"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm font-medium">Back to Invite Codes</span>
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
            statusInfo.bgColor
          )}>
            <svg className={clsx(
              'w-8 h-8',
              statusInfo.color === 'green' ? 'text-green-500' :
              statusInfo.color === 'blue' ? 'text-blue-500' :
              'text-slate-400'
            )} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-wide font-mono">
              {selectedInviteCode.code}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={clsx(
                'inline-flex items-center gap-1.5 text-sm font-medium',
                statusInfo.color === 'green' ? 'text-green-600 dark:text-green-400' :
                statusInfo.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                'text-slate-500'
              )}>
                <span className={clsx(
                  'w-2 h-2 rounded-full',
                  statusInfo.color === 'green' ? 'bg-green-500' :
                  statusInfo.color === 'blue' ? 'bg-blue-500' :
                  'bg-slate-400'
                )} />
                {statusInfo.label}
              </span>
            </div>
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
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invite Code Details */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Invite Code Details
          </h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Code ID</dt>
              <dd className="text-sm font-mono text-slate-700 dark:text-slate-300 mt-1">{selectedInviteCode.id}</dd>
            </div>
            <div>
              <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Code</dt>
              <dd className="text-sm font-mono text-slate-700 dark:text-slate-300 mt-1">
                <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  {selectedInviteCode.code}
                </code>
              </dd>
            </div>
            <div>
              <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Server</dt>
              <dd className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                <Link to={`/admin/servers/${selectedInviteCode.serverId}`} className="hover:text-red-500 transition-colors">
                  {selectedInviteCode.serverName}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Owner</dt>
              <dd className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                <Link to={`/admin/users/${selectedInviteCode.ownerId}`} className="hover:text-red-500 transition-colors">
                  {selectedInviteCode.ownerEmail}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Created</dt>
              <dd className="text-sm text-slate-700 dark:text-slate-300 mt-1">{formatDate(selectedInviteCode.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Expires</dt>
              <dd className="text-sm text-slate-700 dark:text-slate-300 mt-1">{formatDate(selectedInviteCode.expiresAt)}</dd>
            </div>
          </dl>
        </div>

        {/* Usage Information */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Usage Information
          </h2>
          <dl className="space-y-4">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-slate-500">Used</dt>
              <dd className={clsx(
                'text-sm font-medium',
                selectedInviteCode.used ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'
              )}>
                {selectedInviteCode.used ? 'Yes' : 'No'}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-slate-500">Expired</dt>
              <dd className={clsx(
                'text-sm font-medium',
                selectedInviteCode.expired ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'
              )}>
                {selectedInviteCode.expired ? 'Yes' : 'No'}
              </dd>
            </div>
            {selectedInviteCode.used && (
              <>
                <div>
                  <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Used By</dt>
                  <dd className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                    {selectedInviteCode.usedByEmail ? (
                      <Link to={`/admin/users/${selectedInviteCode.usedById}`} className="hover:text-red-500 transition-colors">
                        {selectedInviteCode.usedByEmail}
                      </Link>
                    ) : (
                      'Unknown'
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Used At</dt>
                  <dd className="text-sm text-slate-700 dark:text-slate-300 mt-1">{formatDate(selectedInviteCode.usedAt)}</dd>
                </div>
              </>
            )}
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
                    <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">Delete Invite Code</h3>
                    <p className="text-slate-500 text-sm">This action cannot be undone</p>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Are you sure you want to delete the invite code <span className="font-mono font-medium text-slate-900 dark:text-white">{selectedInviteCode.code}</span>?
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
                    {actionLoading ? 'Deleting...' : 'Delete Code'}
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
