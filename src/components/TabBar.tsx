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
    <div className="flex items-center bg-gray-900 border-b border-gray-700">
      <div className="flex-1 flex overflow-x-auto scrollbar-thin">
        {tabs.length === 0 ? (
          <div className="px-4 py-2 text-gray-500 text-sm">No files open</div>
        ) : (
          tabs.map(tab => {
            const isActive = tab.id === activeTabId;
            const hasChanges = tab.content !== tab.originalContent;

            return (
              <button
                key={tab.id}
                onClick={() => onTabClick(tab.id)}
                onMouseDown={(e) => handleMiddleClick(e, tab.id)}
                title={tab.filePath}
                className={clsx(
                  'group flex items-center gap-2 px-3 py-2 text-sm border-r border-gray-700 min-w-0 max-w-[200px]',
                  'hover:bg-gray-800 transition-colors',
                  isActive
                    ? 'bg-gray-800 text-white border-b-2 border-b-blue-500 -mb-px'
                    : 'text-gray-400'
                )}
              >
                {hasChanges && (
                  <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" />
                )}
                <span className="truncate">{tab.fileName}</span>
                <span
                  onClick={(e) => handleClose(e, tab.id)}
                  className={clsx(
                    'ml-1 p-0.5 rounded hover:bg-gray-600 flex-shrink-0',
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

      {showSplitButton && onSplitToggle && (
        <button
          onClick={onSplitToggle}
          title={isSplit ? 'Close split view' : 'Split editor'}
          className={clsx(
            'p-2 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors',
            isSplit && 'text-blue-400'
          )}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
          </svg>
        </button>
      )}
    </div>
  );
}
