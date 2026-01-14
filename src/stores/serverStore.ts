import { create } from 'zustand';
import type { ServerListItem, Server, FileInfo } from '../types';
import { serverApi, fileApi } from '../api/endpoints';

interface ServerState {
  servers: ServerListItem[];
  currentServer: Server | null;
  fileCache: Map<string, FileInfo[]>; // dir -> files
  loadingDirs: Set<string>;
  loading: boolean;
  fetchServers: () => Promise<void>;
  fetchServer: (id: string) => Promise<void>;
  createServer: (name: string) => Promise<Server>;
  deleteServer: (id: string) => Promise<void>;
  loadDirectory: (sid: string, dir: string) => Promise<FileInfo[]>;
  clearFileCache: () => void;
  invalidateDirectory: (dir: string) => void;
  updateServerStatus: (sid: string, online: boolean) => void;
}

export const useServerStore = create<ServerState>((set, get) => ({
  servers: [], currentServer: null, fileCache: new Map(), loadingDirs: new Set(), loading: false,
  fetchServers: async () => { set({ loading: true }); try { set({ servers: (await serverApi.list()).data }); } finally { set({ loading: false }); } },
  fetchServer: async (id) => { set({ loading: true }); try { set({ currentServer: (await serverApi.get(id)).data }); } finally { set({ loading: false }); } },
  createServer: async (name) => { const s = (await serverApi.create(name)).data; set(st => ({ servers: [...st.servers, { id: s.id, name: s.name, online: false, lastSeenAt: null }] })); return s; },
  deleteServer: async (id) => { await serverApi.delete(id); set(st => ({ servers: st.servers.filter(x => x.id !== id) })); },
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
      set(st => { const n = new Set(st.loadingDirs); n.delete(dir); return { loadingDirs: n }; });
      throw e;
    }
  },
  clearFileCache: () => set({ fileCache: new Map() }),
  invalidateDirectory: (dir) => set(st => { const newCache = new Map(st.fileCache); newCache.delete(dir); return { fileCache: newCache }; }),
  updateServerStatus: (sid, online) => set(st => ({ servers: st.servers.map(x => x.id === sid ? { ...x, online } : x), currentServer: st.currentServer?.id === sid ? { ...st.currentServer, online } : st.currentServer }))
}));
