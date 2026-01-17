import { useEffect, useState } from 'react';
import { useAdminStore } from '../../stores/adminStore';
import type { AdminAuditLogFilters } from '../../types/admin';
import clsx from 'clsx';

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'USER_CREATED', label: 'User Created' },
  { value: 'USER_UPDATED', label: 'User Updated' },
  { value: 'USER_DELETED', label: 'User Deleted' },
  { value: 'COLLABORATOR_ADDED', label: 'Collaborator Added' },
  { value: 'COLLABORATOR_REMOVED', label: 'Collaborator Removed' },
  { value: 'SERVER_CREATED', label: 'Server Created' },
  { value: 'SERVER_UPDATED', label: 'Server Updated' },
  { value: 'SERVER_DELETED', label: 'Server Deleted' },
  { value: 'SERVER_TOKEN_REGENERATED', label: 'Token Regenerated' },
  { value: 'SERVER_CONNECTED', label: 'Server Connected' },
  { value: 'SERVER_DISCONNECTED', label: 'Server Disconnected' },
  { value: 'FILE_CREATED', label: 'File Created' },
  { value: 'FILE_UPDATED', label: 'File Updated' },
  { value: 'FILE_RENAMED', label: 'File Renamed' },
  { value: 'FILE_DELETED', label: 'File Deleted' },
  { value: 'FILE_RESTORED', label: 'File Restored' },
];

export default function AdminAuditLogs() {
  const {
    auditLogs,
    auditLogsTotal,
    auditLogsPage,
    auditLogsPageSize,
    auditLogFilters,
    loadingAuditLogs,
    exportingAuditLogs,
    error,
    fetchAuditLogs,
    setAuditLogFilters,
    exportAuditLogs,
  } = useAdminStore();

  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState<AdminAuditLogFilters>({});
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  useEffect(() => {
    fetchAuditLogs(0, auditLogsPageSize);
  }, []);

  useEffect(() => {
    setLocalFilters(auditLogFilters);
  }, [auditLogFilters]);

  const handleApplyFilters = () => {
    setAuditLogFilters(localFilters);
    fetchAuditLogs(0, auditLogsPageSize, localFilters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    const emptyFilters = {};
    setLocalFilters(emptyFilters);
    setAuditLogFilters(emptyFilters);
    fetchAuditLogs(0, auditLogsPageSize, emptyFilters);
    setShowFilters(false);
  };

  const handlePageChange = (newPage: number) => {
    fetchAuditLogs(newPage, auditLogsPageSize, auditLogFilters);
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const blob = await exportAuditLogs(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      // Error handled in store
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActionColor = (action: string) => {
    if (action.includes('CREATED') || action.includes('ADDED')) return 'text-green-600 dark:text-green-400 bg-green-500/10';
    if (action.includes('DELETED') || action.includes('REMOVED')) return 'text-red-600 dark:text-red-400 bg-red-500/10';
    if (action.includes('UPDATED') || action.includes('RESTORED') || action.includes('RENAMED')) return 'text-blue-600 dark:text-blue-400 bg-blue-500/10';
    if (action.includes('CONNECTED')) return 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10';
    if (action.includes('DISCONNECTED')) return 'text-slate-600 dark:text-slate-400 bg-slate-500/10';
    return 'text-purple-600 dark:text-purple-400 bg-purple-500/10';
  };

  const totalPages = Math.ceil(auditLogsTotal / auditLogsPageSize);
  const hasActiveFilters = Object.values(auditLogFilters).some(v => v);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-wide mb-1">
            Audit Logs
          </h1>
          <p className="text-slate-500 font-mono text-xs sm:text-sm uppercase tracking-wider">
            {auditLogsTotal} Total Entries
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export dropdown */}
          <div className="relative">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
              className="input pr-8 text-sm"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>
          <button
            onClick={() => handleExport(exportFormat)}
            disabled={exportingAuditLogs}
            className="btn btn-secondary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {exportingAuditLogs ? 'Exporting...' : 'Export'}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'btn flex items-center gap-2',
              hasActiveFilters ? 'btn-primary' : 'btn-secondary'
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-white" />
            )}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm animate-slide-up">
          <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Filter Logs
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* User Email */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                User Email
              </label>
              <input
                type="text"
                value={localFilters.userEmail || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, userEmail: e.target.value || undefined })}
                placeholder="Search by email..."
                className="input w-full"
              />
            </div>

            {/* Action Type */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                Action Type
              </label>
              <select
                value={localFilters.action || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, action: e.target.value || undefined })}
                className="input w-full"
              >
                {ACTION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={localFilters.startDate || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value || undefined })}
                className="input w-full"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={localFilters.endDate || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value || undefined })}
                className="input w-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button onClick={handleClearFilters} className="btn btn-secondary">
              Clear Filters
            </button>
            <button onClick={handleApplyFilters} className="btn btn-primary">
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm dark:shadow-none">
        {loadingAuditLogs && auditLogs.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-slate-500">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="font-mono text-sm uppercase tracking-wider">Loading audit logs...</span>
            </div>
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-slate-500 font-mono text-sm uppercase tracking-wider">
              {hasActiveFilters ? 'No logs matching filters' : 'No audit logs found'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Timestamp</th>
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">User</th>
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Action</th>
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Target</th>
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">IP Address</th>
                    <th className="px-4 py-3 text-left text-2xs font-mono uppercase tracking-wider text-slate-500">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                          {formatDate(log.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {log.userEmail ? (
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {log.userEmail}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-500 italic">System</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx(
                          'inline-flex px-2 py-0.5 rounded text-xs font-medium',
                          getActionColor(log.action)
                        )}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {log.targetName ? (
                          <div>
                            <span className="text-sm text-slate-900 dark:text-white">{log.targetName}</span>
                            {log.targetType && (
                              <span className="text-xs text-slate-500 ml-2">({log.targetType})</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {log.ipAddress ? (
                          <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
                            {log.ipAddress}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        {log.details ? (
                          <span className="text-sm text-slate-600 dark:text-slate-400 truncate block" title={log.details}>
                            {log.details}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
                <div className="text-sm text-slate-500">
                  Showing {auditLogsPage * auditLogsPageSize + 1} to {Math.min((auditLogsPage + 1) * auditLogsPageSize, auditLogsTotal)} of {auditLogsTotal}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(auditLogsPage - 1)}
                    disabled={auditLogsPage === 0 || loadingAuditLogs}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-500">
                    Page {auditLogsPage + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(auditLogsPage + 1)}
                    disabled={auditLogsPage >= totalPages - 1 || loadingAuditLogs}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
