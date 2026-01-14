import { useEffect, useState } from 'react';
import { fileApi } from '../api/endpoints';
import type { Version } from '../types';
import clsx from 'clsx';

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
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="panel-header flex items-center gap-2 flex-shrink-0">
        <svg className="w-4 h-4 text-cyber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Version History</span>
        <span className="ml-auto text-2xs bg-slate-800 px-2 py-0.5 rounded-full">{versions.length}</span>
      </div>

      {/* Versions list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {versions.map((version, index) => (
          <div
            key={version.id}
            className={clsx(
              'bg-slate-850 border rounded-lg overflow-hidden transition-all duration-200',
              index === 0 ? 'border-cyber-500/30' : 'border-slate-700 hover:border-slate-600'
            )}
          >
            {/* Version header */}
            <div className="p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
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

                {/* Restore button (not for current version) */}
                {index !== 0 && (
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

              {/* Preview toggle */}
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
            </div>

            {/* Preview content */}
            {preview?.id === version.id && (
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
