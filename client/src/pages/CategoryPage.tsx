import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getProducts, getCategoryBySlug } from '../api/catalog';
import type { Category, Product } from '../types';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import { ChevronLeft, ChevronRight, SlidersHorizontal, Search } from 'lucide-react';

const SORT_OPTIONS = [
  { value: '', label: 'Recommended' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');

  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const sort = searchParams.get('sort') ?? '';
  const search = searchParams.get('search') ?? '';

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const params = {
      ...(slug !== 'all' ? { category: slug } : {}),
      sort: sort || undefined,
      search: search || undefined,
      page,
      limit: 12,
    };
    const catFetch = slug && slug !== 'all' ? getCategoryBySlug(slug).catch(() => null) : Promise.resolve(null);
    Promise.all([getProducts(params), catFetch]).then(([res, cat]) => {
      setProducts(res.items);
      setTotal(res.total);
      setPages(res.pages);
      setCategory(cat);
    }).finally(() => setLoading(false));
  }, [slug, page, sort, search]);

  const setParam = (key: string, val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParam('search', searchInput);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[#5C1818]/60 mb-5">
        <Link to="/" className="hover:text-[#C41230]">Home</Link>
        <span>/</span>
        <span className="text-[#1A0808] font-medium">{category?.name ?? (slug === 'all' ? 'All Products' : 'Products')}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-7">
        <div>
          <h1 className="text-2xl font-bold text-[#1A0808]">
            {category?.name ?? (slug === 'all' ? 'All Products' : 'Products')}
          </h1>
          {category?.description && <p className="text-[#5C1818] mt-1 text-sm">{category.description}</p>}
          <p className="text-sm text-[#5C1818]/60 mt-1.5">{total} product{total !== 1 ? 's' : ''} found</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-7">
        <form onSubmit={handleSearch} className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C1818]/40" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search sweets..."
            className="pl-9 pr-4 py-2.5 border border-red-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C41230]/20 focus:border-[#C41230] w-52"
          />
        </form>

        <div className="flex items-center gap-2 bg-white border border-red-200 rounded-xl px-3 py-2">
          <SlidersHorizontal size={15} className="text-[#5C1818]/40" />
          <select
            value={sort}
            onChange={(e) => setParam('sort', e.target.value)}
            className="text-sm focus:outline-none bg-transparent text-[#1A0808] cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {(search || sort) && (
          <button
            onClick={() => { setSearchParams({}); setSearchInput(''); }}
            className="px-4 py-2.5 text-sm text-[#5C1818] border border-red-100 rounded-xl hover:bg-red-50 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Spinner className="w-10 h-10" />
          <p className="text-sm text-[#5C1818]">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-bold text-[#1A0808] mb-2">No products found</h3>
          <p className="text-[#5C1818] mb-6">Try adjusting your search or filters</p>
          <button onClick={() => { setSearchParams({}); setSearchInput(''); }} className="btn-primary">
            Clear &amp; Browse All
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>

          {pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                disabled={page <= 1}
                onClick={() => setParam('page', String(page - 1))}
                className="w-10 h-10 rounded-xl border border-red-200 flex items-center justify-center hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                  const p = Math.max(1, Math.min(pages - 4, page - 2)) + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setParam('page', String(p))}
                      className={`w-10 h-10 rounded-xl text-sm font-semibold transition-colors ${p === page ? 'text-white' : 'border border-red-200 hover:bg-red-50 text-[#1A0808]'}`}
                      style={p === page ? { background: '#C41230' } : undefined}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
              <button
                disabled={page >= pages}
                onClick={() => setParam('page', String(page + 1))}
                className="w-10 h-10 rounded-xl border border-red-200 flex items-center justify-center hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
