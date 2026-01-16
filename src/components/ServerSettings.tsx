import { useState } from 'react';
import { useServerStore } from '../stores/serverStore';
import { useAuthStore } from '../stores/authStore';
import type { Server } from '../types';
import PluginAliases from './PluginAliases';

interface ServerSettingsProps {
  server: Server;
  isOpen: boolean;
  onClose: () => void;
}

export default function ServerSettings({ server, isOpen, onClose }: ServerSettingsProps) {
  const { updateServer, groups, fetchGroups } = useServerStore();
  const { user } = useAuthStore();
  const isOwner = user?.id === server.ownerId;
  const [name, setName] = useState(server.name);
  const [groupName, setGroupName] = useState(server.groupName || '');
  const [notes, setNotes] = useState(server.notes || '');
  const [saving, setSaving] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateServer(server.id, { name, groupName, notes });
      fetchGroups();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="relative w-full max-w-lg mx-4 animate-slide-up">
        <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-cyber-500" />
        <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-cyber-500" />
        <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-cyber-500" />
        <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-cyber-500" />

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl dark:shadow-panel overflow-hidden max-h-[90vh] overflow-y-auto">
          <div className="h-1 bg-gradient-to-r from-cyber-600 via-cyber-400 to-cyber-600" />

          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                Server Settings
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Connection Diagnostics */}
            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-3">Connection Diagnostics</h4>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${server.online ? 'bg-status-online animate-pulse' : 'bg-slate-400'}`} />
                <span className={`text-sm font-mono ${server.online ? 'text-status-online' : 'text-slate-500'}`}>
                  {server.online ? 'Agent Connected' : 'Agent Disconnected'}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className={server.online ? 'text-status-online' : 'text-slate-600 dark:text-slate-400'}>
                    {server.online ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Seen</span>
                  <span className="text-slate-600 dark:text-slate-400 font-mono text-xs">{formatDate(server.lastSeenAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Created</span>
                  <span className="text-slate-600 dark:text-slate-400 font-mono text-xs">{formatDate(server.createdAt)}</span>
                </div>
              </div>
              {!server.online && (
                <div className="mt-4 p-3 bg-status-warning/10 border border-status-warning/30 rounded text-xs text-status-warning">
                  <strong>Troubleshooting:</strong> Ensure the ConfigTool agent plugin is installed and the connection token matches.
                </div>
              )}
            </div>

            {/* Statistics Section */}
            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-3">Statistics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-display font-bold text-slate-900 dark:text-white">{server.totalConnections}</div>
                  <div className="text-xs font-mono text-slate-500">Total Connections</div>
                </div>
                <div>
                  <div className="text-2xl font-display font-bold text-slate-900 dark:text-white">{server.totalFileEdits}</div>
                  <div className="text-xs font-mono text-slate-500">Total File Edits</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm font-mono text-slate-600 dark:text-slate-400">{formatDate(server.lastFileEditAt)}</div>
                  <div className="text-xs font-mono text-slate-500">Last File Edit</div>
                </div>
              </div>
            </div>

            {/* Plugin Aliases Section */}
            <div className="mb-6">
              <PluginAliases serverId={server.id} isOwner={isOwner} />
            </div>

            {/* Server Name */}
            <div className="mb-4">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                Server Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input"
              />
            </div>

            {/* Group */}
            <div className="mb-4">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                Group
              </label>
              {showNewGroup ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    placeholder="Enter new group name"
                    className="input flex-1"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewGroup(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    className="input flex-1"
                  >
                    <option value="">No group</option>
                    {groups.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewGroup(true)}
                    className="btn btn-secondary"
                    title="Create new group"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add notes about this server..."
                className="input min-h-[100px] resize-y"
                maxLength={500}
              />
              <div className="text-xs text-slate-500 mt-1 text-right">{notes.length}/500</div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="flex-1 btn btn-primary disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
