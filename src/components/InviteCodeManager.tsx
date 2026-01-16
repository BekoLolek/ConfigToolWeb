import { useState } from 'react';
import type { InviteCode } from '../types';

interface InviteCodeManagerProps {
  serverId: string;
  inviteCodes: InviteCode[];
  remainingSlots: number;
  maxSlots: number;
  planName: string;
  onGenerate: () => Promise<void>;
  onDelete: (codeId: string) => Promise<void>;
  loading?: boolean;
}

function formatTimeRemaining(expiresAt: string): string {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffMs = expiry.getTime() - now.getTime();

  if (diffMs <= 0) return 'Expired';

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function InviteCodeManager({
  serverId,
  inviteCodes,
  remainingSlots,
  maxSlots,
  planName,
  onGenerate,
  onDelete,
  loading = false,
}: InviteCodeManagerProps) {
  const [generating, setGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isFreePlan = planName === 'FREE';
  const canGenerate = !isFreePlan && remainingSlots > 0;
  const activeCodesCount = inviteCodes.filter(c => !c.used).length;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setGenerating(true);
    try {
      await onGenerate();
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (codeId: string) => {
    setDeletingId(codeId);
    try {
      await onDelete(codeId);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = async (code: string, codeId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(codeId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Invite Codes
              </h2>
              <span className="px-2 py-0.5 text-2xs font-mono uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded">
                {planName}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Generate invite codes to add collaborators to this server
            </p>
          </div>

          {/* Slots indicator */}
          <div className="flex-shrink-0 text-right">
            <div className="flex items-center gap-2">
              {!isFreePlan && (
                <>
                  <div className="flex gap-1">
                    {Array.from({ length: maxSlots }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-6 rounded-sm transition-colors ${
                          i < (maxSlots - remainingSlots)
                            ? 'bg-cyber-500'
                            : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {remainingSlots}/{maxSlots}
                  </span>
                </>
              )}
            </div>
            <p className="text-2xs text-slate-500 mt-1">
              {isFreePlan ? 'Upgrade to invite collaborators' : 'slots available'}
            </p>
          </div>
        </div>

        {/* Generate button */}
        <div className="mt-4">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || generating || loading}
            className={`btn flex items-center gap-2 ${
              canGenerate
                ? 'btn-primary'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {generating ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Generating...</span>
              </>
            ) : !canGenerate ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>{isFreePlan ? 'Upgrade Plan' : 'No Slots Available'}</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Generate Code</span>
              </>
            )}
          </button>

          {isFreePlan && (
            <p className="mt-2 text-xs text-amber-500 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Collaborators are available on Pro plan and above
            </p>
          )}
        </div>
      </div>

      {/* Active codes list */}
      {loading ? (
        <div className="p-8 flex items-center justify-center">
          <svg className="w-6 h-6 text-cyber-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : inviteCodes.length === 0 ? (
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 mb-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
            <svg className="w-7 h-7 text-slate-400 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <p className="text-slate-500 font-mono text-sm uppercase tracking-wider mb-1">
            No active invite codes
          </p>
          <p className="text-slate-600 dark:text-slate-500 text-xs">
            {canGenerate
              ? 'Generate a code to invite collaborators'
              : isFreePlan
                ? 'Upgrade your plan to invite collaborators'
                : 'All invite slots are in use'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {inviteCodes.map((code) => {
            const isExpired = new Date(code.expiresAt) <= new Date();

            return (
              <div
                key={code.id}
                className={`p-4 transition-colors ${
                  code.used || isExpired
                    ? 'bg-slate-50 dark:bg-slate-900/30 opacity-60'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Code display */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      {/* Code value with copy */}
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm font-medium text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 select-all">
                          {code.code}
                        </code>
                        <button
                          onClick={() => handleCopy(code.code, code.id)}
                          disabled={code.used || isExpired}
                          className={`p-2 rounded-lg transition-all ${
                            copiedId === code.id
                              ? 'bg-status-online/20 text-status-online'
                              : 'text-slate-400 hover:text-cyber-400 hover:bg-cyber-500/10'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          title={copiedId === code.id ? 'Copied!' : 'Copy code'}
                        >
                          {copiedId === code.id ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>

                      {/* Status badges */}
                      {code.used ? (
                        <span className="px-2 py-0.5 text-2xs font-mono uppercase tracking-wider bg-slate-500/10 text-slate-500 border border-slate-500/30 rounded">
                          Used
                        </span>
                      ) : isExpired ? (
                        <span className="px-2 py-0.5 text-2xs font-mono uppercase tracking-wider bg-status-error/10 text-status-error border border-status-error/30 rounded">
                          Expired
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-2xs font-mono uppercase tracking-wider bg-status-online/10 text-status-online border border-status-online/30 rounded flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-status-online rounded-full animate-pulse" />
                          Active
                        </span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Created {formatDate(code.createdAt)}
                      </span>
                      {!code.used && !isExpired && (
                        <span className="flex items-center gap-1 text-amber-500">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatTimeRemaining(code.expiresAt)}
                        </span>
                      )}
                      {code.used && code.usedAt && (
                        <span className="text-slate-400">
                          Used {formatDate(code.usedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(code.id)}
                    disabled={deletingId === code.id}
                    className="p-2 text-slate-400 hover:text-status-error hover:bg-status-error/10 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete code"
                  >
                    {deletingId === code.id ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer stats */}
      {inviteCodes.length > 0 && (
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            {activeCodesCount} active code{activeCodesCount !== 1 ? 's' : ''}
          </span>
          <span>
            Codes expire 12 hours after generation
          </span>
        </div>
      )}
    </div>
  );
}
