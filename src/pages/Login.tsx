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
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await (isRegister ? authApi.register(email, password) : authApi.login(email, password));
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      navigate('/');
    } catch (err: any) { setError(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">ConfigTool</h1>
        {error && <div className="mb-4 p-3 bg-red-900/50 rounded text-red-200 text-sm">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full mb-4 px-3 py-2 bg-gray-700 rounded" required />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full mb-4 px-3 py-2 bg-gray-700 rounded" required minLength={8} />
          <button type="submit" disabled={loading} className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded">{loading ? '...' : isRegister ? 'Register' : 'Login'}</button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-400">{isRegister ? 'Have account?' : 'No account?'} <button onClick={() => setIsRegister(!isRegister)} className="text-blue-400">{isRegister ? 'Login' : 'Register'}</button></p>
      </div>
    </div>
  );
}
