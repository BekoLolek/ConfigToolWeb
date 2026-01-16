import { useState } from 'react';
import type { ServerCollaborator } from '../types';

interface CollaboratorListProps {
  serverId: string;
  collaborators: ServerCollaborator[];
  onRemove: (userId: string) => Promise<void>;
  loading?: boolean;
  isOwner: boolean;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getInitials(email: string): string {
  const name = email.split('@')[0];
  if (name.length <= 2) return name.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColor(email: string): string {
  // Generate a consistent color based on email
  const colors = [
    'bg-cyber-600',
    'bg-purple-600',
    'bg-pink-600',
    'bg-amber-600',
    'bg-emerald-600',
    'bg-blue-600',
    'bg-rose-600',
    'bg-indigo-600',
  ];
  const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export default function CollaboratorList({
  serverId,
  collaborators,
  onRemove,
  loading = false,
  isOwner,
}: CollaboratorListProps) {
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const handleRemove = async (userId: string) => {
    if (confirmRemoveId !== userId) {
      setConfirmRemoveId(userId);
      // Auto-reset confirmation after 3 seconds
      setTimeout(() => setConfirmRemoveId(null), 3000);
      return;
    }

    setRemovingId(userId);
    setConfirmRemoveId(null);
    try {
      await onRemove(userId);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyber-500/10 rounded-lg">
            <svg className="w-5 h-5 text-cyber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Collaborators
            </h2>
            <p className="text-sm text-slate-500">
              {collaborators.length} team member{collaborators.length !== 1 ? 's' : ''} with access
            </p>
          </div>
        </div>
      </div>

      {/* Collaborators list */}
      {loading ? (
        <div className="p-8 flex items-center justify-center">
          <svg className="w-6 h-6 text-cyber-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : collaborators.length === 0 ? (
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 mb-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
            <svg className="w-7 h-7 text-slate-400 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <p className="text-slate-500 font-mono text-sm uppercase tracking-wider mb-1">
            No collaborators yet
          </p>
          <p className="text-slate-600 dark:text-slate-500 text-xs max-w-[280px] mx-auto">
            Generate an invite code above to add team members who can edit files on this server
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {collaborators.map((collaborator) => (
            <div
              key={collaborator.id}
              className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
            >
              {/* Avatar and info */}
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full ${getAvatarColor(collaborator.email)} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <span className="text-sm font-bold text-white">
                    {getInitials(collaborator.email)}
                  </span>
                </div>

                {/* Info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900 dark:text-white truncate">
                      {collaborator.email}
                    </p>
                    <span className="px-2 py-0.5 text-2xs font-mono uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded flex-shrink-0">
                      Collaborator
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Joined {formatDate(collaborator.joinedAt)}
                  </p>
                </div>
              </div>

              {/* Remove button */}
              {isOwner && (
                <button
                  onClick={() => handleRemove(collaborator.userId)}
                  disabled={removingId === collaborator.userId}
                  className={`px-3 py-1.5 text-xs font-display font-semibold uppercase tracking-wide rounded-lg transition-all flex items-center gap-1.5 ${
                    confirmRemoveId === collaborator.userId
                      ? 'bg-status-error text-white'
                      : 'text-slate-500 hover:text-status-error hover:bg-status-error/10 opacity-0 group-hover:opacity-100'
                  } disabled:opacity-50`}
                >
                  {removingId === collaborator.userId ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : confirmRemoveId === collaborator.userId ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Confirm
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                      </svg>
                      Remove
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer info */}
      {collaborators.length > 0 && (
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500">
          <svg className="w-4 h-4 text-cyber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            Collaborators can edit files but cannot manage server settings or invite others
          </span>
        </div>
      )}
    </div>
  );
}
