import { useEffect, useState } from 'react';
import { fileApi } from '../api/endpoints';
import type { Version } from '../types';

interface Props { serverId: string; filePath: string; onRestore: () => void; }

export default function VersionHistory({ serverId, filePath, onRestore }: Props) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ id: string; content: string } | null>(null);

  useEffect(() => {
    let m = true;
    setLoading(true);
    fileApi.getVersions(serverId, filePath).then(r => { if (m) setVersions(r.data); }).catch(() => {}).finally(() => { if (m) setLoading(false); });
    return () => { m = false; };
  }, [serverId, filePath]);

  const handlePreview = async (id: string) => {
    if (preview?.id === id) { setPreview(null); return; }
    try { const r = await fileApi.getVersion(serverId, id); setPreview({ id, content: r.data.content }); } catch {}
  };

  const handleRestore = async (id: string) => {
    if (!confirm('Restore?')) return;
    setRestoring(id);
    try { await fileApi.restore(serverId, filePath, id); onRestore(); } catch {}
    setRestoring(null);
  };

  const fmt = (iso: string) => { const d = Date.now() - new Date(iso).getTime(); if (d < 60000) return 'Now'; if (d < 3600000) return `${Math.floor(d/60000)}m`; if (d < 86400000) return `${Math.floor(d/3600000)}h`; return `${Math.floor(d/86400000)}d`; };

  if (loading) return <div className="p-4 text-sm text-gray-500">Loading...</div>;
  if (versions.length === 0) return <div className="p-4 text-sm text-gray-500">No history</div>;

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-300 mb-4">Version History</h3>
      <div className="space-y-3">
        {versions.map((v, i) => (
          <div key={v.id} className="bg-gray-900 rounded p-3 border border-gray-700">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-sm text-white">{v.message || (i === 0 ? 'Latest' : 'No message')}</div>
                <div className="text-xs text-gray-500">{fmt(v.createdAt)} ago</div>
              </div>
              {i !== 0 && <button onClick={() => handleRestore(v.id)} disabled={restoring === v.id} className="text-xs text-blue-400 hover:text-blue-300 disabled:text-gray-500">{restoring === v.id ? '...' : 'Restore'}</button>}
            </div>
            <button onClick={() => handlePreview(v.id)} className="text-xs text-gray-400 hover:text-white">{preview?.id === v.id ? 'Hide' : 'Preview'}</button>
            {preview?.id === v.id && <pre className="mt-2 p-2 bg-gray-800 rounded text-xs text-gray-300 overflow-auto max-h-40 font-mono">{preview.content}</pre>}
          </div>
        ))}
      </div>
    </div>
  );
}
