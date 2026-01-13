import { useEffect, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { fileApi } from '../api/endpoints';

interface Props { serverId: string; filePath: string; }

export default function ConfigEditor({ serverId, filePath }: Props) {
  const [content, setContent] = useState('');
  const [original, setOriginal] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSave, setShowSave] = useState(false);
  const [message, setMessage] = useState('');
  const [reload, setReload] = useState(true);

  const hasChanges = content !== original;

  useEffect(() => {
    let mounted = true;
    setLoading(true); setError(null);
    fileApi.getContent(serverId, filePath)
      .then(res => { if (mounted) { setContent(res.data.content); setOriginal(res.data.content); } })
      .catch(() => { if (mounted) setError('Failed to load'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [serverId, filePath]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); if (hasChanges && !saving) setShowSave(true); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [hasChanges, saving]);

  const handleSave = useCallback(async () => {
    if (!hasChanges || saving) return;
    setSaving(true); setError(null); setShowSave(false);
    try { await fileApi.save(serverId, filePath, content, message || undefined, reload); setOriginal(content); setMessage(''); }
    catch (e: any) { setError(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  }, [serverId, filePath, content, message, reload, hasChanges, saving]);

  if (loading) return <div className="flex-1 flex items-center justify-center text-gray-500">Loading...</div>;

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 font-mono">{filePath}</span>
          {hasChanges && <span className="text-yellow-500 text-sm">● Unsaved</span>}
        </div>
        {hasChanges && (
          <div className="flex items-center gap-2">
            <button onClick={() => setContent(original)} className="px-3 py-1 text-sm text-gray-400 hover:text-white">Discard</button>
            <button onClick={() => setShowSave(true)} disabled={saving} className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        )}
      </div>
      {error && <div className="px-4 py-2 bg-red-900/50 text-red-200 text-sm">{error}</div>}
      <div className="flex-1">
        <Editor height="100%" language={filePath.endsWith('.json') ? 'json' : 'yaml'} value={content} onChange={v => setContent(v || '')} theme="vs-dark" options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on', tabSize: 2 }} />
      </div>
      {showSave && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Save Changes</h3>
            <input type="text" value={message} onChange={e => setMessage(e.target.value)} placeholder="Commit message (optional)" className="w-full mb-4 px-3 py-2 bg-gray-700 rounded" autoFocus />
            <label className="flex items-center gap-2 mb-6 text-sm text-gray-300">
              <input type="checkbox" checked={reload} onChange={e => setReload(e.target.checked)} className="w-4 h-4" />
              Reload plugin after save
            </label>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowSave(false)} className="px-4 py-2 text-gray-400">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
