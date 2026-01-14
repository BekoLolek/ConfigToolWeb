import { useState, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import type { Tab } from '../stores/editorStore';
import { useEditorStore } from '../stores/editorStore';
import { toast } from '../stores/toastStore';

interface Props {
  tabs: Tab[];
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onSplitToggle?: () => void;
  isSplit: boolean;
  showSplitButton?: boolean;
  serverId?: string;
}

export default function TabBar({ tabs, activeTabId, onTabClick, onTabClose, onSplitToggle, isSplit, showSplitButton = true, serverId }: Props) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const reorderTabs = useEditorStore(state => state.reorderTabs);
  const saveAllTabs = useEditorStore(state => state.saveAllTabs);

  // Calculate unsaved tabs count
  const unsavedTabs = tabs.filter(tab => tab.content !== tab.originalContent);
  const unsavedCount = unsavedTabs.length;

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

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedIndex === null || draggedIndex === index) {
      setDropTargetIndex(null);
      return;
    }

    setDropTargetIndex(index);
  };

  const handleDragLeave = () => {
    setDropTargetIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();

    if (draggedIndex !== null && draggedIndex !== toIndex) {
      reorderTabs(draggedIndex, toIndex);
    }

    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  // Save All handler
  const handleSaveAll = useCallback(async () => {
    if (!serverId || unsavedCount === 0 || isSaving) return;

    setIsSaving(true);
    try {
      const result = await saveAllTabs(serverId);
      const successCount = result.success.length;
      const failedCount = result.failed.length;

      if (failedCount === 0 && successCount > 0) {
        toast.success(`Saved ${successCount} file${successCount > 1 ? 's' : ''} successfully`);
      } else if (successCount > 0 && failedCount > 0) {
        toast.warning(`Saved ${successCount} file${successCount > 1 ? 's' : ''}, ${failedCount} failed`);
      } else if (failedCount > 0) {
        toast.error('Failed to save files');
      }
    } catch {
      toast.error('Failed to save files');
    } finally {
      setIsSaving(false);
    }
  }, [serverId, unsavedCount, isSaving, saveAllTabs]);

  // Keyboard shortcut: Ctrl+Alt+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveAll]);

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
          tabs.map((tab, index) => {
            const isActive = tab.id === activeTabId;
            const hasChanges = tab.content !== tab.originalContent;
            const isJson = tab.fileName.endsWith('.json');
            const isDragging = draggedIndex === index;
            const isDropTarget = dropTargetIndex === index;

            return (
              <button
                key={tab.id}
                onClick={() => onTabClick(tab.id)}
                onMouseDown={(e) => handleMiddleClick(e, tab.id)}
                title={tab.filePath}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                className={clsx(
                  'group flex items-center gap-2 px-4 py-2 text-sm min-w-0 max-w-[200px] relative',
                  'transition-all duration-150',
                  isActive
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-850',
                  // Drag styles
                  isDragging && 'opacity-50 scale-105',
                  isDropTarget && 'bg-cyber-500/10'
                )}
              >
                {/* Drop indicator line */}
                {isDropTarget && draggedIndex !== null && draggedIndex > index && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-cyber-500" />
                )}
                {isDropTarget && draggedIndex !== null && draggedIndex < index && (
                  <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-cyber-500" />
                )}

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
      <div className="flex items-center border-l border-slate-800 px-2 gap-1">
        {/* Save All button - only show when there are unsaved tabs */}
        {unsavedCount > 0 && serverId && (
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            title={`Save all ${unsavedCount} unsaved file${unsavedCount > 1 ? 's' : ''} (Ctrl+Alt+S)`}
            className={clsx(
              'flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium transition-all',
              'bg-cyber-500/20 text-cyber-400 hover:bg-cyber-500/30',
              'border border-cyber-500/30 hover:border-cyber-500/50',
              isSaving && 'opacity-70 cursor-not-allowed'
            )}
          >
            {isSaving ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            )}
            <span>{unsavedCount}</span>
          </button>
        )}

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
