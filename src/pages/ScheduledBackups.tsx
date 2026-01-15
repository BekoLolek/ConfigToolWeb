import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { scheduledBackupApi, serverApi } from '../api/endpoints';
import ThemeToggle from '../components/ThemeToggle';
import type { ScheduledBackup, CreateScheduledBackupRequest, ServerListItem, BackupStatus } from '../types';

const CRON_PRESETS = [
  { label: 'Every hour', value: '0 * * * *', description: 'At minute 0 of every hour' },
  { label: 'Every 6 hours', value: '0 */6 * * *', description: 'At minute 0 every 6 hours' },
  { label: 'Daily at midnight', value: '0 0 * * *', description: 'Every day at 00:00 UTC' },
  { label: 'Daily at 3 AM', value: '0 3 * * *', description: 'Every day at 03:00 UTC' },
  { label: 'Weekly (Sunday)', value: '0 0 * * 0', description: 'Every Sunday at 00:00 UTC' },
  { label: 'Custom', value: 'custom', description: 'Enter your own cron expression' },
];

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

function formatNextRun(dateString: string | null): string {
  if (!dateString) return 'Not scheduled';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMs < 0) return 'Overdue';
  if (diffMins < 60) return `in ${diffMins}m`;
  if (diffHours < 24) return `in ${diffHours}h`;
  if (diffDays < 7) return `in ${diffDays}d`;
  return formatDate(dateString);
}

function getStatusColor(status: BackupStatus): string {
  switch (status) {
    case 'SUCCESS': return 'text-status-online';
    case 'FAILED': return 'text-status-error';
    case 'NEVER_RUN': return 'text-slate-500';
    default: return 'text-slate-500';
  }
}

function getStatusBgColor(status: BackupStatus): string {
  switch (status) {
    case 'SUCCESS': return 'bg-status-online/10 border-status-online/30';
    case 'FAILED': return 'bg-status-error/10 border-status-error/30';
    case 'NEVER_RUN': return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    default: return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
  }
}

