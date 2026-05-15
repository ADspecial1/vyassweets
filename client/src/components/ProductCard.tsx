import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Check, Package } from 'lucide-react';
import type { Product } from '../types';
import { formatINR, discountPercent } from '../lib/format';
import { useCartStore } from '../store/cart';

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const items   = useCartStore((s) => s.items);
  const pct     = discountPercent(product.price, product.mrp);
  const inCart  = items.some((i) => i.productId === product._id);

  return (
    <div className="product-card-hover bg-white rounded-2xl overflow-hidden border border-red-100/60 group flex flex-col shadow-sm">
      {/* Image / placeholder */}
      <Link to={`/product/${product.slug}`} className="relative overflow-hidden block">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-44 object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          />
        ) : (
          <div
            className="w-full h-44 flex flex-col items-center justify-center gap-3 transition-all duration-400"
            style={{ background: 'linear-gradient(135deg, #FFF8F0, #FFEEDD)' }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300"
              style={{ background: 'linear-gradient(135deg, #C41230, #9B0E25)' }}
            >
              <Package size={24} className="text-white" />
            </div>
            <span className="text-xs text-[#5C1818] font-semibold">{product.weight}{product.unit}</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {pct >= 5 && (
            <span className="bg-[#D4AF37] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
              {pct}% OFF
            </span>
          )}
          {product.featured && (
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm text-white"
              style={{ background: 'linear-gradient(135deg, #C41230, #9B0E25)' }}
            >
              <Star size={8} fill="white" strokeWidth={0} /> Popular
            </span>
          )}
        </div>

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
            <span
              className="text-white text-xs font-black px-4 py-2 rounded-full tracking-wide"
              style={{ background: '#1A0808' }}
            >
              Out of Stock
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A0808]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      {/* Info */}
      <div className="p-3.5 flex flex-col flex-1">
        <Link to={`/product/${product.slug}`} className="flex-1 mb-3">
          <h3 className="font-bold text-[#1A0808] text-sm leading-snug line-clamp-2 group-hover:text-[#C41230] transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-[#5C1818] mt-1 font-medium">{product.weight}{product.unit}</p>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <span className="font-black text-[#1A0808] text-base">{formatINR(product.price)}</span>
            {product.mrp > product.price && (
              <span className="text-xs text-[#5C1818] line-through ml-1.5">{formatINR(product.mrp)}</span>
            )}
          </div>

          <button
            onClick={(e) => { e.preventDefault(); addItem(product._id); }}
            disabled={product.stock === 0}
            className={`btn-shine flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
              inCart
                ? 'bg-[#D4AF37]/20 text-[#1A0808] border border-[#D4AF37] hover:bg-[#D4AF37]/30'
                : 'text-white hover:shadow-md hover:-translate-y-0.5'
            }`}
            style={!inCart ? { background: 'linear-gradient(135deg, #C41230, #9B0E25)' } : undefined}
          >
            {inCart
              ? <><Check size={13} /> Added</>
              : <><ShoppingBag size={13} /> Add</>}
          </button>
        </div>
      </div>
    </div>
  );
}
