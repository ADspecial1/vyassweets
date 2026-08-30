import { Link } from 'react-router-dom';
import { ShoppingBag, Check } from 'lucide-react';
import type { Product } from '../types';
import { formatINR, discountPercent } from '../lib/format';
import { useCartStore } from '../store/cart';

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const items   = useCartStore((s) => s.items);
  const pct     = discountPercent(product.price, product.mrp);
  const inCart  = items.some((i) => i.productId === product._id);

  return (
    <div className="product-card-hover bg-white rounded-2xl overflow-hidden border border-red-100/70 group flex flex-col shadow-sm">
      {/* Image / placeholder */}
      <Link to={`/product/${product.slug}`} className="relative overflow-hidden block">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-44 object-cover group-hover:scale-[1.07] transition-transform duration-[600ms] ease-out"
          />
        ) : (
          /* No photo yet — a hand-lettered counter tag, not an icon box */
          <div
            className="relative w-full h-44 flex flex-col items-center justify-center gap-2.5 px-4 overflow-hidden"
            style={{ background: 'linear-gradient(150deg, #FBF4E9, #F5E7D0)' }}
          >
            <div className="absolute inset-0 indian-pattern opacity-60 pointer-events-none" />
            <h3 className="relative font-display italic text-center leading-tight text-[#7E0A1D]/45 text-lg group-hover:text-[#7E0A1D]/60 transition-colors line-clamp-2">
              {product.name}
            </h3>
            <span className="relative w-8 h-px bg-[#C41230]/25" />
            <span className="relative tnum text-[11px] text-[#5C1818] font-semibold tracking-wide uppercase">
              Net {product.weight}{product.unit}
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {pct >= 5 && (
            <span className="tnum text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm tracking-wide"
              style={{ background: 'linear-gradient(135deg, #B8962A, #D4AF37)' }}>
              {pct}% OFF
            </span>
          )}
          {product.featured && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm text-white tracking-wide"
              style={{ background: 'linear-gradient(135deg, #C41230, #9B0E25)' }}
            >
              Signature
            </span>
          )}
        </div>

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-[#1A0808]/45 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-white text-xs font-bold px-4 py-2 rounded-full tracking-wide"
              style={{ background: '#1A0808' }}>
              Sold out
            </span>
          </div>
        )}
      </Link>

      {/* Info — laid out like a counter label */}
      <div className="p-3.5 flex flex-col flex-1">
        <Link to={`/product/${product.slug}`} className="flex-1 mb-3">
          <div className="flex items-start gap-2">
            <span className="veg-dot mt-1 shrink-0" aria-label="Vegetarian" title="Pure veg" />
            <h3 className="font-display font-semibold text-[#1A0808] text-[15px] leading-snug line-clamp-2 group-hover:text-[#C41230] transition-colors">
              {product.name}
            </h3>
          </div>
          <p className="tnum text-[11px] text-[#5C1818] mt-1 font-medium tracking-wide uppercase">
            Net {product.weight}{product.unit}
          </p>
        </Link>

        <div className="flex items-end justify-between gap-2">
          <div className="leading-none">
            <span className="tnum font-display font-semibold text-[#1A0808] text-[19px]">{formatINR(product.price)}</span>
            {product.mrp > product.price && (
              <span className="tnum block text-[11px] text-[#5C1818]/70 line-through mt-1">{formatINR(product.mrp)}</span>
            )}
          </div>

          <button
            onClick={(e) => { e.preventDefault(); addItem(product._id); }}
            disabled={product.stock === 0}
            aria-label={inCart ? 'Added to cart' : `Add ${product.name} to cart`}
            className={`btn-shine flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
              inCart
                ? 'bg-[#3E6B4F]/12 text-[#3E6B4F] border border-[#3E6B4F]/40'
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