export default function ScheduledBackups() {
  const { user, logout, refreshToken } = useAuthStore();
  const navigate = useNavigate();

  const [backups, setBackups] = useState<ScheduledBackup[]>([]);
  const [servers, setServers] = useState<ServerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBackup, setEditingBackup] = useState<ScheduledBackup | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);

  // Form state
  const [formServerId, setFormServerId] = useState('');
  const [formName, setFormName] = useState('');
  const [formCronPreset, setFormCronPreset] = useState('0 0 * * *');
  const [formCustomCron, setFormCustomCron] = useState('');
  const [formRetentionDays, setFormRetentionDays] = useState(7);
  const [formEnabled, setFormEnabled] = useState(true);

  const orgId = user?.defaultOrganizationId || '';

  const handleLogout = async () => {
    if (refreshToken) {
      await import('../api/endpoints').then(m => m.authApi.logout(refreshToken)).catch(() => {});
    }
    logout();
    navigate('/login');
  };

  const fetchData = async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    try {
      const [backupsRes, serversRes] = await Promise.all([
        scheduledBackupApi.list(orgId),
        serverApi.list(),
      ]);
      setBackups(backupsRes.data);
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
    setFormName('');
    setFormCronPreset('0 0 * * *');
    setFormCustomCron('');
    setFormRetentionDays(7);
    setFormEnabled(true);
    setEditingBackup(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (backup: ScheduledBackup) => {
    setFormServerId(backup.serverId);
    setFormName(backup.name);
    const matchingPreset = CRON_PRESETS.find(p => p.value === backup.cronExpression);
    if (matchingPreset && matchingPreset.value !== 'custom') {
      setFormCronPreset(backup.cronExpression);
      setFormCustomCron('');
    } else {
      setFormCronPreset('custom');
      setFormCustomCron(backup.cronExpression);
    }
    setFormRetentionDays(backup.retentionDays);
    setFormEnabled(backup.enabled);
    setEditingBackup(backup);
    setShowModal(true);
  };

  const getCronExpression = (): string => {
    return formCronPreset === 'custom' ? formCustomCron : formCronPreset;
  };

  const handleSave = async () => {
    const cronExpression = getCronExpression();
    if (!formServerId || !formName.trim() || !cronExpression || !orgId) return;

    setSaving(true);
    setError(null);
    try {
      const request: CreateScheduledBackupRequest = {
        serverId: formServerId,
        name: formName.trim(),
        cronExpression,
        retentionDays: formRetentionDays,
        enabled: formEnabled,
      };

      if (editingBackup) {
        const { data } = await scheduledBackupApi.update(orgId, editingBackup.id, request);
        setBackups(prev => prev.map(b => b.id === data.id ? data : b));
      } else {
        const { data } = await scheduledBackupApi.create(orgId, request);
        setBackups(prev => [data, ...prev]);
      }
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save backup schedule');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (backupId: number) => {
    if (!orgId) return;
    setDeleting(backupId);
    try {
      await scheduledBackupApi.delete(orgId, backupId);
      setBackups(prev => prev.filter(b => b.id !== backupId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete backup schedule');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (backup: ScheduledBackup) => {
    if (!orgId) return;
    setToggling(backup.id);
    try {
      await scheduledBackupApi.toggle(orgId, backup.id, !backup.enabled);
      setBackups(prev => prev.map(b => b.id === backup.id ? { ...b, enabled: !b.enabled } : b));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle backup schedule');
    } finally {
      setToggling(null);
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
                Scheduled Backups
              </h1>
            </div>
            <p className="text-slate-500 font-mono text-sm uppercase tracking-wider">
              Automatic config file versioning on a schedule
            </p>
          </div>

          <button onClick={openCreateModal} className="btn btn-primary">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Schedule
          </button>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 bg-status-error/10 border border-status-error/30 rounded-lg">
            <p className="text-status-error text-sm">{error}</p>
          </div>
        )}

        {/* Backups List */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-cyber-600 via-cyber-400 to-cyber-600" />

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-cyber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500 font-mono text-sm">Loading scheduled backups...</p>
            </div>
          ) : backups.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-slate-500 font-mono text-sm uppercase tracking-wider mb-4">No scheduled backups yet</p>
              <button onClick={openCreateModal} className="btn btn-primary">
                Create your first backup schedule
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {backups.map((backup) => (
                <div key={backup.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        backup.enabled ? 'bg-cyber-500/10 text-cyber-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 dark:text-white truncate">{backup.name}</p>
                          <span className={`px-2 py-0.5 text-2xs font-mono rounded border ${
                            backup.enabled
                              ? 'bg-status-online/10 text-status-online border-status-online/30'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                          }`}>
                            {backup.enabled ? 'Active' : 'Paused'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Server: <span className="text-slate-700 dark:text-slate-300">{backup.serverName}</span>
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-2xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
                            {backup.cronExpression}
                          </span>
                          <span className="text-2xs text-slate-500">
                            Retain {backup.retentionDays} days
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      {/* Status */}
                      <div className="hidden lg:flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Status</p>
                          <p className={`text-sm font-medium ${getStatusColor(backup.lastStatus)}`}>
                            {backup.lastStatus.replace('_', ' ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Last Run</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            {formatRelativeTime(backup.lastRunAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Next Run</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            {backup.enabled ? formatNextRun(backup.nextRunAt) : 'Paused'}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggle(backup)}
                          disabled={toggling === backup.id}
                          className="btn btn-ghost text-xs"
                          title={backup.enabled ? 'Pause' : 'Resume'}
                        >
                          {toggling === backup.id ? (
                            <div className="w-4 h-4 border-2 border-cyber-500 border-t-transparent rounded-full animate-spin" />
                          ) : backup.enabled ? (
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
                          onClick={() => openEditModal(backup)}
                          className="btn btn-ghost text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(backup.id)}
                          disabled={deleting === backup.id}
                          className="btn btn-ghost text-status-error hover:bg-status-error/10 text-xs"
                        >
                          {deleting === backup.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Error info */}
                  {backup.lastError && (
                    <div className="mt-3 ml-14 p-2 bg-status-error/5 border border-status-error/20 rounded text-xs">
                      <p className="text-status-error font-mono">
                        Last error: {backup.lastError}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="p-6">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-4">
              How Scheduled Backups Work
            </h2>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-cyber-500/10 flex items-center justify-center mb-3">
                  <span className="text-cyber-500 font-bold">1</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300">
                  Backups run automatically based on your cron schedule (in UTC timezone)
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-cyber-500/10 flex items-center justify-center mb-3">
                  <span className="text-cyber-500 font-bold">2</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300">
                  Each backup creates a new version of all config files on the server
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-cyber-500/10 flex items-center justify-center mb-3">
                  <span className="text-cyber-500 font-bold">3</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300">
                  Webhook notifications are sent on backup success or failure
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

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
                  {editingBackup ? 'Edit Backup Schedule' : 'Create Backup Schedule'}
                </h3>

                <div className="space-y-4">
                  {/* Server Selection */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                      Server
                    </label>
                    <select
                      value={formServerId}
                      onChange={(e) => setFormServerId(e.target.value)}
                      className="input"
                    >
                      <option value="">Select a server...</option>
                      {servers.map(server => (
                        <option key={server.id} value={server.id}>
                          {server.name} {server.online ? '(Online)' : '(Offline)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                      Backup Name
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Daily Config Backup"
                      className="input"
                    />
                  </div>

                  {/* Schedule Preset */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                      Schedule
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {CRON_PRESETS.map(preset => (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => setFormCronPreset(preset.value)}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            formCronPreset === preset.value
                              ? 'border-cyber-500 bg-cyber-500/10'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                        >
                          <p className={`text-sm font-medium ${
                            formCronPreset === preset.value ? 'text-cyber-600 dark:text-cyber-400' : 'text-slate-900 dark:text-white'
                          }`}>
                            {preset.label}
                          </p>
                          <p className="text-2xs text-slate-500 mt-0.5">{preset.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Cron */}
                  {formCronPreset === 'custom' && (
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                        Cron Expression
                      </label>
                      <input
                        type="text"
                        value={formCustomCron}
                        onChange={(e) => setFormCustomCron(e.target.value)}
                        placeholder="0 0 * * *"
                        className="input font-mono"
                      />
                      <p className="text-2xs text-slate-500 mt-1">
                        Format: minute hour day month weekday (UTC)
                      </p>
                    </div>
                  )}

                  {/* Retention Days */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                      Retention Period
                    </label>
                    <select
                      value={formRetentionDays}
                      onChange={(e) => setFormRetentionDays(Number(e.target.value))}
                      className="input"
                    >
                      <option value={7}>7 days</option>
                      <option value={14}>14 days</option>
                      <option value={30}>30 days</option>
                      <option value={60}>60 days</option>
                      <option value={90}>90 days</option>
                    </select>
                  </div>

                  {/* Enabled Toggle */}
                  <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formEnabled}
                      onChange={(e) => setFormEnabled(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-cyber-500 focus:ring-cyber-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Enable immediately</p>
                      <p className="text-xs text-slate-500">Start running backups on this schedule</p>
                    </div>
                  </label>
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
                    disabled={!formServerId || !formName.trim() || !getCronExpression() || saving}
                    className="flex-1 btn btn-primary"
                  >
                    {saving ? 'Saving...' : editingBackup ? 'Save Changes' : 'Create Schedule'}
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
