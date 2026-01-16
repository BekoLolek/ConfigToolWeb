import { create } from 'zustand';
import type { ServerListItem, Server, FileInfo, UpdateServerRequest, ServerCollaborator, InviteCode } from '../types';
import { serverApi, fileApi, collaboratorApi, inviteCodeApi } from '../api/endpoints';

interface ServerState {
  // Existing state
  servers: ServerListItem[];
  currentServer: Server | null;
  groups: string[];
  loading: boolean;
  error: string | null;

  // File cache state
  fileCache: Map<string, FileInfo[]>;
  loadingDirs: Set<string>;

  // Collaborator and invite code state
  collaborators: ServerCollaborator[];
  inviteCodes: InviteCode[];
  collaboratorsLoading: boolean;
  inviteCodesLoading: boolean;

  // Server methods
  fetchServers: () => Promise<void>;
  fetchGroups: () => Promise<void>;
  fetchServer: (id: string) => Promise<void>;
  createServer: (name: string) => Promise<Server>;
  updateServer: (id: string, data: UpdateServerRequest) => Promise<Server>;
  deleteServer: (id: string) => Promise<void>;
  leaveServer: (serverId: string) => Promise<void>;

  // File methods
  loadDirectory: (sid: string, dir: string) => Promise<FileInfo[]>;
  clearFileCache: () => void;
  invalidateDirectory: (dir: string) => void;
  updateServerStatus: (sid: string, online: boolean) => void;

  // Collaborator methods
  fetchCollaborators: (serverId: string) => Promise<void>;
  removeCollaborator: (serverId: string, collaboratorId: string) => Promise<void>;

  // Invite code methods
  fetchInviteCodes: (serverId: string) => Promise<void>;
  generateInviteCode: (serverId: string) => Promise<InviteCode>;
  deleteInviteCode: (serverId: string, codeId: string) => Promise<void>;

  // Utility methods
  clearCollaboratorsAndCodes: () => void;
  clearError: () => void;
}

