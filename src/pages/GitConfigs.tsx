import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { gitConfigApi, serverApi } from '../api/endpoints';
import type { GitConfig, CreateGitConfigRequest, ServerListItem, GitSyncStatus } from '../types';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatDate(dateString);
}

function getStatusColor(status: GitSyncStatus): string {
  switch (status) {
    case 'SUCCESS': return 'text-status-online';
    case 'FAILED': return 'text-status-error';
    case 'NEVER_SYNCED': return 'text-slate-500';
    default: return 'text-slate-500';
  }
}

function getRepoName(url: string): string {
  try {
    const parts = url.replace(/\.git$/, '').split('/');
    return parts[parts.length - 1] || url;
  } catch {
    return url;
  }
}

function getRepoProvider(url: string): { name: string; icon: JSX.Element } {
  if (url.includes('github.com')) {
    return {
      name: 'GitHub',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      ),
    };
  }
  if (url.includes('gitlab.com')) {
    return {
      name: 'GitLab',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.546 10.93L13.067.452a1.55 1.55 0 00-2.19 0L8.388 2.94l2.897 2.898a1.839 1.839 0 012.328 2.34l2.79 2.79a1.84 1.84 0 11-1.1 1.026l-2.603-2.603v6.858a1.84 1.84 0 11-1.514-.066V9.26a1.84 1.84 0 01-1-2.415L7.372 4.03.454 10.93a1.55 1.55 0 000 2.19l10.48 10.48a1.55 1.55 0 002.19 0l10.422-10.422a1.55 1.55 0 000-2.248z" />
        </svg>
      ),
    };
  }
  if (url.includes('bitbucket.org')) {
    return {
      name: 'Bitbucket',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M.778 1.213a.768.768 0 00-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 00.77-.646l3.27-20.03a.768.768 0 00-.768-.891zM14.52 15.53H9.522L8.17 8.466h7.561z" />
        </svg>
      ),
    };
  }
  return {
    name: 'Git',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  };
}

