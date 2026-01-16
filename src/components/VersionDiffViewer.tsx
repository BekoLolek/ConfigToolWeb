import { useEffect, useState, useMemo } from 'react';
import { diffLines, Change } from 'diff';
import { fileApi } from '../api/endpoints';
import clsx from 'clsx';

interface VersionDiffViewerProps {
  serverId: string;
  filePath: string;
  leftVersionId: string;  // Older version (or 'current' for live file)
  rightVersionId: string; // Newer version (or 'current' for live file)
  leftLabel?: string;
  rightLabel?: string;
  onClose: () => void;
}

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  leftLineNum?: number;
  rightLineNum?: number;
}

export default function VersionDiffViewer({
  serverId,
  filePath,
  leftVersionId,
  rightVersionId,
  leftLabel = 'Older Version',
  rightLabel = 'Newer Version',
  onClose,
}: VersionDiffViewerProps) {
  const [leftContent, setLeftContent] = useState<string | null>(null);
  const [rightContent, setRightContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnlyChanges, setShowOnlyChanges] = useState(false);
  const [contextLines, setContextLines] = useState(3);

  // Fetch both versions
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const fetchVersions = async () => {
      try {
        // Handle 'current' special value for either side
        const leftPromise = leftVersionId === 'current'
          ? fileApi.getContent(serverId, filePath)
          : fileApi.getVersion(serverId, leftVersionId);

        const rightPromise = rightVersionId === 'current'
          ? fileApi.getContent(serverId, filePath)
          : fileApi.getVersion(serverId, rightVersionId);

        const [leftRes, rightRes] = await Promise.all([leftPromise, rightPromise]);

        if (mounted) {
          setLeftContent(leftRes.data.content);
          setRightContent(rightRes.data.content);
        }
      } catch (e: any) {
        if (mounted) {
          setError(e.response?.data?.message || 'Failed to load versions');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchVersions();
    return () => { mounted = false; };
  }, [serverId, filePath, leftVersionId, rightVersionId]);

  // Compute diff
  const diffResult = useMemo<DiffLine[]>(() => {
    if (leftContent === null || rightContent === null) return [];

    const changes = diffLines(leftContent, rightContent);
    const lines: DiffLine[] = [];
    let leftLineNum = 1;
    let rightLineNum = 1;

    changes.forEach((change: Change) => {
      const changeLines = change.value.split('\n');
      // Remove last empty string if the value ends with newline
      if (changeLines[changeLines.length - 1] === '') {
        changeLines.pop();
      }

      changeLines.forEach((line) => {
        if (change.removed) {
          lines.push({
            type: 'removed',
            content: line,
            leftLineNum: leftLineNum++,
          });
        } else if (change.added) {
          lines.push({
            type: 'added',
            content: line,
            rightLineNum: rightLineNum++,
          });
        } else {
          lines.push({
            type: 'unchanged',
            content: line,
            leftLineNum: leftLineNum++,
            rightLineNum: rightLineNum++,
          });
        }
      });
    });

    return lines;
  }, [leftContent, rightContent]);

  // Filter lines based on showOnlyChanges
  const displayLines = useMemo(() => {
    if (!showOnlyChanges) return diffResult;

    const result: (DiffLine | { type: 'separator'; count: number })[] = [];
    let skippedCount = 0;

    diffResult.forEach((line, index) => {
      const isChange = line.type !== 'unchanged';
      const hasNearbyChange = diffResult
        .slice(Math.max(0, index - contextLines), Math.min(diffResult.length, index + contextLines + 1))
        .some(l => l.type !== 'unchanged');

      if (isChange || hasNearbyChange) {
        if (skippedCount > 0) {
          result.push({ type: 'separator', count: skippedCount });
          skippedCount = 0;
        }
        result.push(line);
      } else {
        skippedCount++;
      }
    });

    if (skippedCount > 0) {
      result.push({ type: 'separator', count: skippedCount });
    }

    return result;
  }, [diffResult, showOnlyChanges, contextLines]);

  // Stats
  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    diffResult.forEach(line => {
      if (line.type === 'added') added++;
      if (line.type === 'removed') removed++;
    });
    return { added, removed };
  }, [diffResult]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 flex items-center gap-3">
          <svg className="w-5 h-5 animate-spin text-cyber-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-white">Loading versions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-slate-900 border border-red-500/50 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 text-red-500 mb-4">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Error loading diff</span>
          </div>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button onClick={onClose} className="btn btn-secondary w-full">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="relative w-full max-w-5xl mx-4 max-h-[90vh] flex flex-col animate-slide-up">
        {/* Corner accents */}
        <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-cyber-500" />
        <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-cyber-500" />
        <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-cyber-500" />
        <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-cyber-500" />

        <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header stripe */}
          <div className="h-1 bg-gradient-to-r from-cyber-600 via-cyber-400 to-cyber-600 flex-shrink-0" />

          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyber-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-cyber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">Version Comparison</h3>
                <p className="text-sm text-slate-500 font-mono truncate max-w-md">{filePath}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Toolbar */}
          <div className="p-3 border-b border-slate-800 flex items-center justify-between flex-shrink-0 bg-slate-850">
            <div className="flex items-center gap-4">
              {/* Version labels */}
              <div className="flex items-center gap-2 text-sm">
                <span className="px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/30 font-mono text-xs">
                  {leftLabel}
                </span>
                <span className="text-slate-600">vs</span>
                <span className="px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/30 font-mono text-xs">
                  {rightLabel}
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1 text-green-400">
                  <span>+{stats.added}</span>
                </span>
                <span className="flex items-center gap-1 text-red-400">
                  <span>-{stats.removed}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Context lines selector */}
              {showOnlyChanges && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Context:</span>
                  <select
                    value={contextLines}
                    onChange={(e) => setContextLines(Number(e.target.value))}
                    className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                  >
                    <option value={0}>None</option>
                    <option value={3}>3 lines</option>
                    <option value={5}>5 lines</option>
                    <option value={10}>10 lines</option>
                  </select>
                </div>
              )}

              {/* Toggle changes only */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyChanges}
                  onChange={(e) => setShowOnlyChanges(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 text-cyber-500 focus:ring-cyber-500 bg-slate-800"
                />
                <span className="text-xs text-slate-400">Show only changes</span>
              </label>
            </div>
          </div>

          {/* Diff content */}
          <div className="flex-1 overflow-auto font-mono text-sm">
            {diffResult.length === 0 ? (
              <div className="flex items-center justify-center h-full p-8">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto text-slate-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-slate-400">No differences found</p>
                  <p className="text-slate-600 text-xs mt-1">The two versions are identical</p>
                </div>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <tbody>
                  {displayLines.map((line, index) => {
                    if ('count' in line) {
                      // Separator for skipped lines
                      return (
                        <tr key={`sep-${index}`} className="bg-slate-800/50">
                          <td colSpan={3} className="py-2 px-4 text-center text-slate-500 text-xs">
                            <div className="flex items-center justify-center gap-2">
                              <div className="h-px flex-1 bg-slate-700" />
                              <span>{line.count} unchanged line{line.count !== 1 ? 's' : ''} hidden</span>
                              <div className="h-px flex-1 bg-slate-700" />
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr
                        key={index}
                        className={clsx(
                          'hover:brightness-110 transition-all',
                          line.type === 'removed' && 'bg-red-500/10',
                          line.type === 'added' && 'bg-green-500/10',
                          line.type === 'unchanged' && 'bg-transparent'
                        )}
                      >
                        {/* Line numbers */}
                        <td className={clsx(
                          'w-12 text-right pr-2 select-none border-r',
                          line.type === 'removed' && 'text-red-400/60 border-red-500/30',
                          line.type === 'added' && 'text-slate-600 border-green-500/30',
                          line.type === 'unchanged' && 'text-slate-600 border-slate-800'
                        )}>
                          {line.leftLineNum ?? ''}
                        </td>
                        <td className={clsx(
                          'w-12 text-right pr-2 select-none border-r',
                          line.type === 'removed' && 'text-slate-600 border-red-500/30',
                          line.type === 'added' && 'text-green-400/60 border-green-500/30',
                          line.type === 'unchanged' && 'text-slate-600 border-slate-800'
                        )}>
                          {line.rightLineNum ?? ''}
                        </td>

                        {/* Change indicator and content */}
                        <td className="relative">
                          <div className="flex">
                            {/* Change indicator bar */}
                            <div className={clsx(
                              'w-1 flex-shrink-0',
                              line.type === 'removed' && 'bg-red-500',
                              line.type === 'added' && 'bg-green-500',
                              line.type === 'unchanged' && 'bg-transparent'
                            )} />

                            {/* Prefix symbol */}
                            <span className={clsx(
                              'w-6 flex-shrink-0 text-center select-none',
                              line.type === 'removed' && 'text-red-400',
                              line.type === 'added' && 'text-green-400',
                              line.type === 'unchanged' && 'text-slate-700'
                            )}>
                              {line.type === 'removed' && '-'}
                              {line.type === 'added' && '+'}
                              {line.type === 'unchanged' && ' '}
                            </span>

                            {/* Content */}
                            <pre className={clsx(
                              'flex-1 whitespace-pre-wrap break-all py-0.5 pr-4',
                              line.type === 'removed' && 'text-red-200',
                              line.type === 'added' && 'text-green-200',
                              line.type === 'unchanged' && 'text-slate-400'
                            )}>
                              {line.content || ' '}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 flex justify-end flex-shrink-0">
            <button onClick={onClose} className="btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
