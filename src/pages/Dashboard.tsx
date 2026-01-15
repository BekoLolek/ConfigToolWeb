import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useServerStore } from '../stores/serverStore';

export default function Dashboard() {
  const { servers, groups, loading, fetchServers, fetchGroups, createServer, deleteServer } = useServerStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServers();
    fetchGroups();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const server = await createServer(newName);
    setShowCreate(false);
    setNewName('');
    navigate(`/servers/${server.id}`);
  };

  const filteredServers = selectedGroup
    ? servers.filter(s => s.groupName === selectedGroup)
    : servers;
  const onlineCount = filteredServers.filter(s => s.online).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Dashboard header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-wide mb-1 sm:mb-2">
            Operations Dashboard
          </h1>
          <p className="text-slate-500 font-mono text-xs sm:text-sm uppercase tracking-wider">
            Server Fleet Management
          </p>
        </div>

        {/* Stats row */}
        <div className="flex gap-2 sm:gap-4 flex-wrap">
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg px-3 sm:px-5 py-2 sm:py-3 shadow-sm dark:shadow-none">
            <div className="text-2xs sm:text-xs font-mono uppercase tracking-wider text-slate-500 mb-1">Total</div>
            <div className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{filteredServers.length}</div>
          </div>
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg px-3 sm:px-5 py-2 sm:py-3 shadow-sm dark:shadow-none">
            <div className="text-2xs sm:text-xs font-mono uppercase tracking-wider text-slate-500 mb-1">Online</div>
            <div className="font-display text-xl sm:text-2xl font-bold text-status-online">{onlineCount}</div>
          </div>
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg px-3 sm:px-5 py-2 sm:py-3 shadow-sm dark:shadow-none">
            <div className="text-2xs sm:text-xs font-mono uppercase tracking-wider text-slate-500 mb-1">Offline</div>
            <div className="font-display text-xl sm:text-2xl font-bold text-slate-500">{filteredServers.length - onlineCount}</div>
          </div>
        </div>
      </div>

      {/* Group filter */}
      {groups.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 hidden sm:inline">Filter:</span>
          <button
            onClick={() => setSelectedGroup(null)}
            className={`px-2 sm:px-3 py-1 text-2xs sm:text-xs font-mono uppercase tracking-wider rounded-full transition-all ${
              selectedGroup === null
                ? 'bg-cyber-500 text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            All
          </button>
          {groups.map(group => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`px-2 sm:px-3 py-1 text-2xs sm:text-xs font-mono uppercase tracking-wider rounded-full transition-all ${
                selectedGroup === group
                  ? 'bg-cyber-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Server Nodes {selectedGroup && `/ ${selectedGroup}`}
        </h2>
        <button
          onClick={() => setShowCreate(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Server
        </button>
      </div>

      {/* Server grid */}
      {loading && servers.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-slate-500">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="font-mono text-sm uppercase tracking-wider">Loading servers...</span>
          </div>
        </div>
      ) : filteredServers.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
            <svg className="w-10 h-10 text-slate-400 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
            </svg>
          </div>
          <p className="text-slate-500 font-mono text-sm uppercase tracking-wider mb-4">
            {selectedGroup ? `No servers in group "${selectedGroup}"` : 'No servers registered'}
          </p>
          {!selectedGroup && (
            <button
              onClick={() => setShowCreate(true)}
              className="btn btn-primary"
            >
              Register First Server
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServers.map((server, index) => (
            <Link
              key={server.id}
              to={`/servers/${server.id}`}
              className="group relative bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden hover:border-cyber-500/50 transition-all duration-300 animate-fade-in shadow-sm dark:shadow-none"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Status bar */}
              <div className={`h-1 ${server.online ? 'bg-status-online' : 'bg-slate-300 dark:bg-slate-700'}`} />

              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`status-led ${server.online ? 'status-led-online' : 'status-led-offline'}`} />
                    <div>
                      <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white group-hover:text-cyber-500 dark:group-hover:text-cyber-400 transition-colors">
                        {server.name}
                      </h3>
                      <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                        {server.online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this server?')) {
                        deleteServer(server.id);
                      }
                    }}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    title="Delete server"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Group badge */}
                {server.groupName && (
                  <div className="mb-3">
                    <span className="inline-flex items-center px-2 py-0.5 text-2xs font-mono uppercase tracking-wider bg-cyber-500/10 text-cyber-600 dark:text-cyber-400 border border-cyber-500/30 rounded">
                      {server.groupName}
                    </span>
                  </div>
                )}

                {/* Server ID */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-500 dark:text-slate-600 uppercase tracking-wider">Node ID</span>
                  <code className="font-mono text-slate-600 dark:text-slate-500">{server.id.slice(0, 8)}...</code>
                </div>

                {/* Action hint */}
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-600">
                    Click to manage
                  </span>
                  <svg className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-cyber-500 dark:group-hover:text-cyber-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Hover glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-cyber-500/5 to-transparent" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create server modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="relative w-full max-w-md mx-4 animate-slide-up">
            {/* Corner accents */}
            <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-cyber-500" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-cyber-500" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-cyber-500" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-cyber-500" />

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl dark:shadow-panel overflow-hidden">
              {/* Header stripe */}
              <div className="h-1 bg-gradient-to-r from-cyber-600 via-cyber-400 to-cyber-600" />

              <form onSubmit={handleCreate} className="p-6">
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-1">
                  Register New Server
                </h3>
                <p className="text-slate-500 text-sm font-mono uppercase tracking-wider mb-6">
                  Add a new node to your fleet
                </p>

                <div className="mb-6">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                    Server Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g., Production-01"
                    className="input"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="flex-1 btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newName.trim()}
                    className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Server
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
