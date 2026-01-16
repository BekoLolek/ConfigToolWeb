import { useState, useEffect } from 'react';
import { fileApi } from '../api/endpoints';
import type { FileChange } from '../types';
import VersionDiffViewer from './VersionDiffViewer';

interface Props {
  serverId: string;
  isOpen: boolean;
  onClose: () => void;
  onRollbackComplete?: () => void;
}

type Step = 'select-date' | 'select-files' | 'confirm';

export default function RollbackModal({ serverId, isOpen, onClose, onRollbackComplete }: Props) {
  const [selectedDate, setSelectedDate] = useState('');
  const [changes, setChanges] = useState<FileChange[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('select-date');
  const [rollbackInProgress, setRollbackInProgress] = useState(false);

  // Preview diff state
  const [previewFile, setPreviewFile] = useState<FileChange | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Set default date to 24 hours ago
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      setSelectedDate(formatDateForInput(yesterday));
      setChanges([]);
      setSelectedFiles(new Set());
      setError(null);
      setStep('select-date');
    }
  }, [isOpen]);

  const formatDateForInput = (date: Date): string => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const formatDisplayDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const handleShowChanges = async () => {
    if (!selectedDate) return;

    setLoading(true);
    setError(null);

    try {
      const isoDate = new Date(selectedDate).toISOString();
      const response = await fileApi.getChangesSince(serverId, isoDate);
      setChanges(response.data);
      setSelectedFiles(new Set(response.data.map(f => f.path)));
      setStep('select-files');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to fetch changes');
    } finally {
      setLoading(false);
    }
  };

  const toggleFile = (path: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedFiles.size === changes.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(changes.map(f => f.path)));
    }
  };

  const handleRollback = async () => {
    if (selectedFiles.size === 0) return;

    setRollbackInProgress(true);
    setError(null);

    try {
      const filesToRollback = changes
        .filter(f => selectedFiles.has(f.path))
        .map(f => ({ path: f.path, toVersionId: f.rollbackToVersionId }));

      await fileApi.rollbackFiles(serverId, filesToRollback);
      onRollbackComplete?.();
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Rollback failed');
      setStep('select-files');
    } finally {
      setRollbackInProgress(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !rollbackInProgress) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Diff preview modal */}
      {previewFile && (
        <VersionDiffViewer
          serverId={serverId}
          filePath={previewFile.path}
          leftVersionId="current"
          rightVersionId={previewFile.rollbackToVersionId}
          leftLabel="Current"
          rightLabel="After Rollback"
          onClose={() => setPreviewFile(null)}
        />
      )}

      <div
        className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
        onClick={handleBackdropClick}
      >
        <div className="relative w-full max-w-2xl mx-4 animate-slide-up">
          {/* Corner accents */}
          <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-cyber-500" />
          <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-cyber-500" />
          <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-cyber-500" />
          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-cyber-500" />

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl dark:shadow-panel overflow-hidden max-h-[85vh] flex flex-col">
            {/* Header stripe */}
            <div className="h-1 bg-gradient-to-r from-cyber-600 via-cyber-400 to-cyber-600 flex-shrink-0" />

            {/* Header */}
            <div className="p-6 pb-4 flex items-center justify-between flex-shrink-0 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                    Rollback Changes
                  </h3>
                  <p className="text-sm text-slate-500">
                    {step === 'select-date' && 'Select a date to view changes'}
                    {step === 'select-files' && `${changes.length} file${changes.length !== 1 ? 's' : ''} changed`}
                    {step === 'confirm' && 'Confirm rollback'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={rollbackInProgress}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Error message */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-500">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Step 1: Date Selection */}
              {step === 'select-date' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                      Rollback to Date/Time
                    </label>
                    <input
                      type="datetime-local"
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      max={formatDateForInput(new Date())}
                      className="input w-full"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      Select a date and time. Files changed after this point will be shown for rollback.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">Quick Select</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: '1 hour ago', hours: 1 },
                        { label: '6 hours ago', hours: 6 },
                        { label: '24 hours ago', hours: 24 },
                        { label: '7 days ago', hours: 168 },
                      ].map(option => (
                        <button
                          key={option.label}
                          onClick={() => {
                            const date = new Date();
                            date.setHours(date.getHours() - option.hours);
                            setSelectedDate(formatDateForInput(date));
                          }}
                          className="px-3 py-1.5 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded hover:border-cyber-500 hover:text-cyber-500 dark:hover:text-cyber-400 transition-colors"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: File Selection */}
              {step === 'select-files' && (
                <div className="space-y-4">
                  {changes.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 font-medium">No changes found</p>
                      <p className="text-sm text-slate-500 mt-1">
                        No files have been modified since {formatDisplayDate(new Date(selectedDate).toISOString())}
                      </p>
                      <button
                        onClick={() => setStep('select-date')}
                        className="mt-4 btn btn-secondary"
                      >
                        Select Different Date
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Select all toggle */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedFiles.size === changes.length}
                            onChange={toggleAll}
                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-cyber-500 focus:ring-cyber-500 focus:ring-offset-0 dark:bg-slate-800"
                          />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Select All ({selectedFiles.size}/{changes.length})
                          </span>
                        </label>
                        <span className="text-xs text-slate-500">
                          Changes since {formatDisplayDate(new Date(selectedDate).toISOString())}
                        </span>
                      </div>

                      {/* File list */}
                      <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                        {changes.map(file => (
                          <label
                            key={file.path}
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedFiles.has(file.path)
                                ? 'bg-cyber-500/5 dark:bg-cyber-500/10 border-cyber-500/50'
                                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedFiles.has(file.path)}
                              onChange={() => toggleFile(file.path)}
                              className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-cyber-500 focus:ring-cyber-500 focus:ring-offset-0 dark:bg-slate-800"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-cyber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="font-mono text-sm text-slate-900 dark:text-white truncate">
                                  {file.fileName}
                                </span>
                              </div>
                              <div className="mt-1 text-xs text-slate-500 truncate" title={file.path}>
                                {file.path}
                              </div>
                              <div className="mt-2 flex items-center gap-4 text-xs">
                                <span className="text-slate-500">
                                  <span className="text-amber-500 font-medium">{file.versionsCount}</span> version{file.versionsCount !== 1 ? 's' : ''} since date
                                </span>
                                <span className="text-slate-500">
                                  Last change: <span className="text-slate-600 dark:text-slate-400">{formatDisplayDate(file.latestChange)}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setPreviewFile(file);
                                  }}
                                  className="ml-auto text-cyber-500 hover:text-cyber-400 flex items-center gap-1 transition-colors"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                  <span>Preview</span>
                                </button>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 3: Confirmation */}
              {step === 'confirm' && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <h4 className="font-medium text-amber-600 dark:text-amber-400">Confirm Rollback</h4>
                        <p className="mt-1 text-sm text-amber-600/80 dark:text-amber-400/80">
                          You are about to rollback {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} to their state before {formatDisplayDate(new Date(selectedDate).toISOString())}.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-3">Files to Rollback</h4>
                    <ul className="space-y-1.5 max-h-[30vh] overflow-y-auto">
                      {changes
                        .filter(f => selectedFiles.has(f.path))
                        .map(file => (
                          <li key={file.path} className="flex items-center gap-2 text-sm">
                            <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span className="font-mono text-slate-600 dark:text-slate-400 truncate">{file.path}</span>
                          </li>
                        ))}
                    </ul>
                  </div>

                  <p className="text-sm text-slate-500">
                    This action will create new versions for the affected files. The current content will be preserved in the version history.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
              <div className="flex gap-3">
                {step === 'select-date' && (
                  <>
                    <button
                      onClick={onClose}
                      className="flex-1 btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleShowChanges}
                      disabled={!selectedDate || loading}
                      className="flex-1 btn btn-primary disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Loading...
                        </span>
                      ) : (
                        'Show Changes'
                      )}
                    </button>
                  </>
                )}

                {step === 'select-files' && changes.length > 0 && (
                  <>
                    <button
                      onClick={() => setStep('select-date')}
                      className="flex-1 btn btn-secondary"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep('confirm')}
                      disabled={selectedFiles.size === 0}
                      className="flex-1 btn btn-primary disabled:opacity-50"
                    >
                      Rollback Selected ({selectedFiles.size})
                    </button>
                  </>
                )}

                {step === 'confirm' && (
                  <>
                    <button
                      onClick={() => setStep('select-files')}
                      disabled={rollbackInProgress}
                      className="flex-1 btn btn-secondary"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleRollback}
                      disabled={rollbackInProgress}
                      className="flex-1 btn bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50"
                    >
                      {rollbackInProgress ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Rolling back...
                        </span>
                      ) : (
                        'Confirm Rollback'
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
