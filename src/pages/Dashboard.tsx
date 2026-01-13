import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useServerStore } from '../stores/serverStore';

export default function Dashboard() {
  const { user, logout, refreshToken } = useAuthStore();
  const { servers, loading, fetchServers, createServer, deleteServer } = useServerStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchServers(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const server = await createServer(newName);
    setShowCreate(false); setNewName('');
    navigate(`/servers/${server.id}`);
  };

  const handleLogout = async () => {
    if (refreshToken) await import('../api/endpoints').then(m => m.authApi.logout(refreshToken)).catch(() => {});
    logout(); navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">ConfigTool</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user?.email}</span>
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white">Logout</button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Your Servers</h2>
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm">Add Server</button>
        </div>
        {loading && servers.length === 0 ? <div className="text-gray-500 text-center py-8">Loading...</div> : servers.length === 0 ? <div className="text-gray-500 text-center py-8">No servers yet</div> : (
          <div className="grid gap-4">
            {servers.map(s => (
              <Link key={s.id} to={`/servers/${s.id}`} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${s.online ? 'bg-green-500' : 'bg-gray-500'}`} />
                  <span className="font-medium">{s.name}</span>
                </div>
                <button onClick={(e) => { e.preventDefault(); if(confirm('Delete?')) deleteServer(s.id); }} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
              </Link>
            ))}
          </div>
        )}
        {showCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <form onSubmit={handleCreate} className="bg-gray-800 rounded-lg p-6 w-full max-w-sm">
              <h3 className="text-lg font-bold mb-4">Add Server</h3>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Server name" className="w-full mb-4 px-3 py-2 bg-gray-700 rounded" autoFocus />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-gray-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">Create</button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
