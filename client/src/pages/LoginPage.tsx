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
    <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px]">

        {/* Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-gradient-to-br from-[#C0392B] to-[#E8891A] rounded-2xl flex items-center justify-center text-3xl shadow-lg">
              🍬
            </div>
            <div className="font-bold text-[#2C1810] text-xl">Vyas Sweets</div>
          </Link>
          <h1 className="text-2xl font-bold text-[#2C1810] mt-5">Welcome back!</h1>
          <p className="text-stone-500 mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-7 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
              <span className="text-red-500">⚠</span> {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[#2C1810] mb-2">Email address</label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className="input-field"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2C1810] mb-2">Password</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                className="input-field pr-11"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
          </div>

          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-[#C0392B] to-[#E8891A] text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-60 active:scale-[0.98]"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in →'}
          </button>

          <p className="text-center text-sm text-stone-500">
            New to Vyas Sweets?{' '}
            <Link to="/register" className="text-[#C0392B] font-semibold hover:underline">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
