import { useState, useEffect } from 'react';
import { webhookApi } from '../api/endpoints';
import type { Webhook, WebhookType, WebhookEventType, CreateWebhookRequest } from '../types';

const WEBHOOK_TYPES: { value: WebhookType; label: string; icon: string }[] = [
  { value: 'DISCORD', label: 'Discord', icon: 'M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z' },
  { value: 'SLACK', label: 'Slack', icon: 'M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z' },
  { value: 'CUSTOM', label: 'Custom HTTP', icon: '' },
  { value: 'EMAIL', label: 'Email', icon: '' },
];

const EVENT_CATEGORIES = [
  {
    name: 'Server Events',
    events: [
      { value: 'SERVER_ONLINE' as WebhookEventType, label: 'Server Online', description: 'When a server comes online' },
      { value: 'SERVER_OFFLINE' as WebhookEventType, label: 'Server Offline', description: 'When a server goes offline' },
      { value: 'SERVER_CREATED' as WebhookEventType, label: 'Server Created', description: 'When a new server is added' },
      { value: 'SERVER_DELETED' as WebhookEventType, label: 'Server Deleted', description: 'When a server is removed' },
    ],
  },
  {
    name: 'File Events',
    events: [
      { value: 'FILE_CREATED' as WebhookEventType, label: 'File Created', description: 'When a new file is created' },
      { value: 'FILE_UPDATED' as WebhookEventType, label: 'File Updated', description: 'When a file is modified' },
      { value: 'FILE_DELETED' as WebhookEventType, label: 'File Deleted', description: 'When a file is removed' },
      { value: 'FILE_RESTORED' as WebhookEventType, label: 'File Restored', description: 'When a file version is restored' },
    ],
  },
  {
    name: 'Member Events',
    events: [
      { value: 'MEMBER_INVITED' as WebhookEventType, label: 'Member Invited', description: 'When a member is invited' },
      { value: 'MEMBER_JOINED' as WebhookEventType, label: 'Member Joined', description: 'When a member joins' },
      { value: 'MEMBER_REMOVED' as WebhookEventType, label: 'Member Removed', description: 'When a member is removed' },
      { value: 'MEMBER_ROLE_CHANGED' as WebhookEventType, label: 'Role Changed', description: 'When a member role changes' },
    ],
  },
  {
    name: 'Billing Events',
    events: [
      { value: 'SUBSCRIPTION_CREATED' as WebhookEventType, label: 'Subscription Created', description: 'When a subscription starts' },
      { value: 'SUBSCRIPTION_CANCELED' as WebhookEventType, label: 'Subscription Canceled', description: 'When a subscription is canceled' },
      { value: 'PAYMENT_SUCCEEDED' as WebhookEventType, label: 'Payment Succeeded', description: 'When a payment succeeds' },
      { value: 'PAYMENT_FAILED' as WebhookEventType, label: 'Payment Failed', description: 'When a payment fails' },
    ],
  },
  {
    name: 'Backup Events',
    events: [
      { value: 'BACKUP_COMPLETED' as WebhookEventType, label: 'Backup Completed', description: 'When a scheduled backup completes' },
      { value: 'BACKUP_FAILED' as WebhookEventType, label: 'Backup Failed', description: 'When a scheduled backup fails' },
    ],
  },
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

function getTypeIcon(type: WebhookType): JSX.Element {
  if (type === 'DISCORD') {
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
      </svg>
    );
  }
  if (type === 'SLACK') {
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
      </svg>
    );
  }
  if (type === 'EMAIL') {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  }
  // CUSTOM
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}

