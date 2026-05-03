import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, Plus, X, Save, Package } from 'lucide-react';
import api from '../../api/client';
import type { Category } from '../../types';
import Spinner from '../../components/Spinner';

const schema = z.object({
  name: z.string().min(1, 'Product name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  subcategoryId: z.string().optional().nullable(),
  description: z.string().default(''),
  shortDescription: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  price: z.coerce.number().int().positive('Price required (in paise)'),
  mrp: z.coerce.number().int().positive('MRP required (in paise)'),
  weight: z.coerce.number().positive('Weight required'),
  unit: z.enum(['g', 'kg', 'pcs']),
  stock: z.coerce.number().int().min(0).default(0),
  tags: z.string().optional(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  discountActive: z.boolean().default(false),
  discountType: z.enum(['flat', 'percent']).default('percent'),
  discountValue: z.coerce.number().min(0).default(0),
});

type FormData = z.infer<typeof schema>;

export default function ProductFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, watch, control, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { unit: 'g', active: true, featured: false, discountType: 'percent', discountActive: false },
  });

  const selectedCategoryId = watch('categoryId');

  // Load categories
  useEffect(() => {
    api.get<Category[]>('/admin/categories').then((r) => {
      const all = r.data;
      setCategories(all.filter((c) => !c.parentId));
    });
  }, []);

  // Load subcategories when parent category changes
  useEffect(() => {
    if (!selectedCategoryId) { setSubcategories([]); return; }
    api.get<Category[]>('/admin/categories').then((r) => {
      const subs = r.data.filter((c) => {
        const pid = typeof c.parentId === 'object' && c.parentId !== null
          ? (c.parentId as unknown as { _id: string })._id
          : c.parentId;
        return pid === selectedCategoryId;
      });
      setSubcategories(subs);
      if (subs.length === 0) setValue('subcategoryId', null);
    });
  }, [selectedCategoryId, setValue]);

  // Load product for edit
  useEffect(() => {
    if (!isEdit || !id) return;
    api.get(`/admin/products/${id}`).then((r) => {
      const p = r.data as {
        name: string; categoryId: { _id: string } | string; subcategoryId?: string | null;
        description: string; shortDescription?: string; sku: string;
        price: number; mrp: number; weight: number; unit: 'g' | 'kg' | 'pcs';
        stock: number; tags: string[]; featured: boolean; active: boolean;
        images: string[];
        discount?: { type: 'flat' | 'percent'; value: number; active: boolean };
      };
      reset({
        name: p.name,
        categoryId: typeof p.categoryId === 'object' ? p.categoryId._id : p.categoryId,
        subcategoryId: p.subcategoryId ?? null,
        description: p.description,
        shortDescription: p.shortDescription,
        sku: p.sku,
        price: p.price,
        mrp: p.mrp,
        weight: p.weight,
        unit: p.unit,
        stock: p.stock,
        tags: p.tags?.join(', '),
        featured: p.featured,
        active: p.active,
        discountActive: p.discount?.active ?? false,
        discountType: p.discount?.type ?? 'percent',
        discountValue: p.discount?.value ?? 0,
      });
      setImages(p.images ?? []);
    }).finally(() => setLoading(false));
  }, [id, isEdit, reset]);

  const onSubmit = async (data: FormData) => {
    setError('');
    setSaving(true);
    try {
      const payload = {
        name: data.name,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId || undefined,
        description: data.description,
        shortDescription: data.shortDescription,
        sku: data.sku,
        price: data.price,
        mrp: data.mrp,
        weight: data.weight,
        unit: data.unit,
        stock: data.stock,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        images,
        featured: data.featured,
        active: data.active,
        discount: data.discountActive ? {
          type: data.discountType,
          value: data.discountValue,
          active: true,
        } : undefined,
      };

      if (isEdit) {
        await api.patch(`/admin/products/${id}`, payload);
      } else {
        await api.post('/admin/products', payload);
      }
      navigate('/admin/products');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setError(msg ?? 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const addImage = () => {
    const url = imageInput.trim();
    if (url && !images.includes(url) && images.length < 5) {
      setImages([...images, url]);
      setImageInput('');
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner className="w-10 h-10" /></div>;

  return (
    <div className="p-5 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link to="/admin/products" className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-stone-500">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#2C1810]">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-sm text-stone-400 mt-0.5">
            {isEdit ? 'Update product details' : 'Fill in the details to add a new product'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
          ⚠ {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main info */}
          <div className="lg:col-span-2 space-y-5">

            {/* Basic Info */}
            <div className="bg-white rounded-2xl border border-orange-100 p-6">
              <h2 className="font-bold text-[#2C1810] mb-5 flex items-center gap-2">
                <Package size={17} className="text-[#E8891A]" /> Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Product Name <span className="text-red-500">*</span></label>
                  <input {...register('name')} placeholder="e.g. Kaju Katli 250g" className="input-field" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                    <select {...register('categoryId')} className="input-field">
                      <option value="">-- Select Category --</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                    {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                      Sub-Category
                      {subcategories.length === 0 && selectedCategoryId && (
                        <span className="ml-1 text-xs text-stone-400 font-normal">(none added yet)</span>
                      )}
                    </label>
                    <select {...register('subcategoryId')} className="input-field" disabled={subcategories.length === 0}>
                      <option value="">-- None --</option>
                      {subcategories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Short Description</label>
                  <input {...register('shortDescription')} placeholder="One line description for listings" className="input-field" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Full Description</label>
                  <textarea {...register('description')} rows={3} placeholder="Detailed product description..." className="input-field resize-none" />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-2xl border border-orange-100 p-6">
              <h2 className="font-bold text-[#2C1810] mb-5 flex items-center gap-2">
                <span className="text-[#E8891A]">₹</span> Pricing & Stock
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                    Selling Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-medium">₹</span>
                    <input
                      {...register('price', { setValueAs: (v) => v ? Math.round(parseFloat(v) * 100) : 0 })}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="input-field pl-8"
                    />
                  </div>
                  <p className="text-xs text-stone-400 mt-1">Stored internally in paise</p>
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                    MRP / Original Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-medium">₹</span>
                    <input
                      {...register('mrp', { setValueAs: (v) => v ? Math.round(parseFloat(v) * 100) : 0 })}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="input-field pl-8"
                    />
                  </div>
                  {errors.mrp && <p className="text-red-500 text-xs mt-1">{errors.mrp.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Stock Quantity <span className="text-red-500">*</span></label>
                  <input {...register('stock')} type="number" min="0" placeholder="0" className="input-field" />
                  {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">SKU / Item Code <span className="text-red-500">*</span></label>
                  <input {...register('sku')} placeholder="e.g. KK-250-001" className="input-field" />
                  {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Weight / Quantity <span className="text-red-500">*</span></label>
                  <input {...register('weight')} type="number" step="0.1" placeholder="250" className="input-field" />
                  {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Unit <span className="text-red-500">*</span></label>
                  <select {...register('unit')} className="input-field">
                    <option value="g">Grams (g)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="pcs">Pieces (pcs)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Discount */}
            <div className="bg-white rounded-2xl border border-orange-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#2C1810]">Discount</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Controller
                    name="discountActive"
                    control={control}
                    render={({ field }) => (
                      <div
                        onClick={() => field.onChange(!field.value)}
                        className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative ${field.value ? 'bg-green-500' : 'bg-stone-200'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${field.value ? 'left-5' : 'left-0.5'}`} />
                      </div>
                    )}
                  />
                  <span className="text-sm font-medium text-stone-600">Enable discount</span>
                </label>
              </div>

              {watch('discountActive') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Discount Type</label>
                    <select {...register('discountType')} className="input-field">
                      <option value="percent">Percentage (%)</option>
                      <option value="flat">Flat Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                      Value ({watch('discountType') === 'percent' ? '%' : '₹'})
                    </label>
                    <input {...register('discountValue')} type="number" step="0.01" min="0" placeholder="10" className="input-field" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* Status */}
            <div className="bg-white rounded-2xl border border-orange-100 p-5">
              <h3 className="font-bold text-[#2C1810] mb-4">Status & Visibility</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-stone-700">Active (visible in store)</span>
                  <Controller
                    name="active"
                    control={control}
                    render={({ field }) => (
                      <div onClick={() => field.onChange(!field.value)} className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative ${field.value ? 'bg-green-500' : 'bg-stone-200'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${field.value ? 'left-5' : 'left-0.5'}`} />
                      </div>
                    )}
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-stone-700">Featured product</span>
                  <Controller
                    name="featured"
                    control={control}
                    render={({ field }) => (
                      <div onClick={() => field.onChange(!field.value)} className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative ${field.value ? 'bg-[#E8891A]' : 'bg-stone-200'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${field.value ? 'left-5' : 'left-0.5'}`} />
                      </div>
                    )}
                  />
                </label>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-2xl border border-orange-100 p-5">
              <h3 className="font-bold text-[#2C1810] mb-1">Product Images</h3>
              <p className="text-xs text-stone-400 mb-4">Add image URLs (up to 5)</p>

              <div className="grid grid-cols-2 gap-2 mb-3">
                {images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} alt="" className="w-full h-20 object-cover rounded-xl border border-orange-100" />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                    {i === 0 && <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">Main</span>}
                  </div>
                ))}
                {images.length < 5 && (
                  <div className="h-20 border-2 border-dashed border-orange-200 rounded-xl flex items-center justify-center text-orange-200">
                    <Plus size={20} />
                  </div>
                )}
              </div>

              {images.length < 5 && (
                <div className="flex gap-2">
                  <input
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                    placeholder="Paste image URL..."
                    className="flex-1 px-3 py-2 border border-orange-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#E8891A]/30"
                  />
                  <button type="button" onClick={addImage} className="px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
                    <Plus size={14} className="text-[#E8891A]" />
                  </button>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl border border-orange-100 p-5">
              <h3 className="font-bold text-[#2C1810] mb-1">Tags</h3>
              <p className="text-xs text-stone-400 mb-3">Comma-separated tags for search</p>
              <input
                {...register('tags')}
                placeholder="mithai, gift, festive, diwali"
                className="input-field text-sm"
              />
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex items-center gap-3 pt-2 pb-8">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#C0392B] to-[#E8891A] text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-60"
          >
            <Save size={17} />
            {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
          </button>
          <Link
            to="/admin/products"
            className="px-6 py-3.5 border-2 border-stone-200 text-stone-600 font-semibold rounded-xl hover:bg-stone-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
