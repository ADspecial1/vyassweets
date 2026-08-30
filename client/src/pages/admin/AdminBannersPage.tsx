import { useEffect, useRef, useState } from 'react';
import {
  Plus, Pencil, Trash2, Image as ImageIcon, Upload,
  ArrowUp, ArrowDown, Eye, EyeOff, ArrowRight, X, Film,
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../api/client';
import type { Banner } from '../../types';
import Spinner from '../../components/Spinner';

const SERVER_BASE = (import.meta.env.VITE_API_BASE as string).replace(/\/api$/, '');

const schema = z
  .object({
    mediaType: z.enum(['image', 'video']),
    image: z.string().optional(),
    videoUrl: z.string().optional(),
    posterUrl: z.string().optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    ctaText: z.string().optional(),
    ctaLink: z.string().optional(),
    displayOrder: z.number(),
    active: z.boolean(),
  })
  .refine((d) => (d.mediaType === 'video' ? !!d.videoUrl : !!d.image), {
    message: 'An image banner needs an image; a video banner needs a video',
    path: ['image'],
  });
type FormData = z.infer<typeof schema>;

/* ── Storefront-accurate preview: mirrors BannerCarousel on HomePage ── */
function BannerPreview({ mediaType, image, videoUrl, posterUrl, title, subtitle, ctaText }: Partial<Banner>) {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-stone-100" style={{ aspectRatio: '16 / 6' }}>
      {mediaType === 'video' && videoUrl ? (
        <video
          src={videoUrl}
          poster={posterUrl || undefined}
          className="w-full h-full object-cover"
          muted
          autoPlay
          loop
          playsInline
        />
      ) : image ? (
        <img
          src={image}
          alt=""
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-stone-300">
          {mediaType === 'video' ? <Film size={32} /> : <ImageIcon size={32} />}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1A0808]/60 via-[#1A0808]/20 to-transparent flex items-center px-6 md:px-10">
        <div>
          {title && (
            <h3 className="text-white text-lg md:text-2xl font-black mb-1" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
              {title}
            </h3>
          )}
          {subtitle && <p className="text-white/85 text-xs md:text-sm mb-2.5">{subtitle}</p>}
          {ctaText && (
            <span
              className="inline-flex items-center gap-1.5 text-white text-xs font-black px-4 py-2 rounded-full"
              style={{ background: 'linear-gradient(135deg, #C41230, #9B0E25)' }}
            >
              {ctaText} <ArrowRight size={12} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function BannerModal({ banner, nextOrder, onClose, onSaved }: {
  banner: Banner | null;
  nextOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const posterRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<null | 'image' | 'videoUrl' | 'posterUrl'>(null);
  const [error, setError] = useState('');

  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: banner ? {
      mediaType: banner.mediaType ?? 'image',
      image: banner.image ?? '',
      videoUrl: banner.videoUrl ?? '',
      posterUrl: banner.posterUrl ?? '',
      title: banner.title ?? '',
      subtitle: banner.subtitle ?? '',
      ctaText: banner.ctaText ?? '',
      ctaLink: banner.ctaLink ?? '',
      displayOrder: banner.displayOrder,
      active: banner.active,
    } : { mediaType: 'image', image: '', videoUrl: '', posterUrl: '', title: '', subtitle: '', ctaText: '', ctaLink: '', displayOrder: nextOrder, active: true },
  });

  const values = watch();
  const mediaType = values.mediaType;

  const uploadTo = async (file: File, field: 'image' | 'videoUrl' | 'posterUrl') => {
    setUploading(field);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post<{ fileUrl: string; fullUrl: string }>('/admin/upload', formData);
      setValue(field, data.fullUrl ?? `${SERVER_BASE}${data.fileUrl}`, { shouldValidate: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setError(msg ?? 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const onSubmit = async (data: FormData) => {
    setError('');
    const payload = {
      mediaType: data.mediaType,
      image: data.image || undefined,
      videoUrl: data.mediaType === 'video' ? data.videoUrl || undefined : undefined,
      posterUrl: data.mediaType === 'video' ? data.posterUrl || undefined : undefined,
      title: data.title || undefined,
      subtitle: data.subtitle || undefined,
      ctaText: data.ctaText || undefined,
      ctaLink: data.ctaLink || undefined,
      displayOrder: data.displayOrder,
      active: data.active,
    };
    try {
      if (banner) await api.patch(`/admin/banners/${banner._id}`, payload);
      else await api.post('/admin/banners', payload);
      onSaved();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setError(msg ?? 'Failed to save banner');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        <div className="bg-gradient-to-r from-[#C41230] to-[#9B0E25] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-white text-lg">{banner ? 'Edit Banner' : 'New Banner'}</h2>
            <p className="text-white/70 text-sm mt-0.5">Shows in the homepage hero carousel</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Live preview */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">Live preview</label>
            <BannerPreview mediaType={mediaType} image={values.image} videoUrl={values.videoUrl} posterUrl={values.posterUrl} title={values.title} subtitle={values.subtitle} ctaText={values.ctaText} />
          </div>

          {/* Media type toggle */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">Media type</label>
            <Controller
              name="mediaType"
              control={control}
              render={({ field }) => (
                <div className="inline-flex bg-stone-100 rounded-xl p-1">
                  {(['image', 'video'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => field.onChange(t)}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                        field.value === t ? 'bg-white text-[#C41230] shadow-sm' : 'text-stone-500 hover:text-stone-700'
                      }`}
                    >
                      {t === 'image' ? <ImageIcon size={14} /> : <Film size={14} />}
                      {t === 'image' ? 'Image' : 'Video'}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          {/* Image banner */}
          {mediaType === 'image' && (
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                Banner Image <span className="text-red-500">*</span>
              </label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadTo(file, 'image');
                  e.target.value = '';
                }}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={uploading === 'image'}
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm font-semibold text-[#C41230] hover:bg-red-100 transition-colors disabled:opacity-60"
                >
                  {uploading === 'image' ? <Spinner className="w-4 h-4" /> : <Upload size={15} />}
                  {uploading === 'image' ? 'Uploading…' : 'Upload image'}
                </button>
                <input
                  {...register('image')}
                  placeholder="…or paste an image URL"
                  className="flex-1 px-3 py-2.5 border border-red-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230]/20 focus:border-[#C41230]"
                />
              </div>
              <p className="text-xs text-stone-400 mt-1">Wide landscape image works best (≈ 1600×600). JPEG, PNG, or WebP.</p>
            </div>
          )}

          {/* Video banner */}
          {mediaType === 'video' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                  Banner Video <span className="text-red-500">*</span>
                </label>
                <input
                  ref={videoRef}
                  type="file"
                  accept="video/mp4,video/webm"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadTo(file, 'videoUrl');
                    e.target.value = '';
                  }}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={uploading === 'videoUrl'}
                    onClick={() => videoRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm font-semibold text-[#C41230] hover:bg-red-100 transition-colors disabled:opacity-60"
                  >
                    {uploading === 'videoUrl' ? <Spinner className="w-4 h-4" /> : <Upload size={15} />}
                    {uploading === 'videoUrl' ? 'Uploading…' : 'Upload video'}
                  </button>
                  <input
                    {...register('videoUrl')}
                    placeholder="…or paste a video URL"
                    className="flex-1 px-3 py-2.5 border border-red-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230]/20 focus:border-[#C41230]"
                  />
                </div>
                <p className="text-xs text-stone-400 mt-1">MP4 or WebM, silent, ≈ 10-15s loop. Compress first — keep it under ~8 MB.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Poster image <span className="text-stone-400 font-normal">(optional)</span></label>
                <input
                  ref={posterRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadTo(file, 'posterUrl');
                    e.target.value = '';
                  }}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={uploading === 'posterUrl'}
                    onClick={() => posterRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-600 hover:bg-stone-100 transition-colors disabled:opacity-60"
                  >
                    {uploading === 'posterUrl' ? <Spinner className="w-4 h-4" /> : <Upload size={15} />}
                    {uploading === 'posterUrl' ? 'Uploading…' : 'Upload poster'}
                  </button>
                  <input
                    {...register('posterUrl')}
                    placeholder="…or paste a poster URL"
                    className="flex-1 px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230]/20 focus:border-[#C41230]"
                  />
                </div>
                <p className="text-xs text-stone-400 mt-1">Shown before the video loads and on devices that block autoplay.</p>
              </div>
            </>
          )}
          {errors.image && <p className="text-red-500 text-xs">{errors.image.message}</p>}

          {/* Title + subtitle */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">Title</label>
            <input {...register('title')} placeholder="e.g. Diwali Gift Boxes" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">Subtitle</label>
            <input {...register('subtitle')} placeholder="e.g. Handpacked, delivered fresh" className="input-field" />
          </div>

          {/* CTA */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Button text</label>
              <input {...register('ctaText')} placeholder="Shop now" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Button link</label>
              <input {...register('ctaLink')} placeholder="/category/gifts" className="input-field" />
            </div>
          </div>

          {/* Order + active */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Display order</label>
              <input {...register('displayOrder', { valueAsNumber: true })} type="number" className="input-field" />
            </div>
            <div className="flex flex-col justify-end pb-1">
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
                <span className="text-sm font-medium text-stone-700">Show on site</span>
              </label>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-stone-200 rounded-xl text-sm font-semibold text-stone-600 hover:bg-stone-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting || uploading !== null} className="flex-1 py-2.5 bg-gradient-to-r from-[#C41230] to-[#9B0E25] text-white rounded-xl text-sm font-bold hover:shadow-md transition-all disabled:opacity-60">
              {isSubmitting ? 'Saving…' : banner ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; banner: Banner | null }>({ open: false, banner: null });

  const fetchBanners = () => {
    api.get<{ banners: Banner[] }>('/admin/banners')
      .then((r) => setBanners(r.data.banners))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBanners(); }, []);

  const del = async (id: string) => {
    if (!confirm('Delete this banner? It will be removed from the homepage.')) return;
    await api.delete(`/admin/banners/${id}`);
    fetchBanners();
  };

  const toggleActive = async (b: Banner) => {
    setBusy(true);
    try {
      await api.patch(`/admin/banners/${b._id}`, { active: !b.active });
      fetchBanners();
    } finally {
      setBusy(false);
    }
  };

  // Swap displayOrder with the adjacent banner so admin controls carousel order.
  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= banners.length) return;
    const a = banners[index];
    const b = banners[target];
    setBusy(true);
    try {
      await Promise.all([
        api.patch(`/admin/banners/${a._id}`, { displayOrder: b.displayOrder }),
        api.patch(`/admin/banners/${b._id}`, { displayOrder: a.displayOrder }),
      ]);
      fetchBanners();
    } finally {
      setBusy(false);
    }
  };

  const nextOrder = banners.length ? Math.max(...banners.map((b) => b.displayOrder)) + 1 : 0;
  const activeCount = banners.filter((b) => b.active).length;

  if (loading) return <div className="flex justify-center py-24"><Spinner className="w-10 h-10" /></div>;

  return (
    <div className="p-5 md:p-8 max-w-4xl">
      {modal.open && (
        <BannerModal
          banner={modal.banner}
          nextOrder={nextOrder}
          onClose={() => setModal({ open: false, banner: null })}
          onSaved={fetchBanners}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A0808]">Banners</h1>
          <p className="text-sm text-stone-400 mt-0.5">
            {banners.length} total · {activeCount} live on homepage
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true, banner: null })}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#C41230] to-[#9B0E25] text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all"
        >
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {banners.length === 0 ? (
        <div className="bg-white rounded-2xl border border-red-100 text-center py-20">
          <ImageIcon size={40} className="text-stone-200 mx-auto mb-3" />
          <p className="text-stone-400 font-medium">No banners yet</p>
          <p className="text-stone-400 text-sm mt-1">The homepage shows a default hero until you add one.</p>
          <button onClick={() => setModal({ open: true, banner: null })} className="mt-4 inline-flex items-center gap-1.5 text-sm text-[#C41230] font-semibold hover:underline">
            <Plus size={14} /> Add your first banner
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((b, i) => (
            <div
              key={b._id}
              className={`bg-white rounded-2xl border overflow-hidden transition-opacity ${b.active ? 'border-red-100' : 'border-stone-200 opacity-70'}`}
            >
              <BannerPreview mediaType={b.mediaType} image={b.image} videoUrl={b.videoUrl} posterUrl={b.posterUrl} title={b.title} subtitle={b.subtitle} ctaText={b.ctaText} />

              <div className="flex items-center gap-3 px-4 py-3">
                {/* Reorder */}
                <div className="flex flex-col">
                  <button
                    disabled={i === 0 || busy}
                    onClick={() => move(i, -1)}
                    className="p-1 text-stone-400 hover:text-[#C41230] disabled:opacity-30 disabled:hover:text-stone-400 transition-colors"
                    title="Move up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    disabled={i === banners.length - 1 || busy}
                    onClick={() => move(i, 1)}
                    className="p-1 text-stone-400 hover:text-[#C41230] disabled:opacity-30 disabled:hover:text-stone-400 transition-colors"
                    title="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1A0808] text-sm truncate">{b.title || <span className="text-stone-400 font-normal italic">Untitled banner</span>}</p>
                  <p className="text-xs text-stone-400">Order {b.displayOrder}{b.ctaLink ? ` · links to ${b.ctaLink}` : ''}</p>
                </div>

                <button
                  onClick={() => toggleActive(b)}
                  disabled={busy}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full transition-colors disabled:opacity-60 ${
                    b.active ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                  }`}
                >
                  {b.active ? <Eye size={13} /> : <EyeOff size={13} />}
                  {b.active ? 'Live' : 'Hidden'}
                </button>

                <button onClick={() => setModal({ open: true, banner: b })} className="p-2 hover:bg-red-50 rounded-lg text-stone-400 hover:text-[#C41230] transition-colors" title="Edit">
                  <Pencil size={15} />
                </button>
                <button onClick={() => del(b._id)} className="p-2 hover:bg-red-50 rounded-lg text-stone-400 hover:text-red-600 transition-colors" title="Delete">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
