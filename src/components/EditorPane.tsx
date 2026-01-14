import { useState, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import TabBar from './TabBar';
import { useEditorStore, type Tab } from '../stores/editorStore';
import { fileApi } from '../api/endpoints';
import clsx from 'clsx';

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
  } = useEditorStore();

  const activeTabId = paneIndex === 0 ? leftPaneTabId : rightPaneTabId;
  const tab = activeTabId ? tabs.find(t => t.id === activeTabId) : undefined;
  const isActivePane = activePaneIndex === paneIndex;

  const [showSave, setShowSave] = useState(false);
  const [message, setMessage] = useState('');
  const [reload, setReload] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingCloseTabId, setPendingCloseTabId] = useState<string | null>(null);

  const hasChanges = tab ? tab.content !== tab.originalContent : false;

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
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }, [tab, hasChanges, saving, message, reload, markTabSaved]);

  const handleDiscard = () => {
    if (tab) {
      updateContent(tab.id, tab.originalContent);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!isActivePane) return;

    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (hasChanges && !saving) setShowSave(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault();
        if (activeTabId) handleTabClose(activeTabId);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isActivePane, hasChanges, saving, activeTabId]);

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
            </div>
            {hasChanges && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleDiscard}
                  className="btn btn-ghost text-xs py-1"
                >
                  Discard
                </button>
                <button
                  onClick={() => setShowSave(true)}
                  disabled={saving}
                  className="btn btn-primary text-xs py-1"
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
          ) : (
            <div className="flex-1">
              <Editor
                height="100%"
                language={tab.filePath.endsWith('.json') ? 'json' : 'yaml'}
                value={tab.content}
                onChange={v => updateContent(tab.id, v || '')}
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
