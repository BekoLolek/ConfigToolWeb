import { useState, useCallback, useEffect, useRef } from 'react';
import Editor, { DiffEditor, Monaco } from '@monaco-editor/react';
import TabBar from './TabBar';
import { useEditorStore, type Tab } from '../stores/editorStore';
import { fileApi } from '../api/endpoints';
import { toast } from '../stores/toastStore';
import clsx from 'clsx';
import type { editor } from 'monaco-editor';
import { parse as parseYaml, YAMLParseError } from 'yaml';

interface ValidationError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
}

// Helper to format relative time
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 10) return 'Saved just now';
  if (diffSec < 60) return `Saved ${diffSec}s ago`;
  if (diffMin === 1) return 'Saved 1 min ago';
  if (diffMin < 60) return `Saved ${diffMin} min ago`;
  if (diffHour === 1) return 'Saved 1 hour ago';
  if (diffHour < 24) return `Saved ${diffHour} hours ago`;
  if (diffDay === 1) return 'Saved 1 day ago';
  return `Saved ${diffDay} days ago`;
}

// Format exact timestamp for tooltip
function formatExactTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

interface Props {
  paneIndex: 0 | 1;
}

export default function EditorPane({ paneIndex }: Props) {
  const {
    tabs,
    leftPaneTabId,
    rightPaneTabId,
    isSplit,
    activePaneIndex,
    setActiveTab,
    setActivePaneIndex,
    updateContent,
    markTabSaved,
    closeTab,
    toggleSplit,
    saveDrafts,
    loadDrafts,
    hasUnsavedChanges,
  } = useEditorStore();

  const activeTabId = paneIndex === 0 ? leftPaneTabId : rightPaneTabId;
  const tab = activeTabId ? tabs.find(t => t.id === activeTabId) : undefined;
  const isActivePane = activePaneIndex === paneIndex;

  const [showSave, setShowSave] = useState(false);
  const [showSaveDropdown, setShowSaveDropdown] = useState(false);
  const [message, setMessage] = useState('');
  const [reload, setReload] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingCloseTabId, setPendingCloseTabId] = useState<string | null>(null);
  const [showDiffView, setShowDiffView] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [draftSavedVisible, setDraftSavedVisible] = useState(false);
  const [, setTimeUpdate] = useState(0); // Force re-render for relative time updates
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const saveDropdownRef = useRef<HTMLDivElement>(null);
  const shortcutsRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const draftSaveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const validationDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasChanges = tab ? tab.content !== tab.originalContent : false;

  // Determine if the file is YAML or JSON
  const isYamlFile = tab?.filePath ? /\.(ya?ml)$/i.test(tab.filePath) : false;
  const isJsonFile = tab?.filePath ? /\.json$/i.test(tab.filePath) : false;

  // Validate YAML content
  const validateYaml = useCallback((content: string): ValidationError[] => {
    const errors: ValidationError[] = [];
    try {
      parseYaml(content);
    } catch (e) {
      if (e instanceof YAMLParseError) {
        const line = e.linePos?.[0]?.line ?? 1;
        const column = e.linePos?.[0]?.col ?? 1;
        errors.push({
          line,
          column,
          message: e.message.split('\n')[0], // Get just the first line of error
          severity: 'error',
        });
      }
    }
    return errors;
  }, []);

  // Validate JSON content
  const validateJson = useCallback((content: string): ValidationError[] => {
    const errors: ValidationError[] = [];
    try {
      JSON.parse(content);
    } catch (e) {
      if (e instanceof SyntaxError) {
        // Try to extract line number from error message
        const match = e.message.match(/position (\d+)/);
        let line = 1;
        let column = 1;
        if (match) {
          const position = parseInt(match[1], 10);
          const lines = content.substring(0, position).split('\n');
          line = lines.length;
          column = lines[lines.length - 1].length + 1;
        }
        errors.push({
          line,
          column,
          message: e.message,
          severity: 'error',
        });
      }
    }
    return errors;
  }, []);

  // Update Monaco editor markers
  const updateMarkers = useCallback((errors: ValidationError[]) => {
    const monaco = monacoRef.current;
    const editor = editorRef.current;
    if (!monaco || !editor) return;

    const model = editor.getModel();
    if (!model) return;

    const markers = errors.map(err => ({
      severity: err.severity === 'error'
        ? monaco.MarkerSeverity.Error
        : monaco.MarkerSeverity.Warning,
      message: err.message,
      startLineNumber: err.line,
      startColumn: err.column,
      endLineNumber: err.line,
      endColumn: 1000, // Highlight to end of line
    }));

    monaco.editor.setModelMarkers(model, 'syntax-validation', markers);
  }, []);

  // Debounced validation effect
  useEffect(() => {
    if (!tab?.content || tab.isLoading) {
      setValidationErrors([]);
      return;
    }

    // Clear existing timeout
    if (validationDebounceRef.current) {
      clearTimeout(validationDebounceRef.current);
    }

    // Debounce validation by 500ms
    validationDebounceRef.current = setTimeout(() => {
      let errors: ValidationError[] = [];

      if (isYamlFile) {
        errors = validateYaml(tab.content);
      } else if (isJsonFile) {
        errors = validateJson(tab.content);
      }

      setValidationErrors(errors);
      updateMarkers(errors);
    }, 500);

    return () => {
      if (validationDebounceRef.current) {
        clearTimeout(validationDebounceRef.current);
      }
    };
  }, [tab?.content, tab?.isLoading, isYamlFile, isJsonFile, validateYaml, validateJson, updateMarkers]);

  // Clear markers when tab changes or unmounts
  useEffect(() => {
    return () => {
      const monaco = monacoRef.current;
      const editor = editorRef.current;
      if (monaco && editor) {
        const model = editor.getModel();
        if (model) {
          monaco.editor.setModelMarkers(model, 'syntax-validation', []);
        }
      }
    };
  }, [activeTabId]);

  // Scroll to first error
  const scrollToFirstError = useCallback(() => {
    const editor = editorRef.current;
    if (!editor || validationErrors.length === 0) return;

    const firstError = validationErrors[0];
    editor.revealLineInCenter(firstError.line);
    editor.setPosition({ lineNumber: firstError.line, column: firstError.column });
    editor.focus();
  }, [validationErrors]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(paneIndex, tabId);
    setActivePaneIndex(paneIndex);
  };

  const handleTabClose = (tabId: string) => {
    const tabToClose = tabs.find(t => t.id === tabId);
    if (tabToClose && tabToClose.content !== tabToClose.originalContent) {
      setPendingCloseTabId(tabId);
      return;
    }
    closeTab(tabId);
  };

  const confirmClose = () => {
    if (pendingCloseTabId) {
      closeTab(pendingCloseTabId);
      setPendingCloseTabId(null);
    }
  };

  const handleSave = useCallback(async () => {
    if (!tab || !hasChanges || saving) return;
    setSaving(true);
    setError(null);
    setShowSave(false);
    try {
      await fileApi.save(tab.serverId, tab.filePath, tab.content, message || undefined, reload);
      markTabSaved(tab.id, tab.content);
      setMessage('');
      // Show toast notification
      if (reload) {
        toast.success('Saved and reloaded plugin');
      } else {
        toast.success('File saved');
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }, [tab, hasChanges, saving, message, reload, markTabSaved]);

  // Quick save without showing modal
  const handleQuickSave = useCallback(async (withReload: boolean) => {
    if (!tab || !hasChanges || saving) return;
    setSaving(true);
    setError(null);
    setShowSaveDropdown(false);
    try {
      await fileApi.save(tab.serverId, tab.filePath, tab.content, undefined, withReload);
      markTabSaved(tab.id, tab.content);
      // Show toast notification
      if (withReload) {
        toast.success('Saved and reloaded plugin');
      } else {
        toast.success('File saved');
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }, [tab, hasChanges, saving, markTabSaved]);

  const handleDiscard = () => {
    if (tab) {
      updateContent(tab.id, tab.originalContent);
    }
  };

  // Editor toolbar actions
  const handleUndo = useCallback(() => {
    editorRef.current?.trigger('keyboard', 'undo', null);
  }, []);

  const handleRedo = useCallback(() => {
    editorRef.current?.trigger('keyboard', 'redo', null);
  }, []);

  const handleFormat = useCallback(() => {
    editorRef.current?.getAction('editor.action.formatDocument')?.run();
  }, []);

  const handleEditorMount = useCallback((editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isActivePane) return;

    const handler = (e: KeyboardEvent) => {
      // Ctrl+Shift+S: Save without reload
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (hasChanges && !saving) handleQuickSave(false);
        return;
      }
      // Ctrl+S: Save with reload
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (hasChanges && !saving) handleQuickSave(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault();
        if (activeTabId) handleTabClose(activeTabId);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isActivePane, hasChanges, saving, activeTabId, handleQuickSave]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (saveDropdownRef.current && !saveDropdownRef.current.contains(e.target as Node)) {
        setShowSaveDropdown(false);
      }
    };

    if (showSaveDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSaveDropdown]);

  // Close shortcuts popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shortcutsRef.current && !shortcutsRef.current.contains(e.target as Node)) {
        setShowShortcuts(false);
      }
    };

    if (showShortcuts) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showShortcuts]);

  // Reset diff view when tab changes
  useEffect(() => {
    setShowDiffView(false);
  }, [activeTabId]);

  // Load drafts on component mount (only for pane 0 to avoid duplicate loads)
  useEffect(() => {
    if (paneIndex === 0) {
      loadDrafts();
    }
  }, [paneIndex, loadDrafts]);

  // Auto-save drafts every 30 seconds when there are unsaved changes
  useEffect(() => {
    if (paneIndex !== 0) return; // Only run once for pane 0

    const interval = setInterval(() => {
      if (hasUnsavedChanges()) {
        saveDrafts();
        setDraftSavedVisible(true);
        setTimeout(() => setDraftSavedVisible(false), 2000);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [paneIndex, hasUnsavedChanges, saveDrafts]);

  // Debounced draft save on content change (5 second delay)
  useEffect(() => {
    if (!hasChanges) return;

    // Clear any existing timeout
    if (draftSaveDebounceRef.current) {
      clearTimeout(draftSaveDebounceRef.current);
    }

    // Set up new debounced save
    draftSaveDebounceRef.current = setTimeout(() => {
      if (hasUnsavedChanges()) {
        saveDrafts();
        setDraftSavedVisible(true);
        setTimeout(() => setDraftSavedVisible(false), 2000);
      }
    }, 5000);

    return () => {
      if (draftSaveDebounceRef.current) {
        clearTimeout(draftSaveDebounceRef.current);
      }
    };
  }, [tab?.content, hasChanges, hasUnsavedChanges, saveDrafts]);

  // Update relative time display every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUpdate(t => t + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handlePaneClick = () => {
    if (!isActivePane) {
      setActivePaneIndex(paneIndex);
    }
  };

  return (
    <div
      className={clsx(
        'flex-1 flex flex-col min-w-0 bg-slate-950',
        isActivePane && isSplit && 'ring-1 ring-cyber-500/30'
      )}
      onClick={handlePaneClick}
    >
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabClick={handleTabClick}
        onTabClose={handleTabClose}
        onSplitToggle={toggleSplit}
        isSplit={isSplit}
        showSplitButton={paneIndex === 0}
        serverId={tab?.serverId}
      />

      {tab ? (
        <>
          {/* File info bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900/50 border-b border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xs font-mono text-slate-500 truncate">{tab.filePath}</span>
              {hasChanges && (
                <span className="flex items-center gap-1.5 text-status-warning text-xs font-mono uppercase tracking-wider flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-warning animate-pulse" />
                  Modified
                </span>
              )}
              {/* Last saved indicator */}
              {tab.lastSaved && !hasChanges && (
                <span
                  className="text-xs font-mono text-slate-500 flex-shrink-0"
                  title={formatExactTime(tab.lastSaved)}
                >
                  {formatRelativeTime(tab.lastSaved)}
                </span>
              )}
              {/* Draft saved indicator */}
              <span
                className={clsx(
                  'text-xs font-mono text-slate-500 flex-shrink-0 transition-opacity duration-500',
                  draftSavedVisible ? 'opacity-100' : 'opacity-0'
                )}
              >
                Draft saved
              </span>
              {/* Syntax validation status indicator */}
              {(isYamlFile || isJsonFile) && !tab.isLoading && (
                <button
                  onClick={scrollToFirstError}
                  className={clsx(
                    'flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider flex-shrink-0 px-2 py-0.5 rounded transition-colors',
                    validationErrors.length > 0
                      ? 'text-status-error bg-status-error/10 hover:bg-status-error/20 cursor-pointer'
                      : 'text-status-online cursor-default'
                  )}
                  title={validationErrors.length > 0 ? `${validationErrors.length} syntax error(s) - Click to go to first error` : 'Valid syntax'}
                  disabled={validationErrors.length === 0}
                >
                  {validationErrors.length > 0 ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{validationErrors.length} {validationErrors.length === 1 ? 'error' : 'errors'}</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Valid</span>
                    </>
                  )}
                </button>
              )}
            </div>
            {hasChanges && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleDiscard}
                  className="btn btn-ghost text-xs py-1"
                >
                  Discard
                </button>
                {/* Save button with dropdown */}
                <div className="relative" ref={saveDropdownRef}>
                  <div className="flex">
                    {/* Main save button - saves with reload */}
                    <button
                      onClick={() => handleQuickSave(true)}
                      disabled={saving}
                      className="btn btn-primary text-xs py-1 rounded-r-none border-r border-cyber-700/50"
                      title="Save & Reload (Ctrl+S)"
                    >
                      {saving ? (
                        <span className="flex items-center gap-2">
                          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Saving
                        </span>
                      ) : 'Save'}
                    </button>
                    {/* Dropdown toggle */}
                    <button
                      onClick={() => setShowSaveDropdown(!showSaveDropdown)}
                      disabled={saving}
                      className="btn btn-primary text-xs py-1 px-2 rounded-l-none"
                      title="More save options"
                    >
                      <svg className={clsx("w-3 h-3 transition-transform", showSaveDropdown && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  {/* Dropdown menu */}
                  {showSaveDropdown && (
                    <div className="absolute right-0 mt-1 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden animate-slide-up">
                      <div className="py-1">
                        <button
                          onClick={() => handleQuickSave(true)}
                          className="w-full px-4 py-2.5 text-left hover:bg-slate-800 transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-cyber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              <span className="text-sm text-white font-medium">Save & Reload</span>
                            </div>
                            <kbd className="px-1.5 py-0.5 text-2xs font-mono bg-slate-800 border border-slate-700 rounded text-slate-400">Ctrl+S</kbd>
                          </div>
                          <p className="mt-1 text-xs text-slate-500 pl-6">Save and apply changes immediately</p>
                        </button>
                        <button
                          onClick={() => handleQuickSave(false)}
                          className="w-full px-4 py-2.5 text-left hover:bg-slate-800 transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                              </svg>
                              <span className="text-sm text-white font-medium">Save Only</span>
                            </div>
                            <kbd className="px-1.5 py-0.5 text-2xs font-mono bg-slate-800 border border-slate-700 rounded text-slate-400">Ctrl+Shift+S</kbd>
                          </div>
                          <p className="mt-1 text-xs text-slate-500 pl-6">Save without reloading the plugin</p>
                        </button>
                        <div className="border-t border-slate-800 my-1" />
                        <button
                          onClick={() => { setShowSaveDropdown(false); setShowSave(true); }}
                          className="w-full px-4 py-2.5 text-left hover:bg-slate-800 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="text-sm text-white font-medium">Save with Message...</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500 pl-6">Add a commit message before saving</p>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/30 flex items-center gap-2 animate-slide-up">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-red-400 text-sm font-mono">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Editor Toolbar */}
          <div className="flex items-center justify-between h-8 px-2 bg-slate-900/50 border-b border-slate-800">
            {/* Left side buttons */}
            <div className="flex items-center gap-1">
              {/* Undo button */}
              <button
                onClick={handleUndo}
                className="p-1.5 rounded text-slate-400 hover:text-cyber-400 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>

              {/* Redo button */}
              <button
                onClick={handleRedo}
                className="p-1.5 rounded text-slate-400 hover:text-cyber-400 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Y)"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                </svg>
              </button>

              {/* Divider */}
              <div className="w-px h-4 bg-slate-700 mx-1" />

              {/* Format button */}
              <button
                onClick={handleFormat}
                className="p-1.5 rounded text-slate-400 hover:text-cyber-400 hover:bg-slate-800 transition-colors"
                title="Format Document (Shift+Alt+F)"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </button>

              {/* Divider */}
              <div className="w-px h-4 bg-slate-700 mx-1" />

              {/* Diff view toggle */}
              <button
                onClick={() => setShowDiffView(!showDiffView)}
                className={clsx(
                  'p-1.5 rounded transition-colors',
                  showDiffView
                    ? 'text-cyber-400 bg-slate-800 border border-cyber-500/50'
                    : 'text-slate-400 hover:text-cyber-400 hover:bg-slate-800',
                  !hasChanges && 'opacity-50 cursor-not-allowed'
                )}
                title="Toggle Diff View"
                disabled={!hasChanges}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </button>
            </div>

            {/* Right side - Keyboard shortcuts */}
            <div className="relative" ref={shortcutsRef}>
              <button
                onClick={() => setShowShortcuts(!showShortcuts)}
                className={clsx(
                  'p-1.5 rounded transition-colors',
                  showShortcuts
                    ? 'text-cyber-400 bg-slate-800'
                    : 'text-slate-400 hover:text-cyber-400 hover:bg-slate-800'
                )}
                title="Keyboard Shortcuts"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>

              {/* Shortcuts popover */}
              {showShortcuts && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden animate-slide-up">
                  <div className="p-3 border-b border-slate-800">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">Keyboard Shortcuts</h4>
                  </div>
                  <div className="p-2 space-y-1">
                    {[
                      { keys: 'Ctrl+S', label: 'Save & Reload' },
                      { keys: 'Ctrl+Shift+S', label: 'Save Only' },
                      { keys: 'Ctrl+Alt+S', label: 'Save All Files' },
                      { keys: 'Ctrl+Z', label: 'Undo' },
                      { keys: 'Ctrl+Y', label: 'Redo' },
                      { keys: 'Ctrl+F', label: 'Find' },
                      { keys: 'Ctrl+H', label: 'Replace' },
                      { keys: 'Ctrl+W', label: 'Close Tab' },
                      { keys: 'Ctrl+Shift+F', label: 'Search Files' },
                    ].map(({ keys, label }) => (
                      <div key={keys} className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-800/50">
                        <span className="text-sm text-slate-300">{label}</span>
                        <kbd className="px-2 py-0.5 text-xs font-mono bg-slate-800 border border-slate-700 rounded text-slate-400">{keys}</kbd>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Editor content */}
          {tab.isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-3 text-slate-500">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="font-mono text-sm uppercase tracking-wider">Loading file...</span>
              </div>
            </div>
          ) : tab.error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-red-400 font-mono text-sm">{tab.error}</p>
              </div>
            </div>
          ) : showDiffView && hasChanges ? (
            <div className="flex-1">
              <DiffEditor
                height="100%"
                language={tab.filePath.endsWith('.json') ? 'json' : 'yaml'}
                original={tab.originalContent}
                modified={tab.content}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontLigatures: true,
                  wordWrap: 'on',
                  lineNumbers: 'on',
                  renderSideBySide: true,
                  scrollBeyondLastLine: false,
                  padding: { top: 12, bottom: 12 },
                  readOnly: true,
                }}
              />
            </div>
          ) : (
            <div className="flex-1">
              <Editor
                height="100%"
                language={tab.filePath.endsWith('.json') ? 'json' : 'yaml'}
                value={tab.content}
                onChange={v => updateContent(tab.id, v || '')}
                onMount={handleEditorMount}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontLigatures: true,
                  wordWrap: 'on',
                  tabSize: 2,
                  lineNumbers: 'on',
                  renderLineHighlight: 'line',
                  scrollBeyondLastLine: false,
                  padding: { top: 12, bottom: 12 },
                  cursorBlinking: 'smooth',
                  smoothScrolling: true,
                }}
              />
            </div>
          )}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-slate-950">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-600 font-mono text-sm uppercase tracking-wider">Select a file to edit</p>
            <p className="text-slate-700 text-xs mt-2">Choose a YAML or JSON file from the file tree</p>
          </div>
        </div>
      )}

      {/* Save Modal */}
      {showSave && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="relative w-full max-w-md mx-4 animate-slide-up">
            {/* Corner accents */}
            <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-cyber-500" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-cyber-500" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-cyber-500" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-cyber-500" />

            <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-panel overflow-hidden">
              {/* Header stripe */}
              <div className="h-1 bg-gradient-to-r from-cyber-600 via-cyber-400 to-cyber-600" />

              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-white mb-1">Save Changes</h3>
                <p className="text-slate-500 text-sm font-mono mb-6">{tab?.fileName}</p>

                <div className="mb-4">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                    Commit Message (optional)
                  </label>
                  <input
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Describe your changes..."
                    className="input"
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
                  />
                </div>

                <label className="flex items-center gap-3 mb-6 p-3 bg-slate-800/50 rounded-lg border border-slate-700 cursor-pointer hover:border-slate-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={reload}
                    onChange={e => setReload(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyber-500 focus:ring-cyber-500 focus:ring-offset-0"
                  />
                  <div>
                    <span className="text-sm text-white font-medium">Reload plugin after save</span>
                    <p className="text-xs text-slate-500">Apply changes immediately on the server</p>
                  </div>
                </label>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSave(false)}
                    className="flex-1 btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 btn btn-primary"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close Unsaved Confirmation */}
      {pendingCloseTabId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="relative w-full max-w-md mx-4 animate-slide-up">
            {/* Corner accents */}
            <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-status-warning" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-status-warning" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-status-warning" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-status-warning" />

            <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-panel overflow-hidden">
              {/* Header stripe */}
              <div className="h-1 bg-gradient-to-r from-status-warning via-amber-400 to-status-warning" />

              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-status-warning/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-status-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">Unsaved Changes</h3>
                    <p className="text-slate-500 text-sm font-mono">Changes will be lost</p>
                  </div>
                </div>

                <p className="text-slate-400 mb-6">
                  This file has unsaved changes. Are you sure you want to close it without saving?
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setPendingCloseTabId(null)}
                    className="flex-1 btn btn-secondary"
                  >
                    Keep Editing
                  </button>
                  <button
                    onClick={confirmClose}
                    className="flex-1 btn btn-danger"
                  >
                    Close Without Saving
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
