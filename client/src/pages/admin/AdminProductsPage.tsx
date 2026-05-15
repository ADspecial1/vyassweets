import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search, Package } from 'lucide-react';
import api from '../../api/client';
import type { Category, Product } from '../../types';
import { formatINR } from '../../lib/format';
import Spinner from '../../components/Spinner';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [total, setTotal] = useState(0);

  const fetchProducts = (q = search, cat = catFilter) => {
    const params: Record<string, string> = { limit: '50' };
    if (q) params['search'] = q;
    if (cat) params['category'] = cat;
    api.get<{ items: Product[]; total: number }>('/admin/products', { params })
      .then((r) => { setProducts(r.data.items); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get<Category[]>('/admin/categories').then((r) => setCategories(r.data.filter((c) => !c.parentId)));
    fetchProducts();
  }, []);

  const toggleActive = async (p: Product) => {
    await api.patch(`/admin/products/${p._id}`, { active: !p.active });
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await api.delete(`/admin/products/${id}`);
    fetchProducts();
  };

  const catName = (id: string | Category) => {
    if (typeof id === 'object') return id.name;
    return categories.find((c) => c._id === id)?.name ?? '-';
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner className="w-10 h-10" /></div>;

  return (
    <div className="p-5 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A0808]">Products</h1>
          <p className="text-sm text-stone-400 mt-0.5">{total} products total</p>
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#C41230] to-[#9B0E25] text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); fetchProducts(e.target.value, catFilter); }}
            placeholder="Search products..."
            className="pl-9 pr-4 py-2.5 border border-red-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C41230]/20 w-52"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => { setCatFilter(e.target.value); fetchProducts(search, e.target.value); }}
          className="px-4 py-2.5 border border-red-200 rounded-xl text-sm bg-white focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-red-100 overflow-hidden">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <Package size={40} className="text-stone-200 mx-auto mb-3" />
            <p className="text-stone-400 font-medium">No products yet</p>
            <Link to="/admin/products/new" className="mt-4 inline-flex items-center gap-1.5 text-sm text-[#C41230] font-semibold hover:underline">
              <Plus size={14} /> Add your first product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-red-50 border-b border-red-100">
                <tr className="text-left text-stone-500">
                  <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wide">Product</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wide">Category</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wide">Price</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wide">Stock</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-50">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-red-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-red-50 shrink-0">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">🍬</div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-[#1A0808]">{p.name}</p>
                          <p className="text-xs text-stone-400 font-mono">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-medium bg-red-50 text-[#C41230] px-2.5 py-1 rounded-full">
                        {catName(p.categoryId)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-bold text-[#1A0808]">{formatINR(p.price)}</p>
                      {p.mrp > p.price && <p className="text-xs text-stone-400 line-through">{formatINR(p.mrp)}</p>}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`font-bold text-sm ${p.stock === 0 ? 'text-red-600' : p.stock < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {p.stock === 0 ? 'Out of stock' : p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleActive(p)}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full transition-colors ${p.active ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-stone-50 text-stone-400 hover:bg-stone-100'}`}
                      >
                        {p.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        {p.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/admin/products/${p._id}/edit`}
                          className="p-2 hover:bg-red-50 rounded-lg text-stone-400 hover:text-[#C41230] transition-colors"
                        >
                          <Pencil size={15} />
                        </Link>
                        <button
                          onClick={() => deleteProduct(p._id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-stone-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={15} />
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
    </div>
  );
}
