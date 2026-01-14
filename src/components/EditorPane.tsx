import { useState, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import TabBar from './TabBar';
import { useEditorStore, type Tab } from '../stores/editorStore';
import { fileApi } from '../api/endpoints';

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
      className={`flex-1 flex flex-col min-w-0 ${isActivePane && isSplit ? 'ring-1 ring-blue-500/50' : ''}`}
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
          <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400 font-mono truncate">{tab.filePath}</span>
              {hasChanges && <span className="text-yellow-500 text-sm flex-shrink-0">Unsaved</span>}
            </div>
            {hasChanges && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleDiscard}
                  className="px-3 py-1 text-sm text-gray-400 hover:text-white"
                >
                  Discard
                </button>
                <button
                  onClick={() => setShowSave(true)}
                  disabled={saving}
                  className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>
          {error && (
            <div className="px-4 py-2 bg-red-900/50 text-red-200 text-sm">{error}</div>
          )}
          {tab.isLoading ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">Loading...</div>
          ) : tab.error ? (
            <div className="flex-1 flex items-center justify-center text-red-400">{tab.error}</div>
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
                  fontSize: 14,
                  wordWrap: 'on',
                  tabSize: 2,
                }}
              />
            </div>
          )}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Select a file to edit
        </div>
      )}

      {/* Save Modal */}
      {showSave && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Save Changes</h3>
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Commit message (optional)"
              className="w-full mb-4 px-3 py-2 bg-gray-700 rounded"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
            />
            <label className="flex items-center gap-2 mb-6 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={reload}
                onChange={e => setReload(e.target.checked)}
                className="w-4 h-4"
              />
              Reload plugin after save
            </label>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSave(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Unsaved Confirmation */}
      {pendingCloseTabId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Unsaved Changes</h3>
            <p className="text-gray-300 mb-6">
              This file has unsaved changes. Are you sure you want to close it?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPendingCloseTabId(null)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmClose}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
              >
                Close without saving
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