export default function Webhooks() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);
  const [testing, setTesting] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<{ id: number; success: boolean; message: string } | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formType, setFormType] = useState<WebhookType>('DISCORD');
  const [formEvents, setFormEvents] = useState<WebhookEventType[]>([]);
  const [formSecretToken, setFormSecretToken] = useState('');

  const fetchWebhooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await webhookApi.list();
      setWebhooks(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load webhooks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const resetForm = () => {
    setFormName('');
    setFormUrl('');
    setFormType('DISCORD');
    setFormEvents([]);
    setFormSecretToken('');
    setEditingWebhook(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (webhook: Webhook) => {
    setFormName(webhook.name);
    setFormUrl(webhook.url);
    setFormType(webhook.type);
    setFormEvents([...webhook.events]);
    setFormSecretToken('');
    setEditingWebhook(webhook);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formUrl.trim() || formEvents.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const request: CreateWebhookRequest = {
        name: formName.trim(),
        url: formUrl.trim(),
        type: formType,
        events: formEvents,
        ...(formSecretToken && { secretToken: formSecretToken }),
      };

      if (editingWebhook) {
        const { data } = await webhookApi.update(editingWebhook.id, request);
        setWebhooks(prev => prev.map(w => w.id === data.id ? data : w));
      } else {
        const { data } = await webhookApi.create(request);
        setWebhooks(prev => [data, ...prev]);
      }
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save webhook');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (webhookId: number) => {
    setDeleting(webhookId);
    try {
      await webhookApi.delete(webhookId);
      setWebhooks(prev => prev.filter(w => w.id !== webhookId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete webhook');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (webhook: Webhook) => {
    setToggling(webhook.id);
    try {
      await webhookApi.toggle(webhook.id, !webhook.active);
      setWebhooks(prev => prev.map(w => w.id === webhook.id ? { ...w, active: !w.active } : w));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle webhook');
    } finally {
      setToggling(null);
    }
  };

  const handleTest = async (webhookId: number) => {
    setTesting(webhookId);
    setTestResult(null);
    try {
      await webhookApi.test(webhookId);
      setTestResult({ id: webhookId, success: true, message: 'Test webhook sent successfully!' });
    } catch (err: any) {
      setTestResult({ id: webhookId, success: false, message: err.response?.data?.message || 'Test failed' });
    } finally {
      setTesting(null);
    }
  };

  const toggleEvent = (event: WebhookEventType) => {
    setFormEvents(prev =>
      prev.includes(event)
        ? prev.filter(e => e !== event)
        : [...prev, event]
    );
  };

  const selectAllInCategory = (events: WebhookEventType[]) => {
    const allSelected = events.every(e => formEvents.includes(e));
    if (allSelected) {
      setFormEvents(prev => prev.filter(e => !events.includes(e)));
    } else {
      setFormEvents(prev => [...new Set([...prev, ...events])]);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white tracking-wide mb-2">
              Webhooks
            </h1>
            <p className="text-slate-500 font-mono text-sm uppercase tracking-wider">
              Get notified when events happen in your organization
            </p>
          </div>

          <button onClick={openCreateModal} className="btn btn-primary">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Webhook
          </button>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 bg-status-error/10 border border-status-error/30 rounded-lg">
            <p className="text-status-error text-sm">{error}</p>
          </div>
        )}

        {/* Test result toast */}
        {testResult && (
          <div className={`mb-6 p-4 rounded-lg ${testResult.success ? 'bg-status-online/10 border border-status-online/30' : 'bg-status-error/10 border border-status-error/30'}`}>
            <p className={`text-sm ${testResult.success ? 'text-status-online' : 'text-status-error'}`}>{testResult.message}</p>
          </div>
        )}

        {/* Webhooks List */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-cyber-600 via-cyber-400 to-cyber-600" />

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-cyber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500 font-mono text-sm">Loading webhooks...</p>
            </div>
          ) : webhooks.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-5 5v-5zM15 17V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h7" />
              </svg>
              <p className="text-slate-500 font-mono text-sm uppercase tracking-wider mb-4">No webhooks yet</p>
              <button onClick={openCreateModal} className="btn btn-primary">
                Create your first webhook
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        webhook.type === 'DISCORD' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' :
                        webhook.type === 'SLACK' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                        webhook.type === 'EMAIL' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {getTypeIcon(webhook.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 dark:text-white truncate">{webhook.name}</p>
                          <span className={`px-2 py-0.5 text-2xs font-mono rounded ${
                            webhook.active
                              ? 'bg-status-online/10 text-status-online'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {webhook.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono truncate mt-0.5">{webhook.url}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {webhook.events.slice(0, 3).map(event => (
                            <span key={event} className="px-2 py-0.5 text-2xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                              {event}
                            </span>
                          ))}
                          {webhook.events.length > 3 && (
                            <span className="px-2 py-0.5 text-2xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                              +{webhook.events.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      {/* Stats */}
                      <div className="hidden lg:flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Success</p>
                          <p className="text-sm font-medium text-status-online">{webhook.deliverySuccessCount}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Failed</p>
                          <p className="text-sm font-medium text-status-error">{webhook.deliveryFailureCount}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Rate</p>
                          <p className={`text-sm font-medium ${webhook.successRate >= 90 ? 'text-status-online' : webhook.successRate >= 70 ? 'text-status-warning' : 'text-status-error'}`}>
                            {webhook.successRate.toFixed(0)}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Last</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{formatRelativeTime(webhook.lastTriggeredAt)}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTest(webhook.id)}
                          disabled={testing === webhook.id}
                          className="btn btn-ghost text-xs"
                          title="Send test webhook"
                        >
                          {testing === webhook.id ? (
                            <div className="w-4 h-4 border-2 border-cyber-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleToggle(webhook)}
                          disabled={toggling === webhook.id}
                          className="btn btn-ghost text-xs"
                          title={webhook.active ? 'Disable' : 'Enable'}
                        >
                          {toggling === webhook.id ? (
                            <div className="w-4 h-4 border-2 border-cyber-500 border-t-transparent rounded-full animate-spin" />
                          ) : webhook.active ? (
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
                          onClick={() => openEditModal(webhook)}
                          className="btn btn-ghost text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(webhook.id)}
                          disabled={deleting === webhook.id}
                          className="btn btn-ghost text-status-error hover:bg-status-error/10 text-xs"
                        >
                          {deleting === webhook.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Failure info */}
                  {webhook.lastFailureReason && (
                    <div className="mt-3 ml-14 p-2 bg-status-error/5 border border-status-error/20 rounded text-xs">
                      <p className="text-status-error font-mono">
                        Last failure ({formatRelativeTime(webhook.lastFailureAt)}): {webhook.lastFailureReason}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Webhook Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="relative w-full max-w-2xl mx-4 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-cyber-500" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-cyber-500" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-cyber-500" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-cyber-500" />

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-cyber-600 via-cyber-400 to-cyber-600" />

              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-4">
                  {editingWebhook ? 'Edit Webhook' : 'Create Webhook'}
                </h3>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                      Webhook Name
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Production Alerts"
                      className="input"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                      Type
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {WEBHOOK_TYPES.map(type => (
                        <button
                          key={type.value}
                          onClick={() => setFormType(type.value)}
                          className={`p-3 rounded-lg border transition-colors flex flex-col items-center gap-2 ${
                            formType === type.value
                              ? 'border-cyber-500 bg-cyber-500/10 text-cyber-600 dark:text-cyber-400'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                        >
                          <div className={`w-8 h-8 flex items-center justify-center ${
                            formType === type.value ? '' : 'text-slate-400'
                          }`}>
                            {getTypeIcon(type.value)}
                          </div>
                          <span className="text-xs font-medium">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* URL */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                      {formType === 'DISCORD' ? 'Discord Webhook URL' :
                       formType === 'SLACK' ? 'Slack Webhook URL' :
                       formType === 'EMAIL' ? 'Email Address' :
                       'Webhook URL'}
                    </label>
                    <input
                      type={formType === 'EMAIL' ? 'email' : 'url'}
                      value={formUrl}
                      onChange={(e) => setFormUrl(e.target.value)}
                      placeholder={
                        formType === 'DISCORD' ? 'https://discord.com/api/webhooks/...' :
                        formType === 'SLACK' ? 'https://hooks.slack.com/services/...' :
                        formType === 'EMAIL' ? 'alerts@yourcompany.com' :
                        'https://api.yourservice.com/webhook'
                      }
                      className="input font-mono text-sm"
                    />
                  </div>

                  {/* Secret Token (only for Custom type) */}
                  {formType === 'CUSTOM' && (
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                        Secret Token (optional)
                      </label>
                      <input
                        type="text"
                        value={formSecretToken}
                        onChange={(e) => setFormSecretToken(e.target.value)}
                        placeholder="Used to sign webhook payloads"
                        className="input font-mono text-sm"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        We'll include an X-Webhook-Signature header with HMAC-SHA256 signature
                      </p>
                    </div>
                  )}

                  {/* Events */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                      Events to Subscribe
                    </label>
                    <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                      {EVENT_CATEGORIES.map(category => (
                        <div key={category.name}>
                          <button
                            onClick={() => selectAllInCategory(category.events.map(e => e.value))}
                            className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-2"
                          >
                            <span>{category.name}</span>
                            <span className="text-cyber-500">
                              {category.events.every(e => formEvents.includes(e.value)) ? '(deselect all)' : '(select all)'}
                            </span>
                          </button>
                          <div className="grid grid-cols-2 gap-2">
                            {category.events.map(event => (
                              <label
                                key={event.value}
                                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                                  formEvents.includes(event.value)
                                    ? 'bg-cyber-500/10 border border-cyber-500/30'
                                    : 'bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={formEvents.includes(event.value)}
                                  onChange={() => toggleEvent(event.value)}
                                  className="w-4 h-4 rounded border-slate-300 text-cyber-500 focus:ring-cyber-500"
                                />
                                <div>
                                  <p className="text-sm font-medium text-slate-900 dark:text-white">{event.label}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
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
                    disabled={!formName.trim() || !formUrl.trim() || formEvents.length === 0 || saving}
                    className="flex-1 btn btn-primary"
                  >
                    {saving ? 'Saving...' : editingWebhook ? 'Save Changes' : 'Create Webhook'}
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
