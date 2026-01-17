import { useState, useEffect, useMemo } from 'react';
import { auditLogApi } from '../api/endpoints';
import type { AuditLog, AuditAction, PageResponse } from '../types';
import clsx from 'clsx';

interface ServerAuditLogProps {
  serverId: string;
  isOpen: boolean;
  onClose: () => void;
}

// Action category definitions with colors and icons
const ACTION_CATEGORIES = {
  server: {
    label: 'Server',
    actions: ['SERVER_CREATED', 'SERVER_UPDATED', 'SERVER_DELETED', 'SERVER_TOKEN_REGENERATED', 'SERVER_CONNECTED', 'SERVER_DISCONNECTED'] as AuditAction[],
    color: 'cyber',
  },
  file: {
    label: 'Files',
    actions: ['FILE_CREATED', 'FILE_UPDATED', 'FILE_RENAMED', 'FILE_DELETED', 'FILE_RESTORED'] as AuditAction[],
    color: 'amber',
  },
  collaborator: {
    label: 'Team',
    actions: ['COLLABORATOR_ADDED', 'COLLABORATOR_REMOVED'] as AuditAction[],
    color: 'violet',
  },
};

// Get action color based on type
function getActionColor(action: AuditAction): string {
  switch (action) {
    case 'SERVER_CREATED':
    case 'FILE_CREATED':
    case 'COLLABORATOR_ADDED':
      return 'status-online';
    case 'SERVER_CONNECTED':
      return 'cyber';
    case 'SERVER_UPDATED':
    case 'FILE_UPDATED':
    case 'FILE_RENAMED':
    case 'SERVER_TOKEN_REGENERATED':
      return 'status-warning';
    case 'SERVER_DELETED':
    case 'FILE_DELETED':
    case 'SERVER_DISCONNECTED':
    case 'COLLABORATOR_REMOVED':
      return 'status-error';
    case 'FILE_RESTORED':
      return 'violet';
    default:
      return 'slate';
  }
}

// Get action icon SVG
function getActionIcon(action: AuditAction) {
  switch (action) {
    case 'SERVER_CREATED':
      return (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      );
    case 'SERVER_UPDATED':
      return (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      );
    case 'SERVER_DELETED':
    case 'FILE_DELETED':
    case 'COLLABORATOR_REMOVED':
      return (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      );
    case 'SERVER_TOKEN_REGENERATED':
      return (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      );
    case 'SERVER_CONNECTED':
      return (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      );
    case 'SERVER_DISCONNECTED':
      return (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      );
    case 'FILE_CREATED':
      return (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      );
    case 'FILE_UPDATED':
      return (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      );
    case 'FILE_RENAMED':
      return (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      );
    case 'FILE_RESTORED':
      return (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      );
    case 'COLLABORATOR_ADDED':
      return (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      );
    default:
      return (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      );
  }
}

// Format relative time
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

// Format full timestamp
function formatTimestamp(dateStr: string): string {
  return new Date(dateStr).toLocaleString();
}

// Parse and format details JSON
function parseDetails(details: string | null): Record<string, unknown> | null {
  if (!details) return null;
  try {
    return JSON.parse(details);
  } catch {
    return null;
  }
}

