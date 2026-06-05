import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Tag, ChevronDown, ChevronRight } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../api/client';
import type { Category } from '../../types';
import Spinner from '../../components/Spinner';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  description: z.string().optional(),
  image: z.string().optional().or(z.literal('')),
  parentId: z.string().nullable().optional(),
  displayOrder: z.number(),
  active: z.boolean(),
});
type FormData = z.infer<typeof schema>;

function CategoryModal({ category, parentCategories, onClose, onSaved }: {
  category: Category | null;
  parentCategories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { register, handleSubmit, control, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: category ? {
      name: category.name,
      description: category.description ?? '',
      image: category.image ?? '',
      parentId: (category.parentId as unknown as { _id?: string })?._id ?? (category.parentId as unknown as string) ?? null,
      displayOrder: category.displayOrder,
      active: category.active,
    } : { active: true, displayOrder: 0, parentId: null, image: '' },
  });

  const imageValue = watch('image');

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      parentId: data.parentId || null,
      image: data.image || undefined,
    };
    if (category) {
      await api.patch(`/admin/categories/${category._id}`, payload);
    } else {
      await api.post('/admin/categories', payload);
    }
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#C41230] to-[#9B0E25] px-6 py-4">
          <h2 className="font-bold text-white text-lg">
            {category ? 'Edit Category' : 'New Category'}
          </h2>
          <p className="text-white/70 text-sm mt-0.5">
            {category ? 'Update category details' : 'Add a category or subcategory'}
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">Category Name <span className="text-red-500">*</span></label>
            <input {...register('name')} placeholder="e.g. Mithai, Namkeen..." className="input-field" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">Parent Category</label>
            <select {...register('parentId')} className="input-field">
              <option value="">-- Top Level (No Parent) --</option>
              {parentCategories.filter((c) => !c.parentId && c._id !== category?._id).map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <p className="text-xs text-stone-400 mt-1">Leave empty to create a top-level category</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">Description</label>
            <input {...register('description')} placeholder="Short description..." className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">Image URL</label>
            <input
              {...register('image')}
              placeholder="https://example.com/image.jpg"
              className="input-field"
            />
            {imageValue && (
              <div className="mt-2 w-16 h-16 rounded-xl overflow-hidden border border-red-100 bg-red-50">
                <img
                  src={imageValue}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Display Order</label>
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
                <span className="text-sm font-medium text-stone-700">Active</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-stone-200 rounded-xl text-sm font-semibold text-stone-600 hover:bg-stone-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-gradient-to-r from-[#C41230] to-[#9B0E25] text-white rounded-xl text-sm font-bold hover:shadow-md transition-all disabled:opacity-60">
              {isSubmitting ? 'Saving...' : category ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminCategoriesPage() {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; category: Category | null }>({ open: false, category: null });
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const fetchCategories = () => {
    api.get<Category[]>('/admin/categories').then((r) => setAllCategories(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const del = async (id: string) => {
    if (!confirm('Delete this category? All subcategories will also be deleted.')) return;
    await api.delete(`/admin/categories/${id}`);
    fetchCategories();
  };

  const getParentId = (c: Category): string | null => {
    if (!c.parentId) return null;
    if (typeof c.parentId === 'object') return (c.parentId as unknown as { _id: string })._id;
    return c.parentId as unknown as string;
  };

  const parents = allCategories.filter((c) => !getParentId(c));
  const getChildren = (parentId: string) => allCategories.filter((c) => getParentId(c) === parentId);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner className="w-10 h-10" /></div>;

  return (
    <div className="p-5 md:p-8">
      {modal.open && (
        <CategoryModal
          category={modal.category}
          parentCategories={allCategories}
          onClose={() => setModal({ open: false, category: null })}
          onSaved={fetchCategories}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A0808]">Categories</h1>
          <p className="text-sm text-stone-400 mt-0.5">{parents.length} categories, {allCategories.length - parents.length} subcategories</p>
        </div>
        <button
          onClick={() => setModal({ open: true, category: null })}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#C41230] to-[#9B0E25] text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {allCategories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-red-100 text-center py-20">
          <Tag size={40} className="text-stone-200 mx-auto mb-3" />
          <p className="text-stone-400 font-medium">No categories yet</p>
          <button onClick={() => setModal({ open: true, category: null })} className="mt-4 inline-flex items-center gap-1.5 text-sm text-[#C41230] font-semibold hover:underline">
            <Plus size={14} /> Add your first category
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-red-100 overflow-hidden">
          {parents.map((parent, idx) => {
            const children = getChildren(parent._id);
            const isExpanded = expanded.has(parent._id);
            return (
              <div key={parent._id} className={idx > 0 ? 'border-t border-red-50' : ''}>
                {/* Parent row */}
                <div className="flex items-center px-5 py-4 hover:bg-red-50/30 transition-colors group">
                  <button
                    onClick={() => children.length > 0 && toggleExpand(parent._id)}
                    className={`mr-3 p-1 rounded transition-colors ${children.length > 0 ? 'text-stone-400 hover:text-stone-700' : 'text-transparent'}`}
                  >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>

                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-red-50 shrink-0">
                      {parent.image ? (
                        <img src={parent.image} alt={parent.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">🏷️</div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-[#1A0808]">{parent.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-stone-400 font-mono">{parent.slug}</span>
                        {children.length > 0 && (
                          <span className="text-xs text-[#C41230] bg-red-50 px-1.5 py-0.5 rounded font-medium">
                            {children.length} sub
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${parent.active ? 'bg-green-50 text-green-700' : 'bg-stone-100 text-stone-400'}`}>
                      {parent.active ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setModal({ open: true, category: parent })} className="p-2 hover:bg-red-50 rounded-lg text-stone-400 hover:text-[#C41230] transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => del(parent._id)} className="p-2 hover:bg-red-50 rounded-lg text-stone-400 hover:text-red-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => setModal({ open: true, category: null })}
                      className="hidden group-hover:flex items-center gap-1 text-xs font-medium text-[#C41230] px-2.5 py-1.5 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Plus size={11} /> Sub
                    </button>
                  </div>
                </div>

                {/* Children rows */}
                {isExpanded && children.map((child) => (
                  <div key={child._id} className="flex items-center px-5 py-3.5 bg-red-50/20 border-t border-red-50 hover:bg-red-50/40 transition-colors group">
                    <div className="w-8 h-8 mr-3 ml-8 shrink-0" />
                    <div className="w-2 h-2 bg-red-200 rounded-full mr-3 shrink-0" />
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div>
                        <p className="font-medium text-stone-700 text-sm">{child.name}</p>
                        <p className="text-xs text-stone-400 font-mono">{child.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${child.active ? 'bg-green-50 text-green-700' : 'bg-stone-100 text-stone-400'}`}>
                        {child.active ? 'Active' : 'Inactive'}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setModal({ open: true, category: child })} className="p-1.5 hover:bg-red-50 rounded-lg text-stone-400 hover:text-[#C41230] transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => del(child._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-stone-400 hover:text-red-600 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
