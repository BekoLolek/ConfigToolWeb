import { useState, useEffect } from 'react';
import type { FileRestriction, ServerCollaborator, RestrictionType } from '../types';
import { filePermissionApi, collaboratorApi } from '../api/endpoints';
import { useToastStore } from '../stores/toastStore';

interface FilePermissionManagerProps {
  serverId: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function FilePermissionManager({ serverId }: FilePermissionManagerProps) {
  const [restrictions, setRestrictions] = useState<FileRestriction[]>([]);
  const [collaborators, setCollaborators] = useState<ServerCollaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Form state for adding new restriction
  const [selectedCollaborator, setSelectedCollaborator] = useState('');
  const [pathPattern, setPathPattern] = useState('plugins/');
  const [restrictionType, setRestrictionType] = useState<RestrictionType>('WRITE_DENIED');
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useToastStore();

  useEffect(() => {
    loadData();
  }, [serverId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [restrictionsRes, collaboratorsRes] = await Promise.all([
        filePermissionApi.list(serverId),
        collaboratorApi.list(serverId),
      ]);
      setRestrictions(restrictionsRes.data);
      setCollaborators(collaboratorsRes.data);
    } catch (error) {
      addToast('Failed to load permissions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRestriction = async () => {
    if (!selectedCollaborator || !pathPattern) {
      addToast('Please select a collaborator and enter a path', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const response = await filePermissionApi.add(serverId, {
        collaboratorUserId: selectedCollaborator,
        pathPattern: pathPattern,
        restrictionType: restrictionType,
      });
      setRestrictions([...restrictions, response.data]);
      addToast('File restriction added', 'success');
      setIsAddingNew(false);
      setSelectedCollaborator('');
      setPathPattern('plugins/');
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to add restriction', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveRestriction = async (restrictionId: string) => {
    setRemovingId(restrictionId);
    try {
      await filePermissionApi.remove(serverId, restrictionId);
      setRestrictions(restrictions.filter((r) => r.id !== restrictionId));
      addToast('Restriction removed', 'success');
    } catch (error) {
      addToast('Failed to remove restriction', 'error');
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-8 flex items-center justify-center">
        <svg className="w-6 h-6 text-cyber-500 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                File Permissions
              </h2>
              <p className="text-sm text-slate-500">
                Restrict collaborator access to specific files or folders
              </p>
            </div>
          </div>
          {!isAddingNew && collaborators.length > 0 && (
            <button
              onClick={() => setIsAddingNew(true)}
              className="px-3 py-1.5 text-sm font-medium bg-cyber-600 hover:bg-cyber-500 text-white rounded-lg transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Restriction
            </button>
          )}
        </div>
      </div>

      {/* Add new restriction form */}
      {isAddingNew && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Collaborator
              </label>
              <select
                value={selectedCollaborator}
                onChange={(e) => setSelectedCollaborator(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyber-500 focus:border-transparent"
              >
                <option value="">Select a collaborator...</option>
                {collaborators.map((c) => (
                  <option key={c.userId} value={c.userId}>
                    {c.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Path Pattern
              </label>
              <input
                type="text"
                value={pathPattern}
                onChange={(e) => setPathPattern(e.target.value)}
                placeholder="plugins/PluginName/ or plugins/PluginName/config.yml"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-cyber-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-slate-500">
                Must start with <code className="px-1 bg-slate-200 dark:bg-slate-700 rounded">plugins/</code>. Example: <code className="px-1 bg-slate-200 dark:bg-slate-700 rounded">plugins/Essentials/</code>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Restriction Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="restrictionType"
                    checked={restrictionType === 'WRITE_DENIED'}
                    onChange={() => setRestrictionType('WRITE_DENIED')}
                    className="text-cyber-500 focus:ring-cyber-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Read Only</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="restrictionType"
                    checked={restrictionType === 'READ_DENIED'}
                    onChange={() => setRestrictionType('READ_DENIED')}
                    className="text-cyber-500 focus:ring-cyber-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">No Access</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAddingNew(false)}
                className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRestriction}
                disabled={submitting || !selectedCollaborator || !pathPattern}
                className="px-4 py-1.5 text-sm font-medium bg-cyber-600 hover:bg-cyber-500 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? 'Adding...' : 'Add Restriction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restrictions list */}
      {restrictions.length === 0 ? (
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 mb-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
            <svg className="w-7 h-7 text-slate-400 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <p className="text-slate-500 font-mono text-sm uppercase tracking-wider mb-1">
            No restrictions
          </p>
          <p className="text-slate-600 dark:text-slate-500 text-xs max-w-[280px] mx-auto">
            All collaborators have full access to all files. Add restrictions to limit access to specific folders.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {restrictions.map((restriction) => (
            <div
              key={restriction.id}
              className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Icon based on restriction type */}
                <div className={`p-2 rounded-lg ${restriction.restrictionType === 'READ_DENIED' ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                  {restriction.restrictionType === 'READ_DENIED' ? (
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <code className="text-sm font-mono text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {restriction.pathPattern}
                    </code>
                    <span className={`px-2 py-0.5 text-2xs font-mono uppercase tracking-wider rounded ${
                      restriction.restrictionType === 'READ_DENIED'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {restriction.restrictionType === 'READ_DENIED' ? 'No Access' : 'Read Only'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {restriction.collaboratorEmail} · Added {formatDate(restriction.createdAt)}
                  </p>
                </div>
              </div>

              {/* Remove button */}
              <button
                onClick={() => handleRemoveRestriction(restriction.id)}
                disabled={removingId === restriction.id}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
              >
                {removingId === restriction.id ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Footer info */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500">
        <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          <strong>Read Only</strong> = can view but not edit · <strong>No Access</strong> = cannot view or edit
        </span>
      </div>
    </div>
  );
}
