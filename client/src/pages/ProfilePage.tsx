import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Plus, Pencil, Trash2, Star, X, Check } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { updateMe, addAddress, updateAddress, deleteAddress } from '../api/auth';
import type { Address } from '../types';

const profileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().regex(/^\d{10}$/, 'Enter 10-digit mobile number'),
});

const addressSchema = z.object({
  label: z.string().min(1, 'Label required (e.g. Home, Office)'),
  line1: z.string().min(3, 'Address line required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City required'),
  state: z.string().min(1, 'State required'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter 6-digit pincode'),
  isDefault: z.boolean(),
});

type ProfileForm = z.infer<typeof profileSchema>;
type AddressForm = z.infer<typeof addressSchema>;

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
  'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu',
  'Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry',
];

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [addressForm, setAddressForm] = useState<'add' | string | null>(null); // 'add' | addressId | null
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', phone: user?.phone ?? '' },
  });

  const addrForm = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: { label: '', line1: '', line2: '', city: '', state: 'Maharashtra', pincode: '', isDefault: false },
  });

  const onProfileSave = async (data: ProfileForm) => {
    const { user: updated } = await updateMe(data);
    setUser(updated);
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const openAdd = () => {
    addrForm.reset({ label: '', line1: '', line2: '', city: 'Mumbai', state: 'Maharashtra', pincode: '', isDefault: user?.addresses.length === 0 });
    setAddressForm('add');
  };

  const openEdit = (addr: Address) => {
    addrForm.reset({
      label: addr.label,
      line1: addr.line1,
      line2: addr.line2 ?? '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault,
    });
    setAddressForm(addr._id!);
  };

  const onAddressSave = async (data: AddressForm) => {
    let result;
    if (addressForm === 'add') {
      result = await addAddress(data);
    } else {
      result = await updateAddress(addressForm!, data);
    }
    setUser(result.user);
    setAddressForm(null);
  };

  const onDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const result = await deleteAddress(id);
      setUser(result.user);
    } finally {
      setDeletingId(null);
    }
  };

  const onSetDefault = async (addr: Address) => {
    if (addr.isDefault) return;
    const result = await updateAddress(addr._id!, { isDefault: true });
    setUser(result.user);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10 space-y-8">
      <h1 className="text-2xl font-bold text-[#1A0808]">My Profile</h1>

      {/* Profile form */}
      <form onSubmit={profileForm.handleSubmit(onProfileSave)} className="bg-white rounded-2xl border border-red-100 p-6 space-y-5">
        <h2 className="font-semibold text-[#1A0808]">Personal Details</h2>

        {profileSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <Check size={14} /> Profile updated
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#5C1818] mb-1.5">Full Name</label>
          <input {...profileForm.register('name')} className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230]/30 focus:border-[#C41230]" />
          {profileForm.formState.errors.name && <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#5C1818] mb-1.5">Mobile Number</label>
          <div className="flex">
            <span className="px-3 py-2.5 bg-stone-50 border border-r-0 border-stone-200 rounded-l-xl text-sm text-stone-500">+91</span>
            <input {...profileForm.register('phone')} className="flex-1 px-4 py-2.5 border border-stone-200 rounded-r-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230]/30 focus:border-[#C41230]" />
          </div>
          {profileForm.formState.errors.phone && <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#5C1818] mb-1.5">Email</label>
          <input value={user?.email ?? ''} disabled className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm bg-stone-50 text-stone-400" />
        </div>

        <button
          type="submit"
          disabled={profileForm.formState.isSubmitting}
          className="w-full py-3 text-white font-semibold rounded-xl transition disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #C41230, #9B0E25)' }}
        >
          {profileForm.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* Addresses section */}
      <div className="bg-white rounded-2xl border border-red-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[#1A0808] flex items-center gap-2">
            <MapPin size={16} className="text-[#C41230]" /> Delivery Addresses
          </h2>
          {addressForm === null && (
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 text-sm font-medium text-[#C41230] hover:text-[#9B0E25] transition"
            >
              <Plus size={15} /> Add New
            </button>
          )}
        </div>

        {/* Address add/edit form */}
        {addressForm !== null && (
          <form onSubmit={addrForm.handleSubmit(onAddressSave)} className="border border-red-100 rounded-xl p-4 space-y-3 bg-red-50/30">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-[#1A0808]">{addressForm === 'add' ? 'Add New Address' : 'Edit Address'}</p>
              <button type="button" onClick={() => setAddressForm(null)} className="text-stone-400 hover:text-stone-600">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[#5C1818] mb-1">Label <span className="text-stone-400">(e.g. Home, Office)</span></label>
                <input {...addrForm.register('label')} placeholder="Home" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230]/30 focus:border-[#C41230] bg-white" />
                {addrForm.formState.errors.label && <p className="text-red-500 text-xs mt-0.5">{addrForm.formState.errors.label.message}</p>}
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-[#5C1818] mb-1">Address Line 1</label>
                <input {...addrForm.register('line1')} placeholder="Flat/House no., Building, Street" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230]/30 focus:border-[#C41230] bg-white" />
                {addrForm.formState.errors.line1 && <p className="text-red-500 text-xs mt-0.5">{addrForm.formState.errors.line1.message}</p>}
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-[#5C1818] mb-1">Address Line 2 <span className="text-stone-400">(optional)</span></label>
                <input {...addrForm.register('line2')} placeholder="Landmark, Area" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230]/30 focus:border-[#C41230] bg-white" />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5C1818] mb-1">City</label>
                <input {...addrForm.register('city')} placeholder="Mumbai" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230]/30 focus:border-[#C41230] bg-white" />
                {addrForm.formState.errors.city && <p className="text-red-500 text-xs mt-0.5">{addrForm.formState.errors.city.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5C1818] mb-1">Pincode</label>
                <input {...addrForm.register('pincode')} placeholder="400104" maxLength={6} className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230]/30 focus:border-[#C41230] bg-white" />
                {addrForm.formState.errors.pincode && <p className="text-red-500 text-xs mt-0.5">{addrForm.formState.errors.pincode.message}</p>}
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-[#5C1818] mb-1">State</label>
                <select {...addrForm.register('state')} className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230]/30 focus:border-[#C41230] bg-white">
                  {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div className="col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...addrForm.register('isDefault')} className="accent-[#C41230] w-4 h-4" />
                  <span className="text-sm text-[#5C1818]">Set as default address</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={addrForm.formState.isSubmitting}
                className="flex-1 py-2.5 text-white text-sm font-semibold rounded-xl disabled:opacity-60 transition"
                style={{ background: 'linear-gradient(135deg, #C41230, #9B0E25)' }}
              >
                {addrForm.formState.isSubmitting ? 'Saving...' : 'Save Address'}
              </button>
              <button type="button" onClick={() => setAddressForm(null)} className="px-4 py-2.5 border border-stone-200 text-stone-600 text-sm font-medium rounded-xl hover:bg-stone-50 transition">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Address list */}
        {user?.addresses.length === 0 && addressForm === null && (
          <div className="text-center py-6 text-[#5C1818]/50 text-sm">
            No addresses yet. Add one to start ordering.
          </div>
        )}

        <div className="space-y-3">
          {user?.addresses.map((addr) => (
            <div
              key={addr._id}
              className={`rounded-xl border-2 p-4 transition-all ${addr.isDefault ? 'border-[#C41230] bg-red-50/40' : 'border-stone-100'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-[#1A0808]">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="flex items-center gap-0.5 text-xs font-medium text-[#C41230] bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
                        <Star size={10} fill="currentColor" /> Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#5C1818]">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                  <p className="text-sm text-[#5C1818]">{addr.city}, {addr.state} — {addr.pincode}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!addr.isDefault && (
                    <button
                      onClick={() => onSetDefault(addr)}
                      className="p-1.5 text-stone-400 hover:text-[#C41230] transition"
                      title="Set as default"
                    >
                      <Star size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(addr)}
                    className="p-1.5 text-stone-400 hover:text-[#C41230] transition"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => onDelete(addr._id!)}
                    disabled={deletingId === addr._id}
                    className="p-1.5 text-stone-400 hover:text-red-600 transition disabled:opacity-40"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
