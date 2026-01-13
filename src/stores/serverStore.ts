import { create } from 'zustand';
import type { ServerListItem, Server, FileInfo } from '../types';
import { serverApi, fileApi } from '../api/endpoints';
interface ServerState { servers: ServerListItem[]; currentServer: Server | null; files: FileInfo[]; loading: boolean; fetchServers: () => Promise<void>; fetchServer: (id: string) => Promise<void>; createServer: (name: string) => Promise<Server>; deleteServer: (id: string) => Promise<void>; fetchFiles: (sid: string, dir?: string) => Promise<void>; updateServerStatus: (sid: string, online: boolean) => void; }
export const useServerStore = create<ServerState>((set) => ({
  servers: [], currentServer: null, files: [], loading: false,
  fetchServers: async () => { set({ loading: true }); try { set({ servers: (await serverApi.list()).data }); } finally { set({ loading: false }); } },
  fetchServer: async (id) => { set({ loading: true }); try { set({ currentServer: (await serverApi.get(id)).data }); } finally { set({ loading: false }); } },
  createServer: async (name) => { const s = (await serverApi.create(name)).data; set(st => ({ servers: [...st.servers, { id: s.id, name: s.name, online: false, lastSeenAt: null }] })); return s; },
  deleteServer: async (id) => { await serverApi.delete(id); set(st => ({ servers: st.servers.filter(x => x.id !== id) })); },
  fetchFiles: async (sid, dir) => { set({ loading: true }); try { set({ files: (await fileApi.list(sid, dir)).data.files }); } finally { set({ loading: false }); } },
  updateServerStatus: (sid, online) => set(st => ({ servers: st.servers.map(x => x.id === sid ? { ...x, online } : x), currentServer: st.currentServer?.id === sid ? { ...st.currentServer, online } : st.currentServer }))
}));
