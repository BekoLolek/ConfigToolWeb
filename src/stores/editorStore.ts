import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fileApi, filePermissionApi } from '../api/endpoints';

export interface Tab {
  id: string;
  serverId: string;
  filePath: string;
  fileName: string;
  content: string;
  originalContent: string;
  isLoading: boolean;
  error: string | null;
  lastSaved: number | null;
  readOnly: boolean;
}

export interface RecentFile {
  serverId: string;
  filePath: string;
  fileName: string;
  openedAt: number;
}

const DRAFTS_STORAGE_KEY = 'editor-drafts';
const MAX_RECENT_FILES = 10;

interface EditorState {
  tabs: Tab[];
  leftPaneTabId: string | null;
  rightPaneTabId: string | null;
  activePaneIndex: 0 | 1;
  isSplit: boolean;
  isFileTreeCollapsed: boolean;
  isHistoryCollapsed: boolean;
  recentFiles: RecentFile[];

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

  // Recent files
  clearRecentFiles: () => void;

  // Tab reordering
  reorderTabs: (fromIndex: number, toIndex: number) => void;

  // Batch save
  saveAllTabs: (serverId: string, reload?: boolean) => Promise<{ success: string[]; failed: string[] }>;

  // Drafts
  saveDrafts: () => void;
  loadDrafts: () => void;
  clearDrafts: () => void;

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
      recentFiles: [],

      openTab: async (serverId, filePath) => {
        const tabId = getTabId(serverId, filePath);
        const { tabs, activePaneIndex, recentFiles } = get();
        const existing = tabs.find(t => t.id === tabId);
        const fileName = getFileName(filePath);

        // Add to recent files
        const newRecentFile: RecentFile = {
          serverId,
          filePath,
          fileName,
          openedAt: Date.now(),
        };
        const updatedRecentFiles = [
          newRecentFile,
          ...recentFiles.filter(f => !(f.serverId === serverId && f.filePath === filePath)),
        ].slice(0, MAX_RECENT_FILES);

        if (existing) {
          // Tab already open - just activate it and update recent files
          set(state => ({
            recentFiles: updatedRecentFiles,
            ...(activePaneIndex === 0
              ? { leftPaneTabId: tabId }
              : { rightPaneTabId: tabId }
            ),
          }));
          return;
        }

        // Create new tab in loading state
        const newTab: Tab = {
          id: tabId,
          serverId,
          filePath,
          fileName,
          content: '',
          originalContent: '',
          isLoading: true,
          error: null,
          lastSaved: null,
          readOnly: false,
        };

        set(state => ({
          tabs: [...state.tabs, newTab],
          recentFiles: updatedRecentFiles,
          ...(state.activePaneIndex === 0
            ? { leftPaneTabId: tabId }
            : { rightPaneTabId: tabId }
          ),
        }));

        // Fetch content and check permissions in parallel
        try {
          const [contentRes, permissionsRes] = await Promise.all([
            fileApi.getContent(serverId, filePath),
            filePermissionApi.checkAccess(serverId, filePath).catch(() => ({ data: { canRead: true, canWrite: true } })),
          ]);

          const isReadOnly = !permissionsRes.data.canWrite;

          set(state => ({
            tabs: state.tabs.map(t =>
              t.id === tabId
                ? { ...t, content: contentRes.data.content, originalContent: contentRes.data.content, isLoading: false, readOnly: isReadOnly }
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
            t.id === tabId
              ? { ...t, content: newContent, originalContent: newContent, lastSaved: Date.now() }
              : t
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
          const [contentRes, permissionsRes] = await Promise.all([
            fileApi.getContent(tab.serverId, tab.filePath),
            filePermissionApi.checkAccess(tab.serverId, tab.filePath).catch(() => ({ data: { canRead: true, canWrite: true } })),
          ]);

          const isReadOnly = !permissionsRes.data.canWrite;

          set(state => ({
            tabs: state.tabs.map(t =>
              t.id === tabId
                ? { ...t, content: contentRes.data.content, originalContent: contentRes.data.content, isLoading: false, readOnly: isReadOnly }
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

      // Recent files
      clearRecentFiles: () => {
        set({ recentFiles: [] });
      },

      // Tab reordering
      reorderTabs: (fromIndex, toIndex) => {
        set(state => {
          if (fromIndex === toIndex) return state;
          if (fromIndex < 0 || toIndex < 0) return state;
          if (fromIndex >= state.tabs.length || toIndex >= state.tabs.length) return state;

          const newTabs = [...state.tabs];
          const [removed] = newTabs.splice(fromIndex, 1);
          newTabs.splice(toIndex, 0, removed);

          return { tabs: newTabs };
        });
      },

      // Batch save
      saveAllTabs: async (serverId, reload = false) => {
        const { tabs } = get();
        const unsavedTabs = tabs.filter(
          t => t.serverId === serverId && t.content !== t.originalContent && !t.readOnly
        );

        const success: string[] = [];
        const failed: string[] = [];

        await Promise.all(
          unsavedTabs.map(async (tab) => {
            try {
              await fileApi.save(serverId, tab.filePath, tab.content, undefined, reload);
              set(state => ({
                tabs: state.tabs.map(t =>
                  t.id === tab.id
                    ? { ...t, originalContent: t.content, lastSaved: Date.now() }
                    : t
                ),
              }));
              success.push(tab.filePath);
            } catch {
              failed.push(tab.filePath);
            }
          })
        );

        return { success, failed };
      },

      // Drafts
      saveDrafts: () => {
        const { tabs } = get();
        const drafts: Record<string, { content: string; savedAt: number }> = {};

        tabs.forEach(tab => {
          if (tab.content !== tab.originalContent) {
            drafts[tab.id] = {
              content: tab.content,
              savedAt: Date.now(),
            };
          }
        });

        try {
          localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
        } catch {
          // localStorage might be full or unavailable
        }
      },

      loadDrafts: () => {
        try {
          const draftsJson = localStorage.getItem(DRAFTS_STORAGE_KEY);
          if (!draftsJson) return;

          const drafts: Record<string, { content: string; savedAt: number }> = JSON.parse(draftsJson);
          const { tabs } = get();

          // Only restore drafts for tabs that are currently open
          const updatedTabs = tabs.map(tab => {
            const draft = drafts[tab.id];
            if (draft && draft.content !== tab.originalContent) {
              return { ...tab, content: draft.content };
            }
            return tab;
          });

          set({ tabs: updatedTabs });
        } catch {
          // Invalid JSON or other error
        }
      },

      clearDrafts: () => {
        try {
          localStorage.removeItem(DRAFTS_STORAGE_KEY);
        } catch {
          // localStorage might be unavailable
        }
      },

      getTab: (tabId) => get().tabs.find(t => t.id === tabId),

      getActiveTab: (paneIndex) => {
        const { tabs, leftPaneTabId, rightPaneTabId } = get();
        const tabId = paneIndex === 0 ? leftPaneTabId : rightPaneTabId;
        return tabId ? tabs.find(t => t.id === tabId) : undefined;
      },

      hasUnsavedChanges: () => {
        return get().tabs.some(t => t.content !== t.originalContent && !t.readOnly);
      },

      getUnsavedTabs: () => {
        return get().tabs.filter(t => t.content !== t.originalContent && !t.readOnly);
      },
    }),
    {
      name: 'editor-layout',
      partialize: (state) => ({
        isFileTreeCollapsed: state.isFileTreeCollapsed,
        isHistoryCollapsed: state.isHistoryCollapsed,
        isSplit: state.isSplit,
        recentFiles: state.recentFiles,
      }),
    }
  )
);