export default function GitConfigs() {
  const { user } = useAuthStore();

  const [configs, setConfigs] = useState<GitConfig[]>([]);
  const [servers, setServers] = useState<ServerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<GitConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);
  const [syncing, setSyncing] = useState<number | null>(null);

  // Form state
  const [formServerId, setFormServerId] = useState('');
  const [formRepositoryUrl, setFormRepositoryUrl] = useState('');
  const [formBranch, setFormBranch] = useState('main');
  const [formDirectoryPath, setFormDirectoryPath] = useState('');
  const [formAuthToken, setFormAuthToken] = useState('');

  const orgId = user?.defaultOrganizationId || '';

  const fetchData = async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    try {
      const [configsRes, serversRes] = await Promise.all([
        gitConfigApi.list(orgId),
        serverApi.list(),
      ]);
      setConfigs(configsRes.data);
      setServers(serversRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [orgId]);

  const resetForm = () => {
    setFormServerId('');
    setFormRepositoryUrl('');
    setFormBranch('main');
    setFormDirectoryPath('');
    setFormAuthToken('');
    setEditingConfig(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (config: GitConfig) => {
    setFormServerId(config.serverId || '');
    setFormRepositoryUrl(config.repositoryUrl);
    setFormBranch(config.branch);
    setFormDirectoryPath(config.directoryPath || '');
    setFormAuthToken('');
    setEditingConfig(config);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formRepositoryUrl.trim() || !formBranch.trim() || !orgId) return;

    setSaving(true);
    setError(null);
    try {
      const request: CreateGitConfigRequest = {
        serverId: formServerId || undefined,
        repositoryUrl: formRepositoryUrl.trim(),
        branch: formBranch.trim(),
        directoryPath: formDirectoryPath.trim() || undefined,
        authToken: formAuthToken.trim() || undefined,
      };

      if (editingConfig) {
        const { data } = await gitConfigApi.update(orgId, editingConfig.id, request);
        setConfigs(prev => prev.map(c => c.id === data.id ? data : c));
      } else {
        const { data } = await gitConfigApi.create(orgId, request);
        setConfigs(prev => [data, ...prev]);
      }
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save Git configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (configId: number) => {
    if (!orgId) return;
    setDeleting(configId);
    try {
      await gitConfigApi.delete(orgId, configId);
      setConfigs(prev => prev.filter(c => c.id !== configId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete Git configuration');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (config: GitConfig) => {
    if (!orgId) return;
    setToggling(config.id);
    try {
      await gitConfigApi.toggle(orgId, config.id, !config.enabled);
      setConfigs(prev => prev.map(c => c.id === config.id ? { ...c, enabled: !c.enabled } : c));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle Git configuration');
    } finally {
      setToggling(null);
    }
  };

  const handleSync = async (configId: number) => {
    if (!orgId) return;
    setSyncing(configId);
    setError(null);
    setSuccess(null);
    try {
      const { data } = await gitConfigApi.sync(orgId, configId);
      setConfigs(prev => prev.map(c => c.id === data.id ? data : c));
      if (data.lastSyncStatus === 'SUCCESS') {
        setSuccess('Sync completed successfully!');
      } else {
        setError(data.lastSyncError || 'Sync failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to trigger sync');
    } finally {
      setSyncing(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white tracking-wide mb-2">
              Git Integration
            </h1>
            <p className="text-slate-500 font-mono text-sm uppercase tracking-wider">
              Sync config files to Git repositories
            </p>
          </div>

          <button onClick={openCreateModal} className="btn btn-primary">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Connect Repository
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-status-error/10 border border-status-error/30 rounded-lg">
            <p className="text-status-error text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-status-online/10 border border-status-online/30 rounded-lg">
            <p className="text-status-online text-sm">{success}</p>
          </div>
        )}

        {/* Configs List */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-cyber-600 via-cyber-400 to-cyber-600" />

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-cyber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500 font-mono text-sm">Loading Git configurations...</p>
            </div>
          ) : configs.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <p className="text-slate-500 font-mono text-sm uppercase tracking-wider mb-4">No Git repositories connected</p>
              <button onClick={openCreateModal} className="btn btn-primary">
                Connect your first repository
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {configs.map((config) => {
                const provider = getRepoProvider(config.repositoryUrl);
                return (
                  <div key={config.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          config.enabled ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}>
                          {provider.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900 dark:text-white truncate">
                              {getRepoName(config.repositoryUrl)}
                            </p>
                            <span className={`px-2 py-0.5 text-2xs font-mono rounded border ${
                              config.enabled
                                ? 'bg-status-online/10 text-status-online border-status-online/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                            }`}>
                              {config.enabled ? 'Active' : 'Disabled'}
                            </span>
                            {config.hasAuthToken && (
                              <span className="px-2 py-0.5 text-2xs font-mono bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded border border-amber-200 dark:border-amber-800">
                                Authenticated
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-mono truncate mt-0.5">
                            {config.repositoryUrl}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-2xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
                              {config.branch}
                            </span>
                            {config.directoryPath && (
                              <span className="text-2xs text-slate-500">
                                /{config.directoryPath}
                              </span>
                            )}
                            {config.serverName && (
                              <span className="text-2xs text-slate-500">
                                Server: {config.serverName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        {/* Status */}
                        <div className="hidden lg:flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Status</p>
                            <p className={`text-sm font-medium ${getStatusColor(config.lastSyncStatus)}`}>
                              {config.lastSyncStatus.replace('_', ' ')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Last Sync</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                              {formatRelativeTime(config.lastSyncAt)}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSync(config.id)}
                            disabled={syncing === config.id || !config.enabled}
                            className="btn btn-ghost text-xs"
                            title="Sync now"
                          >
                            {syncing === config.id ? (
                              <div className="w-4 h-4 border-2 border-cyber-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => handleToggle(config)}
                            disabled={toggling === config.id}
                            className="btn btn-ghost text-xs"
                            title={config.enabled ? 'Disable' : 'Enable'}
                          >
                            {toggling === config.id ? (
                              <div className="w-4 h-4 border-2 border-cyber-500 border-t-transparent rounded-full animate-spin" />
                            ) : config.enabled ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => openEditModal(config)}
                            className="btn btn-ghost text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(config.id)}
                            disabled={deleting === config.id}
                            className="btn btn-ghost text-status-error hover:bg-status-error/10 text-xs"
                          >
                            {deleting === config.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Error info */}
                    {config.lastSyncError && (
                      <div className="mt-3 ml-14 p-2 bg-status-error/5 border border-status-error/20 rounded text-xs">
                        <p className="text-status-error font-mono">
                          Last error: {config.lastSyncError}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="p-6">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-4">
              How Git Integration Works
            </h2>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-cyber-500/10 flex items-center justify-center mb-3">
                  <span className="text-cyber-500 font-bold">1</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300">
                  Connect a Git repository with optional authentication token for private repos
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-cyber-500/10 flex items-center justify-center mb-3">
                  <span className="text-cyber-500 font-bold">2</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300">
                  Config files are pushed to your repository with automatic commits
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-cyber-500/10 flex items-center justify-center mb-3">
                  <span className="text-cyber-500 font-bold">3</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300">
                  Use for backup, version control, or CI/CD pipeline triggers
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="relative w-full max-w-lg mx-4 animate-slide-up max-h-[90vh] overflow-y-auto">
              <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-cyber-500" />
              <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-cyber-500" />
              <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-cyber-500" />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-cyber-500" />

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-cyber-600 via-cyber-400 to-cyber-600" />

                <div className="p-6">
                  <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-4">
                    {editingConfig ? 'Edit Git Configuration' : 'Connect Git Repository'}
                  </h3>

                  <div className="space-y-4">
                    {/* Repository URL */}
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                        Repository URL
                      </label>
                      <input
                        type="url"
                        value={formRepositoryUrl}
                        onChange={(e) => setFormRepositoryUrl(e.target.value)}
                        placeholder="https://github.com/username/repo.git"
                        className="input font-mono text-sm"
                      />
                    </div>

                    {/* Branch */}
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                        Branch
                      </label>
                      <input
                        type="text"
                        value={formBranch}
                        onChange={(e) => setFormBranch(e.target.value)}
                        placeholder="main"
                        className="input"
                      />
                    </div>

                    {/* Directory Path */}
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                        Directory Path (optional)
                      </label>
                      <input
                        type="text"
                        value={formDirectoryPath}
                        onChange={(e) => setFormDirectoryPath(e.target.value)}
                        placeholder="configs/production"
                        className="input"
                      />
                      <p className="text-2xs text-slate-500 mt-1">
                        Subdirectory within the repo to place config files
                      </p>
                    </div>

                    {/* Server Selection */}
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                        Server (optional)
                      </label>
                      <select
                        value={formServerId}
                        onChange={(e) => setFormServerId(e.target.value)}
                        className="input"
                      >
                        <option value="">All servers in organization</option>
                        {servers.map(server => (
                          <option key={server.id} value={server.id}>
                            {server.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-2xs text-slate-500 mt-1">
                        Sync configs from a specific server or all servers
                      </p>
                    </div>

                    {/* Auth Token */}
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                        {editingConfig ? 'New Auth Token (leave blank to keep existing)' : 'Auth Token (for private repos)'}
                      </label>
                      <input
                        type="password"
                        value={formAuthToken}
                        onChange={(e) => setFormAuthToken(e.target.value)}
                        placeholder={editingConfig && editingConfig.hasAuthToken ? '••••••••' : 'ghp_xxxxxxxxxxxx'}
                        className="input font-mono text-sm"
                      />
                      <p className="text-2xs text-slate-500 mt-1">
                        Personal access token with repo write permissions
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="flex-1 btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!formRepositoryUrl.trim() || !formBranch.trim() || saving}
                      className="flex-1 btn btn-primary"
                    >
                      {saving ? 'Saving...' : editingConfig ? 'Save Changes' : 'Connect Repository'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
