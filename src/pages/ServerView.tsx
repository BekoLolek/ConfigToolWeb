import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useServerStore } from '../stores/serverStore';
import { useWebSocket } from '../hooks/useWebSocket';
import FileTree from '../components/FileTree';
import ConfigEditor from '../components/ConfigEditor';
import VersionHistory from '../components/VersionHistory';

export default function ServerView() {
  const { serverId } = useParams<{ serverId: string }>();
  const { currentServer, fileCache, loadingDirs, fetchServer, loadDirectory, clearFileCache } = useServerStore();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => { if (serverId) { fetchServer(serverId); clearFileCache(); } }, [serverId]);
  useWebSocket(serverId);

  const handleLoadDirectory = (dir: string) => loadDirectory(serverId!, dir);

  if (!currentServer) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center gap-4">
        <Link to="/" className="text-gray-400 hover:text-white">← Back</Link>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${currentServer.online ? 'bg-green-500' : 'bg-gray-500'}`} />
          <span className="font-medium">{currentServer.name}</span>
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <span className="text-gray-400">Token:</span>
          <code className="bg-gray-700 px-2 py-1 rounded font-mono text-xs">{showToken ? currentServer.token : '••••••••'}</code>
          <button onClick={() => setShowToken(!showToken)} className="text-blue-400">{showToken ? 'Hide' : 'Show'}</button>
        </div>
      </header>
      {!currentServer.online && <div className="bg-yellow-900/50 border-b border-yellow-700 px-4 py-2 text-yellow-200 text-sm">Server offline. Install the agent plugin.</div>}
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div className="p-3 border-b border-gray-700 text-sm font-medium text-gray-400">Files</div>
          <FileTree serverId={serverId!} fileCache={fileCache} loadingDirs={loadingDirs} loadDirectory={handleLoadDirectory} selectedFile={selectedFile} onSelect={setSelectedFile} />
        </aside>
        <main className="flex-1 flex flex-col overflow-hidden">
          {selectedFile ? <ConfigEditor key={editorKey} serverId={serverId!} filePath={selectedFile} /> : <div className="flex-1 flex items-center justify-center text-gray-500">Select a file</div>}
        </main>
        {selectedFile && <aside className="w-72 bg-gray-800 border-l border-gray-700 overflow-y-auto"><VersionHistory serverId={serverId!} filePath={selectedFile} onRestore={() => setEditorKey(k => k + 1)} /></aside>}
      </div>
    </div>
  );
}
