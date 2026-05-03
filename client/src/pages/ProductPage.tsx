import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, ChevronRight } from 'lucide-react';
import { getProductBySlug, getProducts } from '../api/catalog';
import type { Category, Product } from '../types';
import { formatINR, discountPercent } from '../lib/format';
import { useCartStore } from '../store/cart';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);

  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setActiveImg(0);
    setQty(1);
    getProductBySlug(slug).then((p) => {
      setProduct(p);
      const catSlug = (p.categoryId as Category)?.slug;
      if (catSlug) {
        getProducts({ category: catSlug, limit: 4 }).then((r) => {
          setRelated(r.items.filter((x) => x._id !== p._id).slice(0, 4));
        });
      }
    }).catch(() => setProduct(null)).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="flex justify-center py-24"><Spinner className="w-10 h-10" /></div>;
  if (!product) return (
    <div className="text-center py-24">
      <p className="text-stone-500">Product not found.</p>
      <Link to="/" className="text-[#C0392B] mt-2 inline-block">← Back to home</Link>
    </div>
  );

  const pct = discountPercent(product.price, product.mrp);
  const cartItem = items.find((i) => i.productId === product._id);

  const handleAddToCart = () => {
    if (cartItem) {
      updateQty(product._id, qty);
    } else {
      for (let i = 0; i < qty; i++) addItem(product._id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-stone-400 mb-6">
        <Link to="/" className="hover:text-stone-700">Home</Link>
        <ChevronRight size={14} />
        {(product.categoryId as Category)?.name && (
          <>
            <Link to={`/category/${(product.categoryId as Category).slug}`} className="hover:text-stone-700">
              {(product.categoryId as Category).name}
            </Link>
            <ChevronRight size={14} />
          </>
        )}
        <span className="text-stone-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <div className="rounded-2xl overflow-hidden bg-stone-50 aspect-square">
            {product.images[activeImg] ? (
              <img src={product.images[activeImg]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">🍬</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === activeImg ? 'border-[#C0392B]' : 'border-stone-200'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {(product.categoryId as Category)?.name && (
            <span className="text-xs font-semibold text-[#C0392B] uppercase tracking-wider">{(product.categoryId as Category).name}</span>
          )}
          <h1 className="text-2xl font-bold text-stone-900">{product.name}</h1>
          <p className="text-sm text-stone-500">{product.weight}{product.unit} · SKU: {product.sku}</p>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-stone-900">{formatINR(product.price)}</span>
            {product.mrp > product.price && (
              <>
                <span className="text-lg text-stone-400 line-through">{formatINR(product.mrp)}</span>
                <span className="bg-green-100 text-green-700 text-sm font-bold px-2 py-0.5 rounded-full">{pct}% OFF</span>
              </>
            )}
          </div>

          {product.stock === 0 ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-medium">
              Out of Stock
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
              In Stock ({product.stock} available)
            </div>
          )}

          {product.description && (
            <p className="text-stone-600 text-sm leading-relaxed">{product.description}</p>
          )}

          {product.stock > 0 && (
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2.5 hover:bg-stone-100 transition-colors">
                  <Minus size={16} />
                </button>
                <span className="px-4 py-2.5 font-semibold min-w-[2.5rem] text-center">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-3 py-2.5 hover:bg-stone-100 transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#C0392B] text-white font-semibold rounded-xl hover:bg-[#a93226] transition-colors"
              >
                <ShoppingCart size={18} />
                {cartItem ? 'Update Cart' : 'Add to Cart'}
              </button>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-bold text-stone-900 mb-5">You might also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
