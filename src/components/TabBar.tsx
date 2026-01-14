import clsx from 'clsx';
import type { Tab } from '../stores/editorStore';

interface Props {
  tabs: Tab[];
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onSplitToggle?: () => void;
  isSplit: boolean;
  showSplitButton?: boolean;
}

export default function TabBar({ tabs, activeTabId, onTabClick, onTabClose, onSplitToggle, isSplit, showSplitButton = true }: Props) {
  const handleClose = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    onTabClose(tabId);
  };

  const handleMiddleClick = (e: React.MouseEvent, tabId: string) => {
    if (e.button === 1) {
      e.preventDefault();
      onTabClose(tabId);
    }
  };

  return (
    <div className="flex items-center bg-slate-900 border-b border-slate-800 h-10">
      <div className="flex-1 flex overflow-x-auto scrollbar-thin">
        {tabs.length === 0 ? (
          <div className="px-4 py-2 text-slate-600 text-xs font-mono uppercase tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            No files open
          </div>
        ) : (
          tabs.map(tab => {
            const isActive = tab.id === activeTabId;
            const hasChanges = tab.content !== tab.originalContent;
            const isJson = tab.fileName.endsWith('.json');

            return (
              <button
                key={tab.id}
                onClick={() => onTabClick(tab.id)}
                onMouseDown={(e) => handleMiddleClick(e, tab.id)}
                title={tab.filePath}
                className={clsx(
                  'group flex items-center gap-2 px-4 py-2 text-sm min-w-0 max-w-[200px] relative',
                  'transition-all duration-150',
                  isActive
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-850'
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyber-500" />
                )}

                {/* File type indicator */}
                <span className={clsx(
                  'flex-shrink-0 w-4 h-4 flex items-center justify-center text-2xs font-mono font-bold rounded',
                  isActive
                    ? 'bg-cyber-500/20 text-cyber-400'
                    : isJson
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'bg-blue-500/10 text-blue-400'
                )}>
                  {isJson ? 'J' : 'Y'}
                </span>

                {/* File name */}
                <span className="truncate font-mono text-xs">{tab.fileName}</span>

                {/* Unsaved indicator */}
                {hasChanges && (
                  <span className="flex-shrink-0 w-2 h-2 rounded-full bg-status-warning animate-pulse" title="Unsaved changes" />
                )}

                {/* Close button */}
                <span
                  onClick={(e) => handleClose(e, tab.id)}
                  className={clsx(
                    'ml-1 p-1 rounded hover:bg-slate-700 flex-shrink-0 transition-all',
                    'opacity-0 group-hover:opacity-100',
                    isActive && 'opacity-100'
                  )}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center border-l border-slate-800 px-2">
        {showSplitButton && onSplitToggle && (
          <button
            onClick={onSplitToggle}
            title={isSplit ? 'Close split view' : 'Split editor'}
            className={clsx(
              'p-2 rounded hover:bg-slate-800 transition-colors',
              isSplit ? 'text-cyber-400' : 'text-slate-500 hover:text-white'
            )}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
