import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { register as registerApi } from '../api/auth';
import { useAuthStore } from '../store/auth';
import { Eye, EyeOff } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Name too short'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^\d{10}$/, '10-digit mobile number'),
  password: z.string().min(6, 'Minimum 6 characters'),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
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
      const { user } = await registerApi(data);
      setUser(user);
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setError(msg || 'Registration failed. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px]">

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-gradient-to-br from-[#C0392B] to-[#E8891A] rounded-2xl flex items-center justify-center text-3xl shadow-lg">
              🍬
            </div>
            <div className="font-bold text-[#2C1810] text-xl">Vyas Sweets</div>
          </Link>
          <h1 className="text-2xl font-bold text-[#2C1810] mt-5">Create your account</h1>
          <p className="text-stone-500 mt-1">Join thousands of sweet lovers!</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-7 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              ⚠ {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[#2C1810] mb-2">Full Name</label>
            <input {...register('name')} placeholder="Ritesh Vyas" className="input-field" />
            {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2C1810] mb-2">Email address</label>
            <input {...register('email')} type="email" placeholder="you@example.com" className="input-field" />
            {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2C1810] mb-2">Mobile Number</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-stone-400 font-medium">+91</span>
              <input {...register('phone')} type="tel" placeholder="9876543210" className="input-field pl-12" />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1.5">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2C1810] mb-2">Password</label>
            <div className="relative">
              <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="••••••••" className="input-field pr-11" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
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
            {isSubmitting ? 'Creating account...' : 'Create account →'}
          </button>

          <p className="text-center text-sm text-stone-500 pt-1">
            Already have an account?{' '}
            <Link to="/login" className="text-[#C0392B] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
