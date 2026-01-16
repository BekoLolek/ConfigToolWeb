import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useServerStore } from '../stores/serverStore';
import { useEditorStore } from '../stores/editorStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { healthApi, fileApi } from '../api/endpoints';
import FileTree from '../components/FileTree';
import EditorPane from '../components/EditorPane';
import VersionHistory from '../components/VersionHistory';
import RecentFiles from '../components/RecentFiles';
import SearchModal from '../components/SearchModal';
import RollbackModal from '../components/RollbackModal';
import ServerSettings from '../components/ServerSettings';
import Breadcrumb from '../components/Breadcrumb';
import FileUpload from '../components/FileUpload';
import clsx from 'clsx';

type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

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
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRollback, setShowRollback] = useState(false);

  // Connection status state
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connected');
  const [lastConnected, setLastConnected] = useState<Date | null>(null);
  const healthCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const failedAttemptsRef = useRef(0);

  const checkHealth = useCallback(async () => {
    try {
      await healthApi.check();
      setConnectionStatus('connected');
      setLastConnected(new Date());
      failedAttemptsRef.current = 0;
    } catch {
      failedAttemptsRef.current += 1;
      if (failedAttemptsRef.current === 1) {
        // First failure - switch to reconnecting
        setConnectionStatus('reconnecting');
      } else if (failedAttemptsRef.current >= 3) {
        // After 3 failed attempts - switch to disconnected
        setConnectionStatus('disconnected');
      }
    }
  }, []);

  // Health check polling
  useEffect(() => {
    // Initial check
    checkHealth();

    const setupInterval = () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
      // Poll every 5 seconds when disconnected/reconnecting, every 30 seconds when connected
      const interval = connectionStatus === 'connected' ? 30000 : 5000;
      healthCheckIntervalRef.current = setInterval(checkHealth, interval);
    };

    setupInterval();

    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
    };
  }, [connectionStatus, checkHealth]);

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

  // Global keyboard shortcut for search (Ctrl+Shift+F)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

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

  const getConnectionTooltip = () => {
    if (connectionStatus === 'connected' && lastConnected) {
      return `Connected - Last checked: ${lastConnected.toLocaleTimeString()}`;
    }
    if (connectionStatus === 'reconnecting') {
      return 'Attempting to reconnect to API...';
    }
    if (connectionStatus === 'disconnected' && lastConnected) {
      return `Disconnected - Last connected: ${lastConnected.toLocaleTimeString()}`;
    }
    if (connectionStatus === 'disconnected') {
      return 'Unable to reach API server';
    }
    return 'Checking connection...';
  };

  // Get the active file for version history
  const activeTab = leftPaneTabId ? tabs.find(t => t.id === leftPaneTabId) : undefined;

  const handleRestore = () => {
    if (activeTab) {
      reloadTab(activeTab.id);
    }
  };

  const handleDownload = async () => {
    if (!activeTab || !serverId) return;
    try {
      const response = await fileApi.download(serverId, activeTab.filePath);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = activeTab.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error('Download failed:', e);
    }
  };

  if (!currentServer) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950 text-white">
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
    <div className="bg-slate-50 dark:bg-slate-950 flex flex-col h-full overflow-hidden text-slate-900 dark:text-white">
      {/* Header - h-16 matches AppShell sidebar header */}
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-4 py-0 flex items-center gap-4 h-16 flex-shrink-0">
        {/* Server info */}
        <div className="flex items-center gap-3">
          <div className={`status-led ${currentServer.online ? 'status-led-online' : 'status-led-offline'}`} />
          <div>
            <span className="font-display text-lg font-semibold text-slate-900 dark:text-white">{currentServer.name}</span>
          </div>
          <span className={clsx(
            'text-2xs font-mono uppercase tracking-wider px-2 py-0.5 rounded',
            currentServer.online
              ? 'bg-status-online/10 text-status-online border border-status-online/30'
              : 'bg-slate-200 dark:bg-slate-700/50 text-slate-500 border border-slate-300 dark:border-slate-600'
          )}>
            {currentServer.online ? 'Online' : 'Offline'}
          </span>
          {/* Settings button */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            title="Server settings"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* Breadcrumb */}
        {activeTab && (
          <>
            <div className="w-px h-6 bg-slate-300 dark:bg-slate-700" />
            <Breadcrumb filePath={activeTab.filePath} />
          </>
        )}

        {/* Action buttons */}
        <div className="ml-auto flex items-center gap-3">
          {/* Download button */}
          {activeTab && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-800 hover:border-cyber-500/50 text-slate-500 dark:text-slate-400 hover:text-cyber-500 dark:hover:text-cyber-400 transition-all"
              title="Download file"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="text-xs font-mono uppercase tracking-wider hidden sm:inline">Download</span>
            </button>
          )}

          {/* Rollback button */}
          <button
            onClick={() => setShowRollback(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-800 hover:border-amber-500/50 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-all"
            title="Rollback changes by date"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-mono uppercase tracking-wider hidden sm:inline">Rollback</span>
          </button>

          {/* Search button */}
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-800 hover:border-cyber-500/50 text-slate-500 dark:text-slate-400 hover:text-cyber-500 dark:hover:text-cyber-400 transition-all group"
            title="Search files (Ctrl+Shift+F)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs font-mono uppercase tracking-wider">Search</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-2xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-500 group-hover:text-slate-400 group-hover:border-slate-600">
              Ctrl+Shift+F
            </kbd>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-300 dark:bg-slate-700" />

          {/* Connection status indicator */}
          <div
            className="tech-label cursor-default"
            title={getConnectionTooltip()}
          >
            <div
              className={clsx(
                'status-led',
                connectionStatus === 'connected' && 'status-led-online',
                connectionStatus === 'reconnecting' && 'status-led-warning',
                connectionStatus === 'disconnected' && 'status-led-offline'
              )}
            />
            <span
              className={clsx(
                connectionStatus === 'connected' && 'text-status-online',
                connectionStatus === 'reconnecting' && 'text-status-warning',
                connectionStatus === 'disconnected' && 'text-slate-500'
              )}
            >
              {connectionStatus === 'connected' && 'Connected'}
              {connectionStatus === 'reconnecting' && 'Reconnecting...'}
              {connectionStatus === 'disconnected' && 'Disconnected'}
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-300 dark:bg-slate-700" />

          {/* Token display */}
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Token</span>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5">
            <code className="font-mono text-xs text-slate-600 dark:text-slate-400">
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
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* File Tree Panel */}
        <aside
          className={clsx(
            'bg-white dark:bg-slate-900/95 flex flex-col transition-all duration-300 ease-out',
            isFileTreeCollapsed ? 'w-0' : 'w-72 border-r border-slate-200 dark:border-slate-700/50'
          )}
          style={{ minWidth: isFileTreeCollapsed ? 0 : undefined }}
        >
          {/* Panel header - z-[60] ensures dropdown appears above sidebar (z-40) */}
          <div className={clsx(
            'h-16 px-3 flex items-center justify-between flex-shrink-0 relative z-[60] bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800',
            isFileTreeCollapsed && 'hidden'
          )}>
            <div className="flex items-center gap-2 min-w-0">
              <svg className="w-4 h-4 text-cyber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span className="font-display font-semibold text-sm uppercase tracking-wider text-slate-600 dark:text-slate-400 whitespace-nowrap">Files</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <FileUpload
                serverId={serverId!}
                currentDirectory="plugins"
                onUploadComplete={() => clearFileCache()}
              />
              <RecentFiles serverId={serverId!} serverName={currentServer.name} />
            </div>
          </div>
          {/* File tree content - overflow-hidden here prevents overlap during animation */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 overflow-hidden">
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
            'group flex flex-col items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-cyber-500 dark:hover:text-cyber-400 transition-all duration-200 flex-shrink-0',
            isFileTreeCollapsed ? 'w-10 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700/50' : 'w-5 bg-slate-50 dark:bg-slate-900/50'
          )}
          title={isFileTreeCollapsed ? 'Show files' : 'Hide files'}
        >
          {/* Icon */}
          <div className="flex items-center justify-center">
            {isFileTreeCollapsed ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            )}
          </div>
          {/* Vertical label when collapsed */}
          {isFileTreeCollapsed && (
            <span className="text-2xs font-mono uppercase tracking-wider mt-1 writing-mode-vertical" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
              Files
            </span>
          )}
        </button>

        {/* Editor area - with subtle left/right borders for separation */}
        <main className="flex-1 flex overflow-hidden bg-slate-100 dark:bg-slate-950 min-w-0">
          <EditorPane paneIndex={0} />
          {isSplit && (
            <>
              <div className="w-px bg-slate-300 dark:bg-slate-700" />
              <EditorPane paneIndex={1} />
            </>
          )}
        </main>

        {/* History collapse toggle */}
        <button
          onClick={toggleHistory}
          className={clsx(
            'group flex flex-col items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-cyber-500 dark:hover:text-cyber-400 transition-all duration-200 flex-shrink-0',
            isHistoryCollapsed ? 'w-10 bg-slate-100 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700/50' : 'w-5 bg-slate-50 dark:bg-slate-900/50'
          )}
          title={isHistoryCollapsed ? 'Show history' : 'Hide history'}
        >
          {/* Icon */}
          <div className="flex items-center justify-center">
            {isHistoryCollapsed ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
          {/* Vertical label when collapsed */}
          {isHistoryCollapsed && (
            <span className="text-2xs font-mono uppercase tracking-wider mt-1" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
              History
            </span>
          )}
        </button>

        {/* Version History Panel - overflow-hidden prevents content overlap during animation */}
        <aside
          className={clsx(
            'bg-white dark:bg-slate-900/95 flex flex-col transition-all duration-300 ease-out overflow-hidden',
            isHistoryCollapsed ? 'w-0 border-l-0' : 'w-80 border-l border-slate-200 dark:border-slate-700/50'
          )}
        >
          {activeTab ? (
            <VersionHistory
              serverId={serverId!}
              filePath={activeTab.filePath}
              onRestore={handleRestore}
            />
          ) : (
            <div className="flex-1 flex flex-col">
              {/* Empty state header */}
              <div className="h-16 px-3 flex items-center gap-2 flex-shrink-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <svg className="w-4 h-4 text-cyber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-display font-semibold text-sm uppercase tracking-wider text-slate-600 dark:text-slate-400">History</span>
              </div>
              {/* Empty state content */}
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center">
                  <svg className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-slate-400 dark:text-slate-600 text-xs font-mono uppercase tracking-wider">Open a file</p>
                  <p className="text-slate-400 dark:text-slate-600 text-xs mt-1">to see version history</p>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Search Modal */}
      <SearchModal
        serverId={serverId!}
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
      />

      {/* Server Settings Modal */}
      <ServerSettings
        server={currentServer}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Rollback Modal */}
      <RollbackModal
        serverId={serverId!}
        isOpen={showRollback}
        onClose={() => setShowRollback(false)}
        onRollbackComplete={() => {
          // Refresh file cache to show rolled back content
          clearFileCache();
        }}
      />
    </div>
  );
}
