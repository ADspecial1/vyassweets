import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Tag, ShoppingBag, ArrowRight, X } from 'lucide-react';
import { useCartStore } from '../store/cart';
import { useAuthStore } from '../store/auth';
import { validateCoupon, getProducts, getActiveCoupons, type ActiveCoupon } from '../api/catalog';
import type { Product } from '../types';
import { formatINR } from '../lib/format';
import Spinner from '../components/Spinner';

const FREE_SHIPPING = 50000;
const FLAT_SHIPPING = 5000;

export default function CartPage() {
  const { items, updateQty, removeItem, couponCode, couponDiscount, setCoupon, clearCoupon } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [couponInput, setCouponInput] = useState(couponCode);
  const [couponMsg, setCouponMsg] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [activeCoupons, setActiveCoupons] = useState<ActiveCoupon[]>([]);

  useEffect(() => {
    if (items.length === 0) { setLoading(false); return; }
    setLoading(true);
    getProducts({ limit: 200 }).then((res) => {
      const map: Record<string, Product> = {};
      for (const p of res.items) map[p._id] = p;
      setProducts(map);
    }).finally(() => setLoading(false));
  }, [items.length]);

  useEffect(() => {
    getActiveCoupons().then(setActiveCoupons).catch(() => setActiveCoupons([]));
  }, []);

  const subtotal = items.reduce((sum, item) => sum + ((products[item.productId]?.price ?? 0) * item.qty), 0);
  const shipping = subtotal >= FREE_SHIPPING ? 0 : (subtotal > 0 ? FLAT_SHIPPING : 0);
  const total = subtotal - couponDiscount + shipping;

  const applyCoupon = async (code: string = couponInput) => {
    if (!code.trim()) return;
    setCouponLoading(true);
    try {
      const res = await validateCoupon(code.trim().toUpperCase(), subtotal);
      if (res.valid) {
        setCoupon(code.trim().toUpperCase(), res.discount);
        setCouponMsg(`✓ ${res.message}`);
      } else {
        clearCoupon();
        setCouponMsg(res.message);
      }
    } catch {
      setCouponMsg('Failed to validate coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const describeOffer = (c: ActiveCoupon): string => {
    const amount = c.type === 'flat' ? formatINR(c.value) : `${c.value}%`;
    const min = c.minOrderAmount > 0 ? ` above ${formatINR(c.minOrderAmount)}` : '';
    return `${amount} off${min}`;
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner className="w-10 h-10" /></div>;

  if (items.length === 0) return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-5">🛒</div>
      <h2 className="text-2xl font-bold text-[#1A0808] mb-2">Your cart is empty</h2>
      <p className="text-[#5C1818] mb-8">Looks like you haven't added any sweets yet!</p>
      <Link to="/" className="inline-flex items-center gap-2 text-white px-8 py-3.5 rounded-full font-bold hover:shadow-lg transition-all" style={{ background: 'linear-gradient(135deg, #C41230, #9B0E25)' }}>
        <ShoppingBag size={18} /> Shop Now
      </Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#1A0808] mb-2">Your Cart</h1>
      <p className="text-[#5C1818] text-sm mb-7">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => {
            const p = products[item.productId];
            return (
              <div key={item.productId} className="bg-white rounded-2xl border border-red-100 p-4 flex gap-4 hover:shadow-sm transition-shadow">
                <Link to={p ? `/product/${p.slug}` : '#'} className="w-20 h-20 bg-red-50 rounded-xl overflow-hidden shrink-0">
                  {p?.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🍬</div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-[#1A0808] text-sm truncate">{p?.name ?? 'Loading...'}</h3>
                      {p && <p className="text-xs text-[#5C1818] mt-0.5">{p.weight}{p.unit}</p>}
                    </div>
                    <button onClick={() => removeItem(item.productId)} className="p-1.5 text-[#5C1818]/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all shrink-0">
                      <X size={15} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-red-200 rounded-xl overflow-hidden bg-red-50/50">
                      <button onClick={() => updateQty(item.productId, item.qty - 1)} className="px-2.5 py-1.5 hover:bg-red-100 transition-colors text-[#1A0808]">
                        <Minus size={13} />
                      </button>
                      <span className="px-3 py-1.5 text-sm font-bold text-[#1A0808] min-w-[2rem] text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.productId, item.qty + 1)} className="px-2.5 py-1.5 hover:bg-red-100 transition-colors text-[#1A0808]">
                        <Plus size={13} />
                      </button>
                    </div>
                    {p && <span className="font-bold text-[#1A0808]">{formatINR(p.price * item.qty)}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-red-100 p-5">
            <h3 className="font-bold text-[#1A0808] mb-4 text-base">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-[#5C1818]">
                <span>Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)</span>
                <span className="font-medium">{formatINR(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1"><Tag size={12} /> {couponCode}</span>
                  <span className="font-semibold">-{formatINR(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#5C1818]">
                <span>Delivery</span>
                <span className={shipping === 0 ? 'text-green-600 font-semibold' : 'font-medium'}>
                  {shipping === 0 ? 'FREE' : formatINR(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-[#C41230] bg-red-50 px-3 py-2 rounded-lg">
                  Add {formatINR(FREE_SHIPPING - subtotal)} more for free delivery!
                </p>
              )}
              <div className="border-t border-red-100 pt-3 flex justify-between font-bold text-base text-[#1A0808]">
                <span>Total</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>
          </div>

          {/* Available offers */}
          {activeCoupons.length > 0 && (
            <div className="bg-white rounded-2xl border border-red-100 p-4">
              <p className="text-sm font-semibold text-[#1A0808] mb-3 flex items-center gap-2">
                <Tag size={14} className="text-[#C41230]" /> Available Offers
              </p>
              <div className="space-y-2">
                {activeCoupons.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => { setCouponInput(c.code); setCouponMsg(''); applyCoupon(c.code); }}
                    disabled={couponLoading}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 border border-dashed border-red-200 rounded-xl bg-red-50/40 hover:bg-red-50 transition-colors text-left disabled:opacity-50"
                  >
                    <div className="min-w-0">
                      <p className="font-mono font-bold text-[#C41230] text-sm">{c.code}</p>
                      <p className="text-xs text-[#5C1818] truncate">{describeOffer(c)}</p>
                    </div>
                    <span className="text-xs font-semibold text-[#C41230] shrink-0">Apply</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Coupon */}
          <div className="bg-white rounded-2xl border border-red-100 p-4">
            <p className="text-sm font-semibold text-[#1A0808] mb-3 flex items-center gap-2">
              <Tag size={14} className="text-[#C41230]" /> Apply Coupon
            </p>
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponMsg(''); }}
                placeholder="Enter coupon code"
                className="flex-1 px-3 py-2.5 border border-red-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230]/20 focus:border-[#C41230] bg-red-50/30"
              />
              <button
                onClick={() => applyCoupon()}
                disabled={couponLoading || !couponInput.trim()}
                className="px-4 py-2.5 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 hover:opacity-90"
                style={{ background: '#1A0808' }}
              >
                Apply
              </button>
            </div>
            {couponMsg && (
              <p className={`text-xs mt-2 font-medium ${couponMsg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
                {couponMsg}
              </p>
            )}
          </div>

          <button
            onClick={() => user ? navigate('/checkout') : navigate('/login?redirect=/checkout')}
            className="w-full py-4 text-white font-bold rounded-2xl hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-base"
            style={{ background: 'linear-gradient(135deg, #C41230, #9B0E25)' }}
          >
            {user ? 'Proceed to Checkout' : 'Login to Checkout'}
            <ArrowRight size={18} />
          </button>

          <Link to="/" className="flex items-center justify-center gap-1.5 text-sm text-[#5C1818] hover:text-[#C41230] transition-colors py-1">
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
