import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fileApi } from '../api/endpoints';

export interface Tab {
  id: string;
  serverId: string;
  filePath: string;
  fileName: string;
  content: string;
  originalContent: string;
  isLoading: boolean;
  error: string | null;
}

interface EditorState {
  tabs: Tab[];
  leftPaneTabId: string | null;
  rightPaneTabId: string | null;
  activePaneIndex: 0 | 1;
  isSplit: boolean;
  isFileTreeCollapsed: boolean;
  isHistoryCollapsed: boolean;

  openTab: (serverId: string, filePath: string) => Promise<void>;
  closeTab: (tabId: string) => boolean;
  closeAllTabs: () => void;
  setActiveTab: (paneIndex: 0 | 1, tabId: string) => void;
  setActivePaneIndex: (index: 0 | 1) => void;
  updateContent: (tabId: string, content: string) => void;
  markTabSaved: (tabId: string, newContent: string) => void;
  reloadTab: (tabId: string) => Promise<void>;
  toggleSplit: () => void;
  toggleFileTree: () => void;
  toggleHistory: () => void;

  getTab: (tabId: string) => Tab | undefined;
  getActiveTab: (paneIndex: 0 | 1) => Tab | undefined;
  hasUnsavedChanges: () => boolean;
  getUnsavedTabs: () => Tab[];
}

const getTabId = (serverId: string, filePath: string) => `${serverId}:${filePath}`;
const getFileName = (filePath: string) => filePath.split('/').pop() || filePath;

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      tabs: [],
      leftPaneTabId: null,
      rightPaneTabId: null,
      activePaneIndex: 0,
      isSplit: false,
      isFileTreeCollapsed: false,
      isHistoryCollapsed: false,

      openTab: async (serverId, filePath) => {
        const tabId = getTabId(serverId, filePath);
        const { tabs, activePaneIndex } = get();
        const existing = tabs.find(t => t.id === tabId);

        if (existing) {
          // Tab already open - just activate it
          set(activePaneIndex === 0
            ? { leftPaneTabId: tabId }
            : { rightPaneTabId: tabId }
          );
          return;
        }

        // Create new tab in loading state
        const newTab: Tab = {
          id: tabId,
          serverId,
          filePath,
          fileName: getFileName(filePath),
          content: '',
          originalContent: '',
          isLoading: true,
          error: null,
        };

        set(state => ({
          tabs: [...state.tabs, newTab],
          ...(state.activePaneIndex === 0
            ? { leftPaneTabId: tabId }
            : { rightPaneTabId: tabId }
          ),
        }));

        // Fetch content
        try {
          const res = await fileApi.getContent(serverId, filePath);
          set(state => ({
            tabs: state.tabs.map(t =>
              t.id === tabId
                ? { ...t, content: res.data.content, originalContent: res.data.content, isLoading: false }
                : t
            ),
          }));
        } catch {
          set(state => ({
            tabs: state.tabs.map(t =>
              t.id === tabId
                ? { ...t, isLoading: false, error: 'Failed to load file' }
                : t
            ),
          }));
        }
      },

      closeTab: (tabId) => {
        const { tabs, leftPaneTabId, rightPaneTabId } = get();
        const tab = tabs.find(t => t.id === tabId);

        if (tab && tab.content !== tab.originalContent) {
          // Has unsaved changes - caller should confirm
          return false;
        }

        const newTabs = tabs.filter(t => t.id !== tabId);
        const tabIndex = tabs.findIndex(t => t.id === tabId);

        // Find next tab to activate
        const getNextTabId = (currentId: string | null) => {
          if (currentId !== tabId) return currentId;
          if (newTabs.length === 0) return null;
          const nextIndex = Math.min(tabIndex, newTabs.length - 1);
          return newTabs[nextIndex]?.id || null;
        };

        set({
          tabs: newTabs,
          leftPaneTabId: getNextTabId(leftPaneTabId),
          rightPaneTabId: getNextTabId(rightPaneTabId),
        });
        return true;
      },

      closeAllTabs: () => {
        set({
          tabs: [],
          leftPaneTabId: null,
          rightPaneTabId: null,
        });
      },

      setActiveTab: (paneIndex, tabId) => {
        set(paneIndex === 0
          ? { leftPaneTabId: tabId }
          : { rightPaneTabId: tabId }
        );
      },

      setActivePaneIndex: (index) => {
        set({ activePaneIndex: index });
      },

      updateContent: (tabId, content) => {
        set(state => ({
          tabs: state.tabs.map(t =>
            t.id === tabId ? { ...t, content } : t
          ),
        }));
      },

      markTabSaved: (tabId, newContent) => {
        set(state => ({
          tabs: state.tabs.map(t =>
            t.id === tabId ? { ...t, content: newContent, originalContent: newContent } : t
          ),
        }));
      },

      reloadTab: async (tabId) => {
        const tab = get().tabs.find(t => t.id === tabId);
        if (!tab) return;

        set(state => ({
          tabs: state.tabs.map(t =>
            t.id === tabId ? { ...t, isLoading: true, error: null } : t
          ),
        }));

        try {
          const res = await fileApi.getContent(tab.serverId, tab.filePath);
          set(state => ({
            tabs: state.tabs.map(t =>
              t.id === tabId
                ? { ...t, content: res.data.content, originalContent: res.data.content, isLoading: false }
                : t
            ),
          }));
        } catch {
          set(state => ({
            tabs: state.tabs.map(t =>
              t.id === tabId ? { ...t, isLoading: false, error: 'Failed to reload file' } : t
            ),
          }));
        }
      },

      toggleSplit: () => {
        set(state => {
          if (state.isSplit) {
            // Closing split - move right pane tab to left if left is empty
            return {
              isSplit: false,
              leftPaneTabId: state.leftPaneTabId || state.rightPaneTabId,
              rightPaneTabId: null,
              activePaneIndex: 0,
            };
          }
          return { isSplit: true };
        });
      },

      toggleFileTree: () => {
        set(state => ({ isFileTreeCollapsed: !state.isFileTreeCollapsed }));
      },

      toggleHistory: () => {
        set(state => ({ isHistoryCollapsed: !state.isHistoryCollapsed }));
      },

      getTab: (tabId) => get().tabs.find(t => t.id === tabId),

      getActiveTab: (paneIndex) => {
        const { tabs, leftPaneTabId, rightPaneTabId } = get();
        const tabId = paneIndex === 0 ? leftPaneTabId : rightPaneTabId;
        return tabId ? tabs.find(t => t.id === tabId) : undefined;
      },

      hasUnsavedChanges: () => {
        return get().tabs.some(t => t.content !== t.originalContent);
      },

      getUnsavedTabs: () => {
        return get().tabs.filter(t => t.content !== t.originalContent);
      },
    }),
    {
      name: 'editor-layout',
      partialize: (state) => ({
        isFileTreeCollapsed: state.isFileTreeCollapsed,
        isHistoryCollapsed: state.isHistoryCollapsed,
        isSplit: state.isSplit,
      }),
    }
  )
);
