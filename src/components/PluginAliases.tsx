import { useState, useEffect } from 'react';
import { pluginAliasApi } from '../api/endpoints';
import type { PluginAlias } from '../types';
import { toast } from '../stores/toastStore';

interface PluginAliasesProps {
  serverId: string;
  isOwner: boolean;
}

export default function PluginAliases({ serverId, isOwner }: PluginAliasesProps) {
  const [aliases, setAliases] = useState<PluginAlias[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState('');
  const [commandPrefix, setCommandPrefix] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAliases();
  }, [serverId]);

  const loadAliases = async () => {
    try {
      const response = await pluginAliasApi.list(serverId);
      setAliases(response.data);
    } catch (error) {
      console.error('Failed to load aliases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!folderName.trim() || !commandPrefix.trim()) return;
    setSaving(true);
    try {
      await pluginAliasApi.create(serverId, { folderName, commandPrefix });
      toast.success('Alias added');
      setFolderName('');
      setCommandPrefix('');
      setShowAddForm(false);
      loadAliases();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add alias');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (aliasId: string) => {
    if (!folderName.trim() || !commandPrefix.trim()) return;
    setSaving(true);
    try {
      await pluginAliasApi.update(serverId, aliasId, { folderName, commandPrefix });
      toast.success('Alias updated');
      setEditingId(null);
      setFolderName('');
      setCommandPrefix('');
      loadAliases();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update alias');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (aliasId: string) => {
    if (!confirm('Delete this alias?')) return;
    try {
      await pluginAliasApi.delete(serverId, aliasId);
      toast.success('Alias deleted');
      loadAliases();
    } catch (error) {
      toast.error('Failed to delete alias');
    }
  };

  const startEdit = (alias: PluginAlias) => {
    setEditingId(alias.id);
    setFolderName(alias.folderName);
    setCommandPrefix(alias.commandPrefix);
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFolderName('');
    setCommandPrefix('');
  };

  if (loading) {
    return (
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded"></div>
          <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500">
          Plugin Command Aliases
        </h4>
        {isOwner && !showAddForm && (
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingId(null);
              setFolderName('');
              setCommandPrefix('');
            }}
            className="text-xs text-cyber-500 hover:text-cyber-400 flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Alias
          </button>
        )}
      </div>

      <p className="text-xs text-slate-500 mb-4">
        Map plugin folder names to their reload commands. For example: folder "dungeons" → command "dng reload"
      </p>

      {/* Add Form */}
      {showAddForm && isOwner && (
        <div className="mb-4 p-3 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Folder Name</label>
              <input
                type="text"
                value={folderName}
                onChange={e => setFolderName(e.target.value)}
                placeholder="e.g., dungeons"
                className="input text-sm"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Command Prefix</label>
              <input
                type="text"
                value={commandPrefix}
                onChange={e => setCommandPrefix(e.target.value)}
                placeholder="e.g., dng"
                className="input text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowAddForm(false);
                setFolderName('');
                setCommandPrefix('');
              }}
              className="btn btn-secondary text-xs py-1 px-3"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={saving || !folderName.trim() || !commandPrefix.trim()}
              className="btn btn-primary text-xs py-1 px-3 disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {/* Aliases List */}
      {aliases.length === 0 ? (
        <div className="text-sm text-slate-500 text-center py-4">
          No aliases configured. When you save a file with reload enabled, the folder name will be used as the reload command.
        </div>
      ) : (
        <div className="space-y-2">
          {aliases.map(alias => (
            <div
              key={alias.id}
              className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700"
            >
              {editingId === alias.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={folderName}
                    onChange={e => setFolderName(e.target.value)}
                    className="input text-sm flex-1"
                    placeholder="Folder name"
                  />
                  <span className="text-slate-400">→</span>
                  <input
                    type="text"
                    value={commandPrefix}
                    onChange={e => setCommandPrefix(e.target.value)}
                    className="input text-sm flex-1"
                    placeholder="Command prefix"
                  />
                  <button
                    onClick={cancelEdit}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleUpdate(alias.id)}
                    disabled={saving}
                    className="p-1 text-cyber-500 hover:text-cyber-400"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {alias.folderName}
                    </code>
                    <span className="text-slate-400">→</span>
                    <code className="text-sm font-mono text-cyber-500 bg-cyber-500/10 px-2 py-0.5 rounded">
                      {alias.commandPrefix} reload
                    </code>
                  </div>
                  {isOwner && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(alias)}
                        className="p-1 text-slate-400 hover:text-cyber-500"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(alias.id)}
                        className="p-1 text-slate-400 hover:text-status-error"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
