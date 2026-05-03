import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { login } from '../../api/auth';
import { useAuthStore } from '../../store/auth';

const STATIC_HINT_EMAIL = 'admin@sweetsapp.com';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState(STATIC_HINT_EMAIL);
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await login({ email, password });
      if (user.role !== 'admin') {
        setError('This account does not have admin access.');
        return;
      }
      setUser(user);
      navigate('/admin');
    } catch {
      setError('Invalid credentials. Check email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A0F0A] flex items-center justify-center px-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none select-none overflow-hidden">
        {'🍬'.repeat(200).split('').map((c, i) => (
          <span key={i} className="text-2xl absolute" style={{ left: `${(i * 137.5) % 100}%`, top: `${(i * 61.8) % 100}%` }}>{c}</span>
        ))}
      </div>

      <div className="w-full max-w-[400px] relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#C0392B] to-[#E8891A] rounded-2xl text-3xl shadow-2xl mb-4">
            🍬
          </div>
          <h1 className="text-white text-2xl font-bold">Vyas Sweets</h1>
          <p className="text-stone-400 text-sm mt-1">Admin Panel</p>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 bg-[#C0392B]/20 rounded-xl flex items-center justify-center">
              <ShieldCheck size={18} className="text-[#E8891A]" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Admin Access</p>
              <p className="text-stone-500 text-xs">Restricted to administrators only</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          {/* Credentials hint box */}
          <div className="bg-[#E8891A]/10 border border-[#E8891A]/30 rounded-xl px-4 py-3 mb-5">
            <p className="text-[#E8891A] text-xs font-semibold mb-1.5 flex items-center gap-1.5">
              <Lock size={11} /> Default credentials
            </p>
            <p className="text-stone-300 text-xs">Email: <span className="font-mono text-white">{STATIC_HINT_EMAIL}</span></p>
            <p className="text-stone-300 text-xs mt-0.5">Password: <span className="font-mono text-white">Admin@12345</span></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-stone-300 text-xs font-semibold mb-2 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-[#E8891A]/40 focus:border-[#E8891A]/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-stone-300 text-xs font-semibold mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-[#E8891A]/40 focus:border-[#E8891A]/50 transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#C0392B] to-[#E8891A] text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-[#C0392B]/30 transition-all disabled:opacity-60 active:scale-[0.98] mt-2"
            >
              {loading ? 'Signing in...' : 'Access Admin Panel →'}
            </button>
          </form>
        </div>

        <p className="text-center text-stone-600 text-xs mt-6">
          Not an admin?{' '}
          <a href="/" className="text-stone-400 hover:text-white transition-colors">Go to store →</a>
        </p>
      </div>
    </div>
  );
}
