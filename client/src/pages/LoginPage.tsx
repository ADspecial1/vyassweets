import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { login } from '../api/auth';
import { useAuthStore } from '../store/auth';
import { Eye, EyeOff } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError('');
      const { user } = await login(data);
      setUser(user);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setError(msg || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF4E9] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px]">

        {/* Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            {/* Oval VYAS logo */}
            <svg viewBox="0 0 120 78" width="96" height="62" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="lg-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   stopColor="#F0CE6A" />
                  <stop offset="50%"  stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#B8962A" />
                </linearGradient>
              </defs>
              <ellipse cx="60" cy="39" rx="58" ry="37" fill="#C41230" />
              <ellipse cx="60" cy="39" rx="58" ry="37" fill="none" stroke="url(#lg-gold)" strokeWidth="3.5" />
              <text x="60" y="22" textAnchor="middle" fill="#F0CE6A" fontFamily="Fraunces, Georgia, serif" fontSize="9" fontStyle="italic" letterSpacing="0.8">Since 1951</text>
              <text x="60" y="52" textAnchor="middle" fill="white" fontFamily="Fraunces, Georgia, serif" fontSize="30" fontWeight="900" letterSpacing="4">VYAS</text>
              <text x="102" y="29" textAnchor="middle" fill="#F0CE6A" fontFamily="Arial, sans-serif" fontSize="9">®</text>
            </svg>
            <div className="font-bold text-[#1A0808] text-xl" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
              Vyas Sweets
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-[#1A0808] mt-5">Welcome back!</h1>
          <p className="text-[#5C1818] mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-red-100 p-7 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
              <span className="text-red-500">⚠</span> {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[#1A0808] mb-2">Email address</label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className="input-field"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A0808] mb-2">Password</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                className="input-field pr-11"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5C1818]/50 hover:text-[#5C1818] transition-colors">
                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
          </div>

          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="w-full py-3.5 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-60 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #C41230, #9B0E25)' }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in →'}
          </button>

          <p className="text-center text-sm text-[#5C1818]">
            New to Vyas Sweets?{' '}
            <Link to="/register" className="text-[#C41230] font-semibold hover:underline">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