export default function ServerAuditLog({ serverId, isOpen, onClose }: ServerAuditLogProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['server', 'file', 'collaborator']));
  const [loadingMore, setLoadingMore] = useState(false);

  // Filtered logs based on active category filters
  const filteredLogs = useMemo(() => {
    const allowedActions = new Set<AuditAction>();
    activeFilters.forEach(category => {
      const cat = ACTION_CATEGORIES[category as keyof typeof ACTION_CATEGORIES];
      if (cat) {
        cat.actions.forEach(action => allowedActions.add(action));
      }
    });
    return logs.filter(log => allowedActions.has(log.action));
  }, [logs, activeFilters]);

  // Fetch logs
  const fetchLogs = async (pageNum: number, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await auditLogApi.getServerLogs(serverId, pageNum, 30);
      const data = response.data as PageResponse<AuditLog>;

      if (append) {
        setLogs(prev => [...prev, ...data.content]);
      } else {
        setLogs(data.content);
      }

      setHasMore(!data.last);
      setTotalElements(data.totalElements);
      setPage(pageNum);
    } catch (err) {
      setError('Failed to load audit logs');
      console.error('Audit log error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial fetch when opened
  useEffect(() => {
    if (isOpen) {
      fetchLogs(0);
    }
  }, [isOpen, serverId]);

  // Toggle filter
  const toggleFilter = (category: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        // Don't allow removing all filters
        if (next.size > 1) {
          next.delete(category);
        }
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Load more
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchLogs(page + 1, true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-fade-in">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyber-500/50 rounded-tl-xl" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyber-500/50 rounded-tr-xl" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyber-500/50 rounded-bl-xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyber-500/50 rounded-br-xl" />

        {/* Gradient top border */}
        <div className="h-1 bg-gradient-to-r from-transparent via-cyber-500 to-transparent" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Terminal icon with glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-cyber-500/20 blur-lg rounded-full" />
              <div className="relative w-10 h-10 rounded-lg bg-slate-800 border border-cyber-500/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-cyber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                Activity Log
                <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                  // security monitor
                </span>
              </h2>
              <p className="text-sm text-slate-400 font-mono">
                {totalElements > 0 ? (
                  <>
                    <span className="text-cyber-400">{totalElements}</span> recorded events
                  </>
                ) : (
                  'Loading events...'
                )}
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filter chips */}
        <div className="px-6 py-3 border-b border-slate-800/50 bg-slate-900/50 flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider mr-2">Filter:</span>
          {Object.entries(ACTION_CATEGORIES).map(([key, category]) => (
            <button
              key={key}
              onClick={() => toggleFilter(key)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all border',
                activeFilters.has(key)
                  ? category.color === 'cyber'
                    ? 'bg-cyber-500/20 text-cyber-400 border-cyber-500/30 shadow-[0_0_10px_rgba(12,184,196,0.2)]'
                    : category.color === 'amber'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                    : 'bg-violet-500/20 text-violet-400 border-violet-500/30 shadow-[0_0_10px_rgba(139,92,246,0.2)]'
                  : 'bg-slate-800/50 text-slate-500 border-slate-700 hover:border-slate-600'
              )}
            >
              {category.label}
            </button>
          ))}

          {/* Refresh button */}
          <button
            onClick={() => fetchLogs(0)}
            className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-cyber-400 hover:bg-slate-800 transition-all"
            title="Refresh"
          >
            <svg className={clsx('w-4 h-4', loading && 'animate-spin')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading && logs.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3 text-slate-400">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="font-mono text-sm uppercase tracking-wider">Scanning activity logs...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto text-status-error/50 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-status-error font-mono text-sm">{error}</p>
                <button
                  onClick={() => fetchLogs(0)}
                  className="mt-3 text-xs font-mono text-cyber-400 hover:text-cyber-300 underline underline-offset-4"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-slate-700/20 blur-xl rounded-full" />
                  <svg className="relative w-16 h-16 text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-slate-500 font-mono text-sm uppercase tracking-wider">No activity recorded</p>
                <p className="text-slate-600 text-xs mt-1">Actions on this server will appear here</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[2.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-cyber-500/50 via-slate-700 to-transparent" />

              {/* Log entries */}
              <div className="py-4 space-y-1">
                {filteredLogs.map((log, index) => {
                  const color = getActionColor(log.action);
                  const details = parseDetails(log.details);
                  const isExpanded = expandedId === log.id;

                  return (
                    <div
                      key={log.id}
                      className={clsx(
                        'relative px-6 py-3 hover:bg-slate-800/30 transition-all cursor-pointer group',
                        isExpanded && 'bg-slate-800/50'
                      )}
                      style={{ animationDelay: `${index * 30}ms` }}
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    >
                      {/* Timeline node */}
                      <div
                        className={clsx(
                          'absolute left-5 top-4 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all',
                          color === 'status-online' && 'border-status-online bg-status-online/20',
                          color === 'cyber' && 'border-cyber-500 bg-cyber-500/20',
                          color === 'status-warning' && 'border-status-warning bg-status-warning/20',
                          color === 'status-error' && 'border-status-error bg-status-error/20',
                          color === 'violet' && 'border-violet-500 bg-violet-500/20',
                          color === 'slate' && 'border-slate-500 bg-slate-500/20'
                        )}
                      >
                        <div
                          className={clsx(
                            'w-1.5 h-1.5 rounded-full',
                            color === 'status-online' && 'bg-status-online',
                            color === 'cyber' && 'bg-cyber-500',
                            color === 'status-warning' && 'bg-status-warning',
                            color === 'status-error' && 'bg-status-error',
                            color === 'violet' && 'bg-violet-500',
                            color === 'slate' && 'bg-slate-500'
                          )}
                        />
                      </div>

                      {/* Content */}
                      <div className="ml-8">
                        <div className="flex items-start justify-between gap-4">
                          {/* Action info */}
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Icon */}
                            <div
                              className={clsx(
                                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                                color === 'status-online' && 'bg-status-online/10 text-status-online',
                                color === 'cyber' && 'bg-cyber-500/10 text-cyber-400',
                                color === 'status-warning' && 'bg-status-warning/10 text-status-warning',
                                color === 'status-error' && 'bg-status-error/10 text-status-error',
                                color === 'violet' && 'bg-violet-500/10 text-violet-400',
                                color === 'slate' && 'bg-slate-500/10 text-slate-400'
                              )}
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {getActionIcon(log.action)}
                              </svg>
                            </div>

                            {/* Text */}
                            <div className="min-w-0">
                              <p className="text-sm text-white font-medium truncate">
                                {log.actionDescription}
                                {log.targetName && (
                                  <span className="text-slate-400 font-normal">
                                    {' '}· <span className="text-slate-300">{log.targetName}</span>
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-slate-500 font-mono">
                                {log.actorEmail ? (
                                  <>
                                    <span className="text-slate-400">{log.actorEmail}</span>
                                  </>
                                ) : (
                                  <span className="text-slate-600 italic">System</span>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Time */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span
                              className="text-xs font-mono text-slate-500 group-hover:text-slate-400 transition-colors"
                              title={formatTimestamp(log.createdAt)}
                            >
                              {formatRelativeTime(log.createdAt)}
                            </span>
                            <svg
                              className={clsx(
                                'w-4 h-4 text-slate-600 transition-transform',
                                isExpanded && 'rotate-180'
                              )}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="mt-3 animate-fade-in">
                            <div className="bg-slate-950/50 rounded-lg border border-slate-800 overflow-hidden">
                              {/* Detail header */}
                              <div className="px-3 py-2 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
                                <span className="text-2xs font-mono text-slate-500 uppercase tracking-wider">
                                  Event Details
                                </span>
                                <span className="text-2xs font-mono text-slate-600">
                                  {formatTimestamp(log.createdAt)}
                                </span>
                              </div>

                              {/* Detail content */}
                              <div className="p-3 space-y-2">
                                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                                  <div>
                                    <span className="text-slate-500 font-mono">Action:</span>
                                    <span className="ml-2 text-slate-300 font-mono">{log.action}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 font-mono">Target Type:</span>
                                    <span className="ml-2 text-slate-300">{log.targetType || '-'}</span>
                                  </div>
                                  {log.actorEmail && (
                                    <div>
                                      <span className="text-slate-500 font-mono">Actor:</span>
                                      <span className="ml-2 text-slate-300">{log.actorEmail}</span>
                                    </div>
                                  )}
                                  {log.targetId && (
                                    <div>
                                      <span className="text-slate-500 font-mono">Target ID:</span>
                                      <span className="ml-2 text-slate-400 font-mono text-2xs">{log.targetId}</span>
                                    </div>
                                  )}
                                </div>

                                {details && Object.keys(details).length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-slate-800">
                                    <span className="text-2xs font-mono text-slate-500 uppercase tracking-wider">
                                      Payload
                                    </span>
                                    <pre className="mt-2 p-2 bg-slate-900 rounded text-2xs font-mono text-slate-400 overflow-x-auto">
                                      {JSON.stringify(details, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load more */}
              {hasMore && (
                <div className="px-6 py-4 border-t border-slate-800">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="w-full py-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-cyber-500/30 text-slate-400 hover:text-cyber-400 font-mono text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loadingMore ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Loading...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        Load more events
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer status bar */}
        <div className="px-6 py-2 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-4 text-2xs font-mono text-slate-600">
            <span>
              Showing <span className="text-slate-400">{filteredLogs.length}</span> of <span className="text-slate-400">{logs.length}</span> loaded
            </span>
            <span className="text-slate-700">|</span>
            <span>
              Total: <span className="text-cyber-500">{totalElements}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyber-500 animate-pulse" />
            <span className="text-2xs font-mono text-slate-500 uppercase tracking-wider">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
}
