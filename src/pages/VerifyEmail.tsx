import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/endpoints';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setErrorMessage('No verification token provided');
      return;
    }

    authApi.verifyEmail(token)
      .then(() => {
        setStatus('success');
        setTimeout(() => navigate('/login'), 3000);
      })
      .catch((err) => {
        setStatus('error');
        setErrorMessage(err.response?.data?.message || 'Failed to verify email');
      });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950 bg-ops-grid relative overflow-hidden">
      {/* Ambient background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyber-600/5 rounded-full blur-3xl" />
      </div>

      {/* Main panel */}
      <div className="relative w-full max-w-md animate-fade-in">
        {/* Corner accents */}
        <div className="absolute -top-2 -left-2 w-8 h-8 border-l-2 border-t-2 border-cyber-500" />
        <div className="absolute -top-2 -right-2 w-8 h-8 border-r-2 border-t-2 border-cyber-500" />
        <div className="absolute -bottom-2 -left-2 w-8 h-8 border-l-2 border-b-2 border-cyber-500" />
        <div className="absolute -bottom-2 -right-2 w-8 h-8 border-r-2 border-b-2 border-cyber-500" />

        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg shadow-panel overflow-hidden">
          {/* Header stripe */}
          <div className={`h-1 ${status === 'success' ? 'bg-gradient-to-r from-green-600 via-green-400 to-green-600' : status === 'error' ? 'bg-gradient-to-r from-red-600 via-red-400 to-red-600' : 'bg-gradient-to-r from-cyber-600 via-cyber-400 to-cyber-600'}`} />

          <div className="p-8">
            {/* Logo area */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 border-2 border-cyber-500/30 rounded-lg bg-slate-800/50">
                <svg className="w-8 h-8 text-cyber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <h1 className="font-display text-3xl font-bold text-white tracking-wide">
                CONFIG<span className="text-cyber-400">TOOL</span>
              </h1>
              <p className="text-slate-500 text-sm mt-2 font-mono uppercase tracking-widest">
                Email Verification
              </p>
            </div>

            {/* Status content */}
            <div className="text-center">
              {status === 'loading' && (
                <div className="py-8">
                  <div className="flex justify-center mb-4">
                    <span className="flex gap-1">
                      <span className="w-3 h-3 bg-cyber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-3 h-3 bg-cyber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-3 h-3 bg-cyber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                  <p className="text-slate-400 font-mono text-sm">Verifying your email...</p>
                </div>
              )}

              {status === 'success' && (
                <div className="py-8 animate-fade-in">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-display font-bold text-white mb-2">Email Verified!</h2>
                  <p className="text-slate-400 text-sm mb-6">Your email has been successfully verified.</p>
                  <p className="text-slate-500 text-xs font-mono">Redirecting to login...</p>
                </div>
              )}

              {status === 'error' && (
                <div className="py-8 animate-fade-in">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-display font-bold text-white mb-2">Verification Failed</h2>
                  <p className="text-slate-400 text-sm mb-6">{errorMessage}</p>
                  <Link
                    to="/login"
                    className="inline-block btn btn-primary px-6 py-2"
                  >
                    Go to Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-center gap-2 mt-6 text-slate-600">
          <span className={`w-2 h-2 rounded-full ${status === 'success' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-cyber-500'} animate-pulse`} />
          <span className="text-xs font-mono uppercase tracking-wider">
            {status === 'loading' ? 'Processing' : status === 'success' ? 'Verified' : 'Error'}
          </span>
        </div>
      </div>
    </div>
  );
}