export const useServerStore = create<ServerState>((set, get) => ({
  // Initial state
  servers: [],
  currentServer: null,
  groups: [],
  loading: false,
  error: null,
  fileCache: new Map(),
  loadingDirs: new Set(),
  collaborators: [],
  inviteCodes: [],
  collaboratorsLoading: false,
  inviteCodesLoading: false,

  // Server methods
  fetchServers: async () => {
    set({ loading: true, error: null });
    try {
      const servers = (await serverApi.list()).data;
      set({ servers });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to fetch servers' });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  fetchGroups: async () => {
    try {
      const groups = (await serverApi.getGroups()).data;
      set({ groups });
    } catch {
      // Ignore errors for groups fetch
    }
  },

  fetchServer: async (id) => {
    set({ loading: true, error: null });
    try {
      const currentServer = (await serverApi.get(id)).data;
      set({ currentServer });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to fetch server' });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  createServer: async (name) => {
    set({ error: null });
    try {
      const server = (await serverApi.create({ name })).data;
      set(st => ({
        servers: [...st.servers, {
          id: server.id,
          name: server.name,
          online: false,
          lastSeenAt: null,
          groupName: null
        }]
      }));
      return server;
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to create server' });
      throw e;
    }
  },

  updateServer: async (id, data) => {
    set({ error: null });
    try {
      const server = (await serverApi.update(id, data)).data;
      set(st => ({
        currentServer: st.currentServer?.id === id ? server : st.currentServer,
        servers: st.servers.map(x => x.id === id ? { ...x, name: server.name, groupName: server.groupName } : x)
      }));
      return server;
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to update server' });
      throw e;
    }
  },

  deleteServer: async (id) => {
    set({ error: null });
    try {
      await serverApi.delete(id);
      set(st => ({
        servers: st.servers.filter(x => x.id !== id),
        currentServer: st.currentServer?.id === id ? null : st.currentServer
      }));
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to delete server' });
      throw e;
    }
  },

  leaveServer: async (serverId) => {
    set({ error: null });
    try {
      await collaboratorApi.leave(serverId);
      set(st => ({
        servers: st.servers.filter(x => x.id !== serverId),
        currentServer: st.currentServer?.id === serverId ? null : st.currentServer
      }));
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to leave server' });
      throw e;
    }
  },

  // File methods
  loadDirectory: async (sid, dir) => {
    const { fileCache, loadingDirs } = get();
    if (fileCache.has(dir)) return fileCache.get(dir)!;
    if (loadingDirs.has(dir)) return [];

    set(st => ({ loadingDirs: new Set(st.loadingDirs).add(dir) }));
    try {
      const allFiles: FileInfo[] = [];
      let offset = 0;
      let hasMore = true;
      while (hasMore) {
        const res = (await fileApi.list(sid, dir, offset, 100)).data;
        allFiles.push(...res.files);
        hasMore = res.hasMore;
        offset += 100;
      }
      set(st => {
        const newCache = new Map(st.fileCache);
        newCache.set(dir, allFiles);
        const newLoading = new Set(st.loadingDirs);
        newLoading.delete(dir);
        return { fileCache: newCache, loadingDirs: newLoading };
      });
      return allFiles;
    } catch (e) {
      set(st => {
        const n = new Set(st.loadingDirs);
        n.delete(dir);
        return { loadingDirs: n };
      });
      throw e;
    }
  },

  clearFileCache: () => set({ fileCache: new Map() }),

  invalidateDirectory: (dir) => set(st => {
    const newCache = new Map(st.fileCache);
    newCache.delete(dir);
    return { fileCache: newCache };
  }),

  updateServerStatus: (sid, online) => set(st => ({
    servers: st.servers.map(x => x.id === sid ? { ...x, online } : x),
    currentServer: st.currentServer?.id === sid ? { ...st.currentServer, online } : st.currentServer
  })),

  // Collaborator methods
  fetchCollaborators: async (serverId) => {
    set({ collaboratorsLoading: true, error: null });
    try {
      const collaborators = (await collaboratorApi.list(serverId)).data;
      set({ collaborators });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to fetch collaborators' });
      throw e;
    } finally {
      set({ collaboratorsLoading: false });
    }
  },

  removeCollaborator: async (serverId, collaboratorId) => {
    set({ error: null });
    try {
      await collaboratorApi.remove(serverId, collaboratorId);
      set(st => ({
        collaborators: st.collaborators.filter(c => c.id !== collaboratorId)
      }));
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to remove collaborator' });
      throw e;
    }
  },

  // Invite code methods
  fetchInviteCodes: async (serverId) => {
    set({ inviteCodesLoading: true, error: null });
    try {
      const inviteCodes = (await inviteCodeApi.list(serverId)).data;
      set({ inviteCodes });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to fetch invite codes' });
      throw e;
    } finally {
      set({ inviteCodesLoading: false });
    }
  },

  generateInviteCode: async (serverId) => {
    set({ error: null });
    try {
      const inviteCode = (await inviteCodeApi.generate(serverId)).data;
      set(st => ({
        inviteCodes: [...st.inviteCodes, inviteCode]
      }));
      return inviteCode;
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to generate invite code' });
      throw e;
    }
  },

  deleteInviteCode: async (serverId, codeId) => {
    set({ error: null });
    try {
      await inviteCodeApi.delete(serverId, codeId);
      set(st => ({
        inviteCodes: st.inviteCodes.filter(c => c.id !== codeId)
      }));
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to delete invite code' });
      throw e;
    }
  },

  // Utility methods
  clearCollaboratorsAndCodes: () => set({
    collaborators: [],
    inviteCodes: [],
    collaboratorsLoading: false,
    inviteCodesLoading: false
  }),

  clearError: () => set({ error: null })
}));
