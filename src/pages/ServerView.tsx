import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useServerStore } from '../stores/serverStore';
import { useEditorStore } from '../stores/editorStore';
import { useWebSocket } from '../hooks/useWebSocket';
import FileTree from '../components/FileTree';
import EditorPane from '../components/EditorPane';
import VersionHistory from '../components/VersionHistory';
import clsx from 'clsx';

export default function ServerView() {
  const { serverId } = useParams<{ serverId: string }>();
  const { currentServer, fileCache, loadingDirs, fetchServer, loadDirectory, clearFileCache } = useServerStore();
  const {
    tabs,
    leftPaneTabId,
    isSplit,
    isFileTreeCollapsed,
    isHistoryCollapsed,
    openTab,
    closeAllTabs,
    toggleFileTree,
    toggleHistory,
    reloadTab,
    hasUnsavedChanges,
  } = useEditorStore();

  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    if (serverId) {
      fetchServer(serverId);
      clearFileCache();
      closeAllTabs();
    }
  }, [serverId]);

  useWebSocket(serverId);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  const handleLoadDirectory = (dir: string) => loadDirectory(serverId!, dir);

  const handleFileSelect = (filePath: string) => {
    if (serverId) {
      openTab(serverId, filePath);
    }
  };

  // Get the active file for version history
  const activeTab = leftPaneTabId ? tabs.find(t => t.id === leftPaneTabId) : undefined;

  const handleRestore = () => {
    if (activeTab) {
      reloadTab(activeTab.id);
    }
  };

  if (!currentServer) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center gap-4">
        <Link to="/" className="text-gray-400 hover:text-white">
          ← Back
        </Link>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${currentServer.online ? 'bg-green-500' : 'bg-gray-500'}`} />
          <span className="font-medium">{currentServer.name}</span>
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <span className="text-gray-400">Token:</span>
          <code className="bg-gray-700 px-2 py-1 rounded font-mono text-xs">
            {showToken ? currentServer.token : '••••••••'}
          </code>
          <button onClick={() => setShowToken(!showToken)} className="text-blue-400 hover:text-blue-300">
            {showToken ? 'Hide' : 'Show'}
          </button>
        </div>
      </header>

      {/* Offline warning */}
      {!currentServer.online && (
        <div className="bg-yellow-900/50 border-b border-yellow-700 px-4 py-2 text-yellow-200 text-sm">
          Server offline. Install the agent plugin.
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Tree (collapsible) */}
        <aside
          className={clsx(
            'bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-200 overflow-hidden',
            isFileTreeCollapsed ? 'w-0' : 'w-64'
          )}
        >
          <div className="p-3 border-b border-gray-700 text-sm font-medium text-gray-400 flex items-center justify-between">
            <span>Files</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <FileTree
              serverId={serverId!}
              fileCache={fileCache}
              loadingDirs={loadingDirs}
              loadDirectory={handleLoadDirectory}
              selectedFile={activeTab?.filePath || null}
              onSelect={handleFileSelect}
            />
          </div>
        </aside>

        {/* Collapse toggle for file tree */}
        <button
          onClick={toggleFileTree}
          className="w-6 flex items-center justify-center bg-gray-800 border-r border-gray-700 hover:bg-gray-700 text-gray-400 hover:text-white"
          title={isFileTreeCollapsed ? 'Show files' : 'Hide files'}
        >
          <svg
            className={clsx('w-4 h-4 transition-transform', isFileTreeCollapsed ? '' : 'rotate-180')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Editor area */}
        <main className="flex-1 flex overflow-hidden">
          <EditorPane paneIndex={0} />
          {isSplit && (
            <>
              <div className="w-px bg-gray-700" />
              <EditorPane paneIndex={1} />
            </>
          )}
        </main>

        {/* Collapse toggle for history */}
        {activeTab && (
          <button
            onClick={toggleHistory}
            className="w-6 flex items-center justify-center bg-gray-800 border-l border-gray-700 hover:bg-gray-700 text-gray-400 hover:text-white"
            title={isHistoryCollapsed ? 'Show history' : 'Hide history'}
          >
            <svg
              className={clsx('w-4 h-4 transition-transform', isHistoryCollapsed ? 'rotate-180' : '')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Version History (collapsible) */}
        {activeTab && (
          <aside
            className={clsx(
              'bg-gray-800 border-l border-gray-700 overflow-y-auto transition-all duration-200',
              isHistoryCollapsed ? 'w-0' : 'w-72'
            )}
          >
            <VersionHistory
              serverId={serverId!}
              filePath={activeTab.filePath}
              onRestore={handleRestore}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
