import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useServerStore } from '../stores/serverStore';

export function useWebSocket(serverId: string | undefined) {
  const ws = useRef<WebSocket | null>(null);
  const timer = useRef<number>();
  const { accessToken } = useAuthStore();
  const { updateServerStatus } = useServerStore();

  const connect = useCallback(() => {
    if (!accessToken || !serverId) return;
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_WS_URL || `${proto}//${window.location.host}`;
    ws.current = new WebSocket(`${host}/ws?token=${accessToken}`);
    ws.current.onopen = () => ws.current?.send(JSON.stringify({ type: 'SUBSCRIBE', serverId }));
    ws.current.onmessage = (e) => { try { const m = JSON.parse(e.data); if (m.type === 'SERVER_STATUS') updateServerStatus(m.serverId, m.online); } catch {} };
    ws.current.onclose = () => { timer.current = window.setTimeout(connect, 3000); };
  }, [accessToken, serverId, updateServerStatus]);

  useEffect(() => {
    connect();
    const ping = setInterval(() => { if (ws.current?.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify({ type: 'PING' })); }, 30000);
    return () => { clearInterval(ping); clearTimeout(timer.current); if (ws.current) { ws.current.onclose = null; ws.current.close(); } };
  }, [connect]);
}
