import { useState, useRef, useEffect } from 'react';
import { inviteCodeApi } from '../api/endpoints';
import type { InviteCodeValidation } from '../types';

interface JoinServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (serverName: string) => void;
}

type ModalState = 'input' | 'validating' | 'validated' | 'joining' | 'success' | 'error';

export default function JoinServerModal({ isOpen, onClose, onJoin }: JoinServerModalProps) {
  const [code, setCode] = useState('');
  const [state, setState] = useState<ModalState>('input');
  const [validation, setValidation] = useState<InviteCodeValidation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCode('');
      setState('input');
      setValidation(null);
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleValidate = async () => {
    if (!code.trim()) return;

    setState('validating');
    setError(null);

    try {
      const { data } = await inviteCodeApi.validate(code.trim());
      setValidation(data);

      if (data.valid) {
        setState('validated');
      } else {
        setState('error');
        setError('This invite code is invalid or has expired');
      }
    } catch (err: any) {
      setState('error');
      setError(err.response?.data?.message || 'Failed to validate code');
    }
  };

  const handleJoin = async () => {
    if (!validation?.valid) return;

    setState('joining');
    setError(null);

    try {
      await inviteCodeApi.use(code.trim());
      setState('success');
      // Notify parent after a brief delay to show success state
      setTimeout(() => {
        onJoin(validation.serverName || 'Server');
        onClose();
      }, 1500);
    } catch (err: any) {
      setState('error');
      const message = err.response?.data?.message || 'Failed to join server';
      // Handle specific error cases
      if (message.includes('already')) {
        setError('You are already a member of this server');
      } else if (message.includes('expired')) {
        setError('This invite code has expired');
      } else if (message.includes('used')) {
        setError('This invite code has already been used');
      } else {
        setError(message);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      if (state === 'input' && code.trim()) {
        handleValidate();
      } else if (state === 'validated') {
        handleJoin();
      }
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md mx-4 animate-slide-up">
        {/* Corner accents */}
        <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-cyber-500" />
        <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-cyber-500" />
        <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-cyber-500" />
        <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-cyber-500" />

        <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-panel overflow-hidden">
          {/* Header stripe */}
          <div className="h-1 bg-gradient-to-r from-cyber-600 via-cyber-400 to-cyber-600" />

          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-cyber-500/10 rounded-lg">
                <svg className="w-6 h-6 text-cyber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white">
                  Join Server
                </h3>
                <p className="text-slate-500 text-sm">
                  Enter an invite code to join a server
                </p>
              </div>
            </div>

            {/* Success state */}
            {state === 'success' && (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-status-online/20 rounded-full">
                  <svg className="w-8 h-8 text-status-online" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg font-display font-bold text-white mb-2">
                  Successfully Joined!
                </p>
                <p className="text-slate-400 text-sm">
                  You now have access to <span className="text-cyber-400">{validation?.serverName}</span>
                </p>
              </div>
            )}

            {/* Main content */}
            {state !== 'success' && (
              <>
                {/* Input field */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Invite Code
                  </label>
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value.toUpperCase());
                        if (state !== 'input') {
                          setState('input');
                          setValidation(null);
                          setError(null);
                        }
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="ABC123XYZ789"
                      disabled={state === 'validating' || state === 'joining'}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-600 font-mono text-lg tracking-widest text-center focus:outline-none focus:border-cyber-500 focus:ring-1 focus:ring-cyber-500/50 transition-all disabled:opacity-50"
                      maxLength={12}
                    />
                    {state === 'validating' && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="w-5 h-5 text-cyber-400 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Validated server info */}
                {state === 'validated' && validation && (
                  <div className="mb-4 p-4 bg-status-online/10 border border-status-online/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-status-online/20 rounded-lg">
                        <svg className="w-5 h-5 text-status-online" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-mono uppercase tracking-wider text-status-online mb-0.5">
                          Valid Invite Code
                        </p>
                        <p className="font-display font-bold text-white">
                          {validation.serverName}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div className="mb-4 p-4 bg-status-error/10 border border-status-error/30 rounded-lg flex items-start gap-3">
                    <svg className="w-5 h-5 text-status-error flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-status-error">
                      {error}
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    disabled={state === 'joining'}
                    className="flex-1 btn btn-secondary"
                  >
                    Cancel
                  </button>

                  {state === 'validated' || state === 'joining' ? (
                    <button
                      onClick={handleJoin}
                      disabled={state === 'joining'}
                      className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                    >
                      {state === 'joining' ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span>Joining...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                          <span>Join Server</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleValidate}
                      disabled={!code.trim() || state === 'validating'}
                      className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                    >
                      {state === 'validating' ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span>Validating...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Validate</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Help text */}
            {state === 'input' && (
              <p className="mt-4 text-center text-xs text-slate-500">
                Ask a server owner for an invite code to join their server
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
