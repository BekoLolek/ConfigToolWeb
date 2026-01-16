import { useEffect, useState } from 'react';
import { fileApi } from '../api/endpoints';
import type { Version } from '../types';
import clsx from 'clsx';
import VersionDiffViewer from './VersionDiffViewer';

interface Props {
  serverId: string;
  filePath: string;
  onRestore: () => void;
}

export default function VersionHistory({ serverId, filePath, onRestore }: Props) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ id: string; content: string } | null>(null);

  // Compare mode state
  const [compareMode, setCompareMode] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<Set<string>>(new Set());
  const [diffView, setDiffView] = useState<{
    leftId: string;
    rightId: string;
    leftLabel: string;
    rightLabel: string;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setPreview(null);
    fileApi.getVersions(serverId, filePath)
      .then(r => { if (mounted) setVersions(r.data); })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [serverId, filePath]);

  const handlePreview = async (id: string) => {
    if (preview?.id === id) {
      setPreview(null);
      return;
    }
    try {
      const r = await fileApi.getVersion(serverId, id);
      setPreview({ id, content: r.data.content });
    } catch {}
  };

  const handleRestore = async (id: string) => {
    if (!confirm('Restore this version? The current content will be replaced.')) return;
    setRestoring(id);
    try {
      await fileApi.restore(serverId, filePath, id);
      onRestore();
    } catch {}
    setRestoring(null);
  };

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
    setSelectedVersions(new Set());
    setPreview(null);
  };

  const toggleVersionSelection = (id: string) => {
    setSelectedVersions(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 2) {
        next.add(id);
      } else {
        // Replace oldest selection
        const [first] = next;
        next.delete(first);
        next.add(id);
      }
      return next;
    });
  };

  const openComparison = () => {
    if (selectedVersions.size !== 2) return;
    const [id1, id2] = Array.from(selectedVersions);
    const v1 = versions.find(v => v.id === id1);
    const v2 = versions.find(v => v.id === id2);
    if (!v1 || !v2) return;

    // Determine which is older (by createdAt)
    const [older, newer] = new Date(v1.createdAt) < new Date(v2.createdAt) ? [v1, v2] : [v2, v1];

    setDiffView({
      leftId: older.id,
      rightId: newer.id,
      leftLabel: formatTime(older.createdAt),
      rightLabel: formatTime(newer.createdAt),
    });
  };

  const compareWithCurrent = (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (!version) return;

    setDiffView({
      leftId: versionId,
      rightId: 'current',
      leftLabel: formatTime(version.createdAt),
      rightLabel: 'Current',
    });
  };

  const compareWithPrevious = (versionId: string, index: number) => {
    if (index >= versions.length - 1) return;
    const current = versions[index];
    const previous = versions[index + 1];

    setDiffView({
      leftId: previous.id,
      rightId: current.id,
      leftLabel: formatTime(previous.createdAt),
      rightLabel: formatTime(current.createdAt),
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-slate-500">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-xs font-mono uppercase tracking-wider">Loading...</span>
        </div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <svg className="w-8 h-8 mx-auto text-slate-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-slate-600 text-xs font-mono uppercase tracking-wider">No history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Diff viewer modal */}
      {diffView && (
        <VersionDiffViewer
          serverId={serverId}
          filePath={filePath}
          leftVersionId={diffView.leftId}
          rightVersionId={diffView.rightId}
          leftLabel={diffView.leftLabel}
          rightLabel={diffView.rightLabel}
          onClose={() => setDiffView(null)}
        />
      )}

      {/* Panel header - h-16 matches main header */}
      <div className="h-16 px-3 flex items-center gap-2 flex-shrink-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <svg className="w-4 h-4 text-cyber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-display font-semibold text-sm uppercase tracking-wider text-slate-600 dark:text-slate-400">History</span>
        <span className="text-2xs bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">{versions.length}</span>

        {/* Compare mode toggle */}
        <button
          onClick={toggleCompareMode}
          className={clsx(
            'ml-auto px-2 py-1 text-2xs font-mono uppercase tracking-wider rounded transition-all',
            compareMode
              ? 'bg-cyber-500/20 text-cyber-400 border border-cyber-500/50'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-slate-700'
          )}
        >
          {compareMode ? 'Exit Compare' : 'Compare'}
        </button>
      </div>

      {/* Compare toolbar (when in compare mode) */}
      {compareMode && (
        <div className="px-3 py-2 bg-slate-850 border-b border-slate-700 flex items-center gap-2">
          <span className="text-2xs text-slate-500">
            Select 2 versions to compare ({selectedVersions.size}/2)
          </span>
          {selectedVersions.size === 2 && (
            <button
              onClick={openComparison}
              className="ml-auto px-2 py-1 text-2xs font-mono uppercase tracking-wider rounded bg-cyber-500/20 text-cyber-400 border border-cyber-500/50 hover:bg-cyber-500/30 transition-all"
            >
              Compare Selected
            </button>
          )}
        </div>
      )}

      {/* Versions list */}
      <div className="flex-1 overflow-y-auto min-h-0 p-3 space-y-2">
        {versions.map((version, index) => (
          <div
            key={version.id}
            className={clsx(
              'bg-slate-850 border rounded-lg overflow-hidden transition-all duration-200',
              index === 0 ? 'border-cyber-500/30' : 'border-slate-700 hover:border-slate-600',
              compareMode && selectedVersions.has(version.id) && 'ring-2 ring-cyber-500/50'
            )}
          >
            {/* Version header */}
            <div className="p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-start gap-2 min-w-0">
                  {/* Checkbox for compare mode */}
                  {compareMode && (
                    <input
                      type="checkbox"
                      checked={selectedVersions.has(version.id)}
                      onChange={() => toggleVersionSelection(version.id)}
                      className="mt-1 w-4 h-4 rounded border-slate-600 text-cyber-500 focus:ring-cyber-500 bg-slate-800"
                    />
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {index === 0 && (
                        <span className="text-2xs font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyber-500/10 text-cyber-400 border border-cyber-500/30">
                          Current
                        </span>
                      )}
                      <span className="text-xs font-mono text-slate-500">{formatTime(version.createdAt)}</span>
                    </div>
                    <p className="text-sm text-white truncate">
                      {version.message || (index === 0 ? 'Latest version' : 'No description')}
                    </p>
                  </div>
                </div>

                {/* Restore button (not for current version, not in compare mode) */}
                {!compareMode && index !== 0 && (
                  <button
                    onClick={() => handleRestore(version.id)}
                    disabled={restoring === version.id}
                    className={clsx(
                      'flex-shrink-0 px-2 py-1 text-xs font-display uppercase tracking-wider rounded transition-all',
                      restoring === version.id
                        ? 'bg-slate-700 text-slate-500 cursor-wait'
                        : 'bg-cyber-500/10 text-cyber-400 hover:bg-cyber-500/20 border border-cyber-500/30'
                    )}
                  >
                    {restoring === version.id ? (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Restoring
                      </span>
                    ) : 'Restore'}
                  </button>
                )}
              </div>

              {/* Actions row */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Preview toggle (not in compare mode) */}
                {!compareMode && (
                  <button
                    onClick={() => handlePreview(version.id)}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors"
                  >
                    <svg
                      className={clsx(
                        'w-3 h-3 transition-transform',
                        preview?.id === version.id && 'rotate-90'
                      )}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="font-mono uppercase tracking-wider">
                      {preview?.id === version.id ? 'Hide preview' : 'Show preview'}
                    </span>
                  </button>
                )}

                {/* Quick compare actions (not in compare mode, not for current) */}
                {!compareMode && index !== 0 && (
                  <>
                    <button
                      onClick={() => compareWithCurrent(version.id)}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-cyber-400 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="font-mono uppercase tracking-wider">Compare to current</span>
                    </button>

                    {index < versions.length - 1 && (
                      <button
                        onClick={() => compareWithPrevious(version.id, index)}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-cyber-400 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <span className="font-mono uppercase tracking-wider">Compare to previous</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Preview content */}
            {!compareMode && preview?.id === version.id && (
              <div className="border-t border-slate-700 animate-slide-up">
                <pre className="p-3 text-xs text-slate-400 font-mono overflow-x-auto max-h-48 bg-slate-900/50">
                  {preview.content}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
