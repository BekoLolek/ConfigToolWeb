import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { apiKeyApi } from '../api/endpoints';
import ThemeToggle from '../components/ThemeToggle';
import type { ApiKey, CreateApiKeyRequest } from '../types';

const AVAILABLE_SCOPES = [
  { value: 'servers:read', label: 'Read Servers', description: 'View server list and details' },
  { value: 'servers:write', label: 'Write Servers', description: 'Create, update, delete servers' },
  { value: 'files:read', label: 'Read Files', description: 'View file contents' },
  { value: 'files:write', label: 'Write Files', description: 'Edit and save files' },
  { value: '*', label: 'Full Access', description: 'All permissions' },
];

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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

export default function ApiKeys() {
  const { user, logout, refreshToken } = useAuthStore();
  const navigate = useNavigate();

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<number | null>(null);

  // Form state
  const [keyName, setKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['servers:read', 'files:read']);
  const [expiresInDays, setExpiresInDays] = useState<number | undefined>(undefined);

  // Get organization ID from user profile
  const orgId = user?.defaultOrganizationId || '';

  const handleLogout = async () => {
    if (refreshToken) {
      await import('../api/endpoints').then(m => m.authApi.logout(refreshToken)).catch(() => {});
    }
    logout();
    navigate('/login');
  };

  const fetchKeys = async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiKeyApi.list(orgId);
      setKeys(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, [orgId]);

  const handleCreateKey = async () => {
    if (!keyName.trim() || !orgId) return;
    setCreating(true);
    setError(null);
    try {
      const request: CreateApiKeyRequest = {
        name: keyName.trim(),
        scopes: selectedScopes,
        expiresInDays: expiresInDays,
      };
      const { data } = await apiKeyApi.create(orgId, request);
      setNewKey(data.key);
      setKeys(prev => [data.apiKey, ...prev]);
      setShowCreateModal(false);
      setShowKeyModal(true);
      setKeyName('');
      setSelectedScopes(['servers:read', 'files:read']);
      setExpiresInDays(undefined);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeKey = async (keyId: number) => {
    if (!orgId) return;
    setRevoking(keyId);
    try {
      await apiKeyApi.revoke(orgId, keyId);
      setKeys(prev => prev.filter(k => k.id !== keyId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to revoke API key');
    } finally {
      setRevoking(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleScope = (scope: string) => {
    if (scope === '*') {
      setSelectedScopes(['*']);
    } else {
      setSelectedScopes(prev => {
        const withoutWildcard = prev.filter(s => s !== '*');
        if (withoutWildcard.includes(scope)) {
          return withoutWildcard.filter(s => s !== scope);
        }
        return [...withoutWildcard, scope];
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 dark:bg-ops-grid">
      {/* Navigation */}
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded border border-cyber-500/30 bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center">
                <svg className="w-4 h-4 text-cyber-500 dark:text-cyber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <span className="font-display text-lg font-bold tracking-wide text-slate-900 dark:text-white">
                CONFIG<span className="text-cyber-500 dark:text-cyber-400">TOOL</span>
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link to="/" className="btn btn-ghost text-xs">Dashboard</Link>
              <button onClick={handleLogout} className="btn btn-ghost text-xs">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link to="/" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white tracking-wide">
                API Keys
              </h1>
            </div>
            <p className="text-slate-500 font-mono text-sm uppercase tracking-wider">
              Manage programmatic access to your organization
            </p>
          </div>

          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create API Key
          </button>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 bg-status-error/10 border border-status-error/30 rounded-lg">
            <p className="text-status-error text-sm">{error}</p>
          </div>
        )}

        {/* API Keys List */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-cyber-600 via-cyber-400 to-cyber-600" />

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-cyber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500 font-mono text-sm">Loading API keys...</p>
            </div>
          ) : keys.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <p className="text-slate-500 font-mono text-sm uppercase tracking-wider mb-4">No API keys yet</p>
              <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
                Create your first API key
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {keys.map((key) => (
                <div key={key.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-cyber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{key.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{key.keyPrefix}...</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Last used</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{formatRelativeTime(key.lastUsedAt)}</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Requests</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{key.requestCount.toLocaleString()}</p>
                      </div>
                      <div className="flex flex-wrap gap-1 max-w-[200px] hidden md:flex">
                        {key.scopes.slice(0, 3).map(scope => (
                          <span key={scope} className="px-2 py-0.5 text-2xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                            {scope}
                          </span>
                        ))}
                        {key.scopes.length > 3 && (
                          <span className="px-2 py-0.5 text-2xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                            +{key.scopes.length - 3}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRevokeKey(key.id)}
                        disabled={revoking === key.id}
                        className="btn btn-ghost text-status-error hover:bg-status-error/10 text-xs"
                      >
                        {revoking === key.id ? 'Revoking...' : 'Revoke'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documentation */}
        <div className="mt-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="p-6">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-4">
              Using API Keys
            </h2>
            <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 font-mono text-sm">
              <p className="text-slate-400 mb-2"># Include the API key in your request header</p>
              <p className="text-cyber-400">curl -H "X-API-Key: ct_live_..." \</p>
              <p className="text-cyber-400 ml-4">https://api.configtool.app/api/servers</p>
            </div>
          </div>
        </div>
      </main>

      {/* Create API Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="relative w-full max-w-md mx-4 animate-slide-up">
            <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-cyber-500" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-cyber-500" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-cyber-500" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-cyber-500" />

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-cyber-600 via-cyber-400 to-cyber-600" />

              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Create API Key
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                      Key Name
                    </label>
                    <input
                      type="text"
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                      placeholder="Production API Key"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                      Permissions
                    </label>
                    <div className="space-y-2">
                      {AVAILABLE_SCOPES.map(scope => (
                        <label key={scope.value} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedScopes.includes(scope.value)}
                            onChange={() => toggleScope(scope.value)}
                            className="w-4 h-4 rounded border-slate-300 text-cyber-500 focus:ring-cyber-500"
                          />
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{scope.label}</p>
                            <p className="text-xs text-slate-500">{scope.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                      Expiration (optional)
                    </label>
                    <select
                      value={expiresInDays || ''}
                      onChange={(e) => setExpiresInDays(e.target.value ? Number(e.target.value) : undefined)}
                      className="input"
                    >
                      <option value="">Never expires</option>
                      <option value="30">30 days</option>
                      <option value="90">90 days</option>
                      <option value="365">1 year</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowCreateModal(false)} className="flex-1 btn btn-secondary">
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateKey}
                    disabled={!keyName.trim() || selectedScopes.length === 0 || creating}
                    className="flex-1 btn btn-primary"
                  >
                    {creating ? 'Creating...' : 'Create Key'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show New Key Modal */}
      {showKeyModal && newKey && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="relative w-full max-w-lg mx-4 animate-slide-up">
            <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-status-online" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-status-online" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-status-online" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-status-online" />

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden">
              <div className="h-1 bg-status-online" />

              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-status-online/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-status-online" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                      API Key Created
                    </h3>
                    <p className="text-slate-500 text-sm">
                      Copy this key now - you won't see it again!
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 font-mono text-sm break-all mb-4">
                  <p className="text-cyber-400">{newKey}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => copyToClipboard(newKey)}
                    className="flex-1 btn btn-secondary"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy to Clipboard
                  </button>
                  <button
                    onClick={() => {
                      setShowKeyModal(false);
                      setNewKey(null);
                    }}
                    className="flex-1 btn btn-primary"
                  >
                    Done
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
