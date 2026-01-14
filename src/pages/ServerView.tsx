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
  const [tokenCopied, setTokenCopied] = useState(false);

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

  const handleCopyToken = async () => {
    if (currentServer?.token) {
      await navigator.clipboard.writeText(currentServer.token);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3 text-slate-500">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="font-mono text-sm uppercase tracking-wider">Loading server...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-white">
      {/* Header */}
      <header className="bg-slate-900/90 backdrop-blur-sm border-b border-slate-800 px-4 py-0 flex items-center gap-4 h-14 flex-shrink-0">
        {/* Back button */}
        <Link
          to="/"
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-display text-sm uppercase tracking-wider">Back</span>
        </Link>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-700" />

        {/* Server info */}
        <div className="flex items-center gap-3">
          <div className={`status-led ${currentServer.online ? 'status-led-online' : 'status-led-offline'}`} />
          <div>
            <span className="font-display text-lg font-semibold text-white">{currentServer.name}</span>
          </div>
          <span className={clsx(
            'text-2xs font-mono uppercase tracking-wider px-2 py-0.5 rounded',
            currentServer.online
              ? 'bg-status-online/10 text-status-online border border-status-online/30'
              : 'bg-slate-700/50 text-slate-500 border border-slate-600'
          )}>
            {currentServer.online ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Token display */}
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-600">Token</span>
          <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded px-3 py-1.5">
            <code className="font-mono text-xs text-slate-400">
              {showToken ? currentServer.token : '••••••••••••••••'}
            </code>
            <button
              onClick={() => setShowToken(!showToken)}
              className="text-slate-500 hover:text-cyber-400 transition-colors"
              title={showToken ? 'Hide token' : 'Show token'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {showToken ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                )}
              </svg>
            </button>
            <button
              onClick={handleCopyToken}
              className="text-slate-500 hover:text-cyber-400 transition-colors"
              title="Copy token"
            >
              {tokenCopied ? (
                <svg className="w-4 h-4 text-status-online" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Offline warning */}
      {!currentServer.online && (
        <div className="bg-status-warning/10 border-b border-status-warning/30 px-4 py-2.5 flex items-center gap-3 animate-slide-up">
          <div className="status-led status-led-warning" />
          <span className="text-status-warning text-sm font-mono">
            Server offline — Install the agent plugin to enable remote configuration
          </span>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Tree Panel */}
        <aside
          className={clsx(
            'bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ease-out overflow-hidden',
            isFileTreeCollapsed ? 'w-0' : 'w-72'
          )}
        >
          {/* Panel header */}
          <div className="panel-header flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-cyber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span>Files</span>
            </div>
          </div>
          {/* File tree content */}
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

        {/* File tree collapse toggle */}
        <button
          onClick={toggleFileTree}
          className={clsx(
            'w-6 flex items-center justify-center bg-slate-900 border-r border-slate-800 hover:bg-slate-800 text-slate-500 hover:text-cyber-400 transition-all flex-shrink-0',
            isFileTreeCollapsed && 'border-l'
          )}
          title={isFileTreeCollapsed ? 'Show files' : 'Hide files'}
        >
          <svg
            className={clsx('w-4 h-4 transition-transform duration-300', isFileTreeCollapsed ? 'rotate-180' : '')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Editor area */}
        <main className="flex-1 flex overflow-hidden bg-slate-950">
          <EditorPane paneIndex={0} />
          {isSplit && (
            <>
              <div className="w-px bg-slate-700" />
              <EditorPane paneIndex={1} />
            </>
          )}
        </main>

        {/* History collapse toggle */}
        {activeTab && (
          <button
            onClick={toggleHistory}
            className={clsx(
              'w-6 flex items-center justify-center bg-slate-900 border-l border-slate-800 hover:bg-slate-800 text-slate-500 hover:text-cyber-400 transition-all flex-shrink-0',
              isHistoryCollapsed && 'border-r'
            )}
            title={isHistoryCollapsed ? 'Show history' : 'Hide history'}
          >
            <svg
              className={clsx('w-4 h-4 transition-transform duration-300', isHistoryCollapsed ? '' : 'rotate-180')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Version History Panel */}
        {activeTab && (
          <aside
            className={clsx(
              'bg-slate-900 border-l border-slate-800 overflow-hidden transition-all duration-300 ease-out flex flex-col',
              isHistoryCollapsed ? 'w-0' : 'w-80'
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
