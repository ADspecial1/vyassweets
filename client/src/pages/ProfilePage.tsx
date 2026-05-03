import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/auth';
import { updateMe } from '../api/auth';

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().regex(/^\d{10}$/),
});
type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? '', phone: user?.phone ?? '' },
  });

  const onSubmit = async (data: FormData) => {
    const { user: updated } = await updateMe(data);
    setUser(updated);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-stone-900 mb-8">My Profile</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-stone-100 p-6 space-y-5">
        {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">Profile updated!</div>}

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Full Name</label>
          <input {...register('name')} className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C0392B]/30 focus:border-[#C0392B]" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Mobile Number</label>
          <input {...register('phone')} className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C0392B]/30 focus:border-[#C0392B]" />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
          <input value={user?.email ?? ''} disabled className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm bg-stone-50 text-stone-400" />
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-[#C0392B] text-white font-semibold rounded-xl hover:bg-[#a93226] transition-colors disabled:opacity-60">
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
