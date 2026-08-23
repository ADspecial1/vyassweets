import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Ticket } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../api/client';
import { formatINR } from '../../lib/format';
import Spinner from '../../components/Spinner';

interface Coupon {
  _id: string;
  code: string;
  type: 'flat' | 'percent';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: string;
  validTill: string;
  active: boolean;
}

const schema = z.object({
  code: z.string().min(1, 'Required').max(30),
  type: z.enum(['flat', 'percent']),
  value: z.number().positive('Required'),
  minOrderAmount: z.number().int().nonnegative(),
  maxDiscount: z.number().int().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  validFrom: z.string().min(1, 'Required'),
  validTill: z.string().min(1, 'Required'),
  active: z.boolean(),
});
type FormData = z.infer<typeof schema>;

function toDateInput(iso?: string): string {
  return iso ? iso.slice(0, 10) : '';
}

function CouponModal({ coupon, onClose, onSaved }: {
  coupon: Coupon | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [error, setError] = useState('');
  const { register, handleSubmit, control, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: coupon ? {
      code: coupon.code,
      type: coupon.type,
      value: coupon.type === 'flat' ? coupon.value / 100 : coupon.value,
      minOrderAmount: coupon.minOrderAmount / 100,
      maxDiscount: coupon.maxDiscount ? coupon.maxDiscount / 100 : undefined,
      usageLimit: coupon.usageLimit,
      validFrom: toDateInput(coupon.validFrom),
      validTill: toDateInput(coupon.validTill),
      active: coupon.active,
    } : {
      code: '', type: 'percent', value: 10, minOrderAmount: 0,
      validFrom: toDateInput(new Date().toISOString()),
      validTill: '', active: true,
    },
  });

  const type = watch('type');

  const onSubmit = async (data: FormData) => {
    setError('');
    const payload = {
      code: data.code.toUpperCase(),
      type: data.type,
      value: data.type === 'flat' ? Math.round(data.value * 100) : data.value,
      minOrderAmount: Math.round(data.minOrderAmount * 100),
      maxDiscount: data.maxDiscount ? Math.round(data.maxDiscount * 100) : undefined,
      usageLimit: data.usageLimit || undefined,
      validFrom: new Date(data.validFrom).toISOString(),
      validTill: new Date(data.validTill).toISOString(),
      active: data.active,
    };
    try {
      if (coupon) {
        await api.patch(`/admin/coupons/${coupon._id}`, payload);
      } else {
        await api.post('/admin/coupons', payload);
      }
      onSaved();
      onClose();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? 'Failed to save coupon';
      setError(msg);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#C41230] to-[#9B0E25] px-6 py-4">
          <h2 className="font-bold text-white text-lg">{coupon ? 'Edit Coupon' : 'New Coupon'}</h2>
          <p className="text-white/70 text-sm mt-0.5">e.g. 15% off on orders above ₹599</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && <div className="px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{error}</div>}

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">Coupon Code <span className="text-red-500">*</span></label>
            <input {...register('code')} placeholder="e.g. SWEET15" className="input-field uppercase" />
            {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Discount Type</label>
              <select {...register('type')} className="input-field">
                <option value="percent">Percent off</option>
                <option value="flat">Flat amount off</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                Value {type === 'percent' ? '(%)' : '(₹)'}
              </label>
              <input {...register('value', { valueAsNumber: true })} type="number" step="0.01" min="0" className="input-field" />
              {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Min Order Amount (₹)</label>
              <input {...register('minOrderAmount', { valueAsNumber: true })} type="number" min="0" className="input-field" />
            </div>
            {type === 'percent' && (
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Max Discount (₹) <span className="text-stone-400 font-normal">optional</span></label>
                <input {...register('maxDiscount', { valueAsNumber: true, setValueAs: (v) => v === '' || v === undefined ? undefined : Number(v) })} type="number" min="0" placeholder="No cap" className="input-field" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Valid From</label>
              <input {...register('validFrom')} type="date" className="input-field" />
              {errors.validFrom && <p className="text-red-500 text-xs mt-1">{errors.validFrom.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Valid Till</label>
              <input {...register('validTill')} type="date" className="input-field" />
              {errors.validTill && <p className="text-red-500 text-xs mt-1">{errors.validTill.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">Usage Limit <span className="text-stone-400 font-normal">optional</span></label>
            <input {...register('usageLimit', { setValueAs: (v) => v === '' || v === undefined ? undefined : Number(v) })} type="number" min="1" placeholder="Unlimited" className="input-field" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <div onClick={() => field.onChange(!field.value)} className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative ${field.value ? 'bg-green-500' : 'bg-stone-200'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${field.value ? 'left-5' : 'left-0.5'}`} />
                </div>
              )}
            />
            <span className="text-sm font-medium text-stone-700">Active (visible to customers)</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-stone-200 rounded-xl text-sm font-semibold text-stone-600 hover:bg-stone-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-gradient-to-r from-[#C41230] to-[#9B0E25] text-white rounded-xl text-sm font-bold hover:shadow-md transition-all disabled:opacity-60">
              {isSubmitting ? 'Saving...' : coupon ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function describeCoupon(c: Coupon): string {
  const amount = c.type === 'flat' ? formatINR(c.value) : `${c.value}%`;
  const min = c.minOrderAmount > 0 ? ` above ${formatINR(c.minOrderAmount)}` : '';
  const cap = c.type === 'percent' && c.maxDiscount ? ` (max ${formatINR(c.maxDiscount)})` : '';
  return `${amount} off${min}${cap}`;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; coupon: Coupon | null }>({ open: false, coupon: null });

  const fetchCoupons = () => {
    api.get<Coupon[]>('/admin/coupons').then((r) => setCoupons(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCoupons(); }, []);

  const del = async (id: string) => {
    if (!confirm('Delete this coupon? This cannot be undone.')) return;
    await api.delete(`/admin/coupons/${id}`);
    fetchCoupons();
  };

  const toggleActive = async (c: Coupon) => {
    await api.patch(`/admin/coupons/${c._id}`, { active: !c.active });
    fetchCoupons();
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner className="w-10 h-10" /></div>;

  return (
    <div className="p-5 md:p-8">
      {modal.open && (
        <CouponModal coupon={modal.coupon} onClose={() => setModal({ open: false, coupon: null })} onSaved={fetchCoupons} />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A0808]">Coupons</h1>
          <p className="text-sm text-stone-400 mt-0.5">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setModal({ open: true, coupon: null })}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#C41230] to-[#9B0E25] text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all"
        >
          <Plus size={16} /> Add Coupon
        </button>
      </div>

      {coupons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-red-100 text-center py-20">
          <Ticket size={40} className="text-stone-200 mx-auto mb-3" />
          <p className="text-stone-400 font-medium">No coupons yet</p>
          <button onClick={() => setModal({ open: true, coupon: null })} className="mt-4 inline-flex items-center gap-1.5 text-sm text-[#C41230] font-semibold hover:underline">
            <Plus size={14} /> Add your first coupon
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-red-100 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr className="text-left text-stone-500 text-xs uppercase tracking-wide">
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Offer</th>
                <th className="px-5 py-3">Validity</th>
                <th className="px-5 py-3">Usage</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id} className="border-t border-stone-50 hover:bg-red-50/20 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-[#1A0808]">{c.code}</td>
                  <td className="px-5 py-3.5 text-stone-600">{describeCoupon(c)}</td>
                  <td className="px-5 py-3.5 text-stone-500 text-xs">
                    {new Date(c.validFrom).toLocaleDateString('en-IN')} – {new Date(c.validTill).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-5 py-3.5 text-stone-500 text-xs">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => toggleActive(c)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${c.active ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'}`}
                    >
                      {c.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setModal({ open: true, coupon: c })} className="p-2 hover:bg-red-50 rounded-lg text-stone-400 hover:text-[#C41230] transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => del(c._id)} className="p-2 hover:bg-red-50 rounded-lg text-stone-400 hover:text-red-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
