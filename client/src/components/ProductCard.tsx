import { Link } from 'react-router-dom';
import { ShoppingBag, Check } from 'lucide-react';
import type { Product } from '../types';
import { formatINR, discountPercent } from '../lib/format';
import { sweetImage } from '../lib/sweetImage';
import { useCartStore } from '../store/cart';

/* Storefront product card — "The Counter" redesign.
   A modern mithai-counter ticket: photo up top, a perforated spec line, then
   name + weigh-scale (mono) price. Shared across Home / Category / Product /
   Cart, so it stays self-contained. */

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const items   = useCartStore((s) => s.items);
  const pct     = discountPercent(product.price, product.mrp);
  const inCart  = items.some((i) => i.productId === product._id);

  return (
    <div className="sf-card sf-hover overflow-hidden group flex flex-col h-full">
      {/* Image / placeholder */}
      <Link to={`/product/${product.slug}`} className="relative overflow-hidden block">
        <img
          src={product.images[0] || sweetImage(product.name)}
          alt={product.name}
          loading="lazy"
          className="w-full h-44 object-cover group-hover:scale-[1.06] transition-transform duration-[600ms] ease-out"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {pct >= 5 && (
            <span className="sf-num text-[10px] font-medium px-2 py-0.5 rounded-md shadow-sm text-white" style={{ background: 'var(--sf-marigold)' }}>
              {pct}% OFF
            </span>
          )}
          {product.featured && (
            <span className="sf-tag text-[10px] px-2 py-0.5 rounded-md shadow-sm text-white" style={{ background: 'var(--sf-crimson)', letterSpacing: '0.08em' }}>
              Signature
            </span>
          )}
        </div>

        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(26,8,8,0.5)', backdropFilter: 'blur(1px)' }}>
            <span className="sf-tag text-white px-4 py-2 rounded-full" style={{ background: 'var(--sf-dark)', letterSpacing: '0.1em' }}>
              Sold out
            </span>
          </div>
        )}
      </Link>

      {/* Perforated ticket edge */}
      <div className="sf-perf" style={{ color: 'var(--sf-paper-2)' }} />

      {/* Info — laid out like a counter ticket */}
      <div className="p-3.5 pt-2.5 flex flex-col flex-1">
        <Link to={`/product/${product.slug}`} className="flex-1 mb-3">
          <div className="flex items-start gap-2">
            <span className="veg-dot mt-1 shrink-0" aria-label="Vegetarian" title="Pure veg" />
            <h3 className="sf-display font-semibold text-[15px] leading-snug line-clamp-2 transition-colors group-hover:text-[var(--sf-crimson)]" style={{ color: 'var(--sf-ink)' }}>
              {product.name}
            </h3>
          </div>
          <p className="sf-tag mt-1.5" style={{ color: 'var(--sf-ink-soft)' }}>
            Net {product.weight}{product.unit}
          </p>
        </Link>

        <div className="flex items-end justify-between gap-2">
          <div className="leading-none">
            <span className="sf-num font-medium text-[19px]" style={{ color: 'var(--sf-ink)' }}>{formatINR(product.price)}</span>
            {product.mrp > product.price && (
              <span className="sf-num block text-[11px] line-through mt-1" style={{ color: 'rgba(107,91,82,0.7)' }}>{formatINR(product.mrp)}</span>
            )}
          </div>

          <button
            onClick={(e) => { e.preventDefault(); addItem(product._id); }}
            disabled={product.stock === 0}
            aria-label={inCart ? 'Added to cart' : `Add ${product.name} to cart`}
            className={`sf-btn flex items-center gap-1.5 px-3 py-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed ${
              inCart ? '' : 'sf-btn-primary'
            }`}
            style={inCart ? { background: 'var(--sf-pista-tint)', color: 'var(--sf-pista-dk)', border: '1px solid rgba(62,107,79,0.4)' } : undefined}
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
