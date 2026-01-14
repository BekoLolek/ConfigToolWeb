import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../api/endpoints';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await (isRegister ? authApi.register(email, password) : authApi.login(email, password));
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950 bg-ops-grid relative overflow-hidden">
      {/* Ambient background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyber-600/5 rounded-full blur-3xl" />
      </div>

      {/* Main login panel */}
      <div className="relative w-full max-w-md animate-fade-in">
        {/* Corner accents */}
        <div className="absolute -top-2 -left-2 w-8 h-8 border-l-2 border-t-2 border-cyber-500" />
        <div className="absolute -top-2 -right-2 w-8 h-8 border-r-2 border-t-2 border-cyber-500" />
        <div className="absolute -bottom-2 -left-2 w-8 h-8 border-l-2 border-b-2 border-cyber-500" />
        <div className="absolute -bottom-2 -right-2 w-8 h-8 border-r-2 border-b-2 border-cyber-500" />

        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg shadow-panel overflow-hidden">
          {/* Header stripe */}
          <div className="h-1 bg-gradient-to-r from-cyber-600 via-cyber-400 to-cyber-600" />

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
                Server Operations Center
              </p>
            </div>

            {/* Mode toggle */}
            <div className="flex mb-6 p-1 bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className={`flex-1 py-2 text-sm font-display font-semibold uppercase tracking-wide rounded transition-all duration-200 ${
                  !isRegister
                    ? 'bg-cyber-600 text-white shadow-glow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className={`flex-1 py-2 text-sm font-display font-semibold uppercase tracking-wide rounded transition-all duration-200 ${
                  isRegister
                    ? 'bg-cyber-600 text-white shadow-glow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 animate-slide-up">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input"
                  placeholder="operator@server.net"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input"
                  placeholder="Enter secure password"
                  required
                  minLength={8}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary py-3 mt-2 relative overflow-hidden group"
              >
                <span className={`transition-opacity ${loading ? 'opacity-0' : 'opacity-100'}`}>
                  {isRegister ? 'Create Account' : 'Access System'}
                </span>
                {loading && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex gap-1">
                      <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </span>
                )}
                {/* Hover shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-slate-800 text-center">
              <p className="text-slate-600 text-xs font-mono uppercase tracking-wider">
                {isRegister ? 'Already registered?' : 'New operator?'}{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-cyber-400 hover:text-cyber-300 transition-colors"
                >
                  {isRegister ? 'Access System' : 'Create Account'}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-center gap-2 mt-6 text-slate-600">
          <span className="w-2 h-2 rounded-full bg-cyber-500 animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-wider">System Online</span>
        </div>
      </div>
    </div>
  );
}
