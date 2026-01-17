import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';
import type { Plan } from '../../types';
import clsx from 'clsx';

export default function AdminUserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const {
    selectedUser,
    loadingUserDetail,
    error,
    fetchUserDetail,
    suspendUser,
    unsuspendUser,
    deleteUser,
    overridePlan,
    clearSelectedUser,
  } = useAdminStore();

  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<Plan>('FREE');
  const [planReason, setPlanReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserDetail(userId);
    }
    return () => clearSelectedUser();
  }, [userId, fetchUserDetail, clearSelectedUser]);

  const handleSuspend = async () => {
    if (!userId || !suspendReason.trim()) return;
    setActionLoading(true);
    try {
      await suspendUser(userId, suspendReason);
      setShowSuspendModal(false);
      setSuspendReason('');
    } catch {
      // Error handled in store
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsuspend = async () => {
    if (!userId) return;
    setActionLoading(true);
    try {
      await unsuspendUser(userId);
    } catch {
      // Error handled in store
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userId) return;
    setActionLoading(true);
    try {
      await deleteUser(userId);
      navigate('/admin/users');
    } catch {
      // Error handled in store
    } finally {
      setActionLoading(false);
    }
  };

  const handleOverridePlan = async () => {
    if (!userId || !planReason.trim()) return;
    setActionLoading(true);
    try {
      await overridePlan(userId, selectedPlan, planReason);
      setShowPlanModal(false);
      setPlanReason('');
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

  if (loadingUserDetail && !selectedUser) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-slate-500">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="font-mono text-sm uppercase tracking-wider">Loading user...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-center py-20">
          <svg className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p className="text-slate-500 font-mono text-sm uppercase tracking-wider mb-4">User not found</p>
          <Link to="/admin/users" className="btn btn-primary">
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Back link */}
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm font-medium">Back to Users</span>
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
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white text-2xl font-bold uppercase">
            {selectedUser.email.charAt(0)}
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-wide">
              {selectedUser.email}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={clsx(
                'inline-flex items-center gap-1.5 text-sm font-medium',
                selectedUser.status === 'ACTIVE' && 'text-green-600 dark:text-green-400',
                selectedUser.status === 'SUSPENDED' && 'text-red-600 dark:text-red-400',
                selectedUser.status === 'DELETED' && 'text-slate-500',
              )}>
                <span className={clsx(
                  'w-2 h-2 rounded-full',
                  selectedUser.status === 'ACTIVE' && 'bg-green-500',
                  selectedUser.status === 'SUSPENDED' && 'bg-red-500',
                  selectedUser.status === 'DELETED' && 'bg-slate-400',
                )} />
                {selectedUser.status}
              </span>
              <span className={clsx(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                selectedUser.plan === 'FREE' && 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
                selectedUser.plan === 'PRO' && 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                selectedUser.plan === 'TEAM' && 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
                selectedUser.plan === 'ENTERPRISE' && 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
              )}>
                {selectedUser.plan}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedPlan(selectedUser.plan);
              setShowPlanModal(true);
            }}
            className="btn btn-secondary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Override Plan
          </button>
          {selectedUser.status === 'ACTIVE' ? (
            <button
              onClick={() => setShowSuspendModal(true)}
              className="btn bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Suspend
            </button>
          ) : selectedUser.status === 'SUSPENDED' ? (
            <button
              onClick={handleUnsuspend}
              disabled={actionLoading}
              className="btn bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Unsuspend
            </button>
          ) : null}
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

      {/* Suspended warning */}
      {selectedUser.status === 'SUSPENDED' && selectedUser.suspendedReason && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium text-amber-600 dark:text-amber-400">User Suspended</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Reason: {selectedUser.suspendedReason}
              </p>
              {selectedUser.suspendedAt && (
                <p className="text-xs text-slate-500 mt-1">
                  Suspended on {formatDate(selectedUser.suspendedAt)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Account Details */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Account Details
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">User ID</dt>
                <dd className="text-sm font-mono text-slate-700 dark:text-slate-300 mt-1 break-all">{selectedUser.id}</dd>
              </div>
              <div>
                <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">User Type</dt>
                <dd className="text-sm text-slate-700 dark:text-slate-300 mt-1">{selectedUser.userType}</dd>
              </div>
              <div>
                <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Email Verified</dt>
                <dd className="mt-1">
                  {selectedUser.emailVerified ? (
                    <span className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Not Verified
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Created</dt>
                <dd className="text-sm text-slate-700 dark:text-slate-300 mt-1">{formatDate(selectedUser.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Last Active</dt>
                <dd className="text-sm text-slate-700 dark:text-slate-300 mt-1">{formatDate(selectedUser.lastActiveAt)}</dd>
              </div>
              {selectedUser.stripeCustomerId && (
                <div>
                  <dt className="text-2xs font-mono uppercase tracking-wider text-slate-500">Stripe Customer</dt>
                  <dd className="text-sm font-mono text-slate-700 dark:text-slate-300 mt-1 break-all">{selectedUser.stripeCustomerId}</dd>
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
                <dt className="text-sm text-slate-500">Servers</dt>
                <dd className="text-lg font-bold text-slate-900 dark:text-white">{selectedUser.serverCount}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500">Collaborators</dt>
                <dd className="text-lg font-bold text-slate-900 dark:text-white">{selectedUser.collaboratorsCount}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500">API Keys</dt>
                <dd className="text-lg font-bold text-slate-900 dark:text-white">{selectedUser.apiKeysCount}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500">Webhooks</dt>
                <dd className="text-lg font-bold text-slate-900 dark:text-white">{selectedUser.webhooksCount}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500">Total Versions</dt>
                <dd className="text-lg font-bold text-slate-900 dark:text-white">{selectedUser.totalVersionsCreated}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500">Total File Edits</dt>
                <dd className="text-lg font-bold text-slate-900 dark:text-white">{selectedUser.totalFileEdits}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Servers */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                Servers ({selectedUser.servers.length})
              </h2>
            </div>
            {selectedUser.servers.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                </svg>
                <p className="text-slate-500 font-mono text-sm uppercase tracking-wider">No servers</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {selectedUser.servers.map((server) => (
                  <div key={server.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        'w-2 h-2 rounded-full',
                        server.online ? 'bg-green-500' : 'bg-slate-400'
                      )} />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{server.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{server.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">{server.totalConnections} connections</p>
                      <p className="text-xs text-slate-400">{formatDate(server.lastSeenAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="relative w-full max-w-md mx-4 animate-slide-up">
            <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-amber-500" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-amber-500" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-amber-500" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-amber-500" />

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />
              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Suspend User
                </h3>
                <div className="mb-6">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                    Reason for suspension
                  </label>
                  <textarea
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    placeholder="Enter reason..."
                    className="input w-full h-24 resize-none"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowSuspendModal(false);
                      setSuspendReason('');
                    }}
                    className="flex-1 btn btn-secondary"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSuspend}
                    disabled={!suspendReason.trim() || actionLoading}
                    className="flex-1 btn bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50"
                  >
                    {actionLoading ? 'Suspending...' : 'Suspend'}
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
                    <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">Delete User</h3>
                    <p className="text-slate-500 text-sm">This action cannot be undone</p>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Are you sure you want to delete this user? All their data will be permanently removed.
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
                    {actionLoading ? 'Deleting...' : 'Delete User'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Override Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="relative w-full max-w-md mx-4 animate-slide-up">
            <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-purple-500" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-purple-500" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-purple-500" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-purple-500" />

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600" />
              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Override Plan
                </h3>
                <div className="mb-4">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                    Select Plan
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['FREE', 'PRO', 'TEAM', 'ENTERPRISE'] as Plan[]).map((plan) => (
                      <button
                        key={plan}
                        onClick={() => setSelectedPlan(plan)}
                        className={clsx(
                          'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                          selectedPlan === plan
                            ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                        )}
                      >
                        {plan}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                    Reason for override
                  </label>
                  <textarea
                    value={planReason}
                    onChange={(e) => setPlanReason(e.target.value)}
                    placeholder="Enter reason..."
                    className="input w-full h-24 resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowPlanModal(false);
                      setPlanReason('');
                    }}
                    className="flex-1 btn btn-secondary"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleOverridePlan}
                    disabled={!planReason.trim() || actionLoading}
                    className="flex-1 btn bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50"
                  >
                    {actionLoading ? 'Updating...' : 'Override Plan'}
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
