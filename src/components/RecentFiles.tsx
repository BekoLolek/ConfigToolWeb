import { useState, useRef, useEffect } from 'react';
import { useEditorStore, RecentFile } from '../stores/editorStore';
import clsx from 'clsx';

interface Props {
  serverId: string;
  serverName?: string;
  showServerName?: boolean;
}

export default function RecentFiles({ serverId, serverName, showServerName = false }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { recentFiles, openTab, clearRecentFiles } = useEditorStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const formatRelativeTime = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const truncateFileName = (name: string, maxLength: number = 24): string => {
    if (name.length <= maxLength) return name;
    const ext = name.includes('.') ? '.' + name.split('.').pop() : '';
    const baseName = name.slice(0, name.length - ext.length);
    const truncatedBase = baseName.slice(0, maxLength - ext.length - 3);
    return `${truncatedBase}...${ext}`;
  };

  const handleFileClick = (file: RecentFile) => {
    openTab(file.serverId, file.filePath);
    setIsOpen(false);
  };

  const handleClearRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearRecentFiles();
    setIsOpen(false);
  };

  // Filter recent files for current server if not showing all servers
  const displayFiles = showServerName
    ? recentFiles
    : recentFiles.filter(f => f.serverId === serverId);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-2 px-3 py-1.5 rounded transition-all',
          'bg-slate-800/50 border border-slate-700 hover:border-slate-600',
          'text-slate-400 hover:text-white',
          isOpen && 'border-cyber-500/50 text-white'
        )}
      >
        {/* Clock icon */}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-display text-xs uppercase tracking-wider">Recent</span>
        {displayFiles.length > 0 && (
          <span className="text-2xs bg-slate-700 px-1.5 py-0.5 rounded-full font-mono">
            {displayFiles.length}
          </span>
        )}
        {/* Chevron */}
        <svg
          className={clsx('w-3 h-3 transition-transform', isOpen && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu - positioned to avoid cropping */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-panel overflow-hidden z-50 animate-slide-up">
          {/* Header */}
          <div className="px-3 py-2 border-b border-slate-700 flex items-center justify-between">
            <span className="font-display text-xs uppercase tracking-wider text-slate-400">
              Recent Files
            </span>
            {displayFiles.length > 0 && (
              <button
                onClick={handleClearRecent}
                className="text-2xs font-mono uppercase tracking-wider text-slate-500 hover:text-red-400 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Files list */}
          {displayFiles.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <svg className="w-8 h-8 mx-auto text-slate-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-slate-600 text-xs font-mono uppercase tracking-wider">No recent files</p>
              <p className="text-slate-700 text-xs mt-1">Open a file to see it here</p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {displayFiles.map((file, index) => (
                <button
                  key={`${file.serverId}:${file.filePath}:${index}`}
                  onClick={() => handleFileClick(file)}
                  className={clsx(
                    'w-full px-3 py-2 text-left transition-all',
                    'hover:bg-slate-800 group',
                    'border-b border-slate-800 last:border-b-0'
                  )}
                >
                  <div className="flex items-start gap-2">
                    {/* File icon */}
                    <svg className="w-4 h-4 text-slate-500 group-hover:text-cyber-400 transition-colors flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      {/* File name */}
                      <p className="font-mono text-sm text-white group-hover:text-cyber-400 transition-colors truncate" title={file.fileName}>
                        {truncateFileName(file.fileName)}
                      </p>
                      {/* Meta info */}
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-2xs font-mono text-slate-500">
                          {formatRelativeTime(file.openedAt)}
                        </span>
                        {showServerName && (
                          <>
                            <span className="text-slate-700">|</span>
                            <span className="text-2xs font-mono text-slate-600 truncate" title={file.serverId}>
                              {file.serverId}
                            </span>
                          </>
                        )}
                      </div>
                      {/* File path */}
                      <p className="text-2xs font-mono text-slate-600 truncate mt-0.5" title={file.filePath}>
                        {file.filePath}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Footer */}
          {displayFiles.length > 0 && (
            <div className="px-3 py-2 border-t border-slate-700 bg-slate-900/50">
              <p className="text-2xs font-mono text-slate-600 text-center">
                Click to open file
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
