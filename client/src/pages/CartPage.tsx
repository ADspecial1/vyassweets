import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, Tag, ShoppingBag, ArrowRight, X } from 'lucide-react';
import { useCartStore } from '../store/cart';
import { useAuthStore } from '../store/auth';
import { validateCoupon, getProducts } from '../api/catalog';
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

  useEffect(() => {
    if (items.length === 0) { setLoading(false); return; }
    setLoading(true);
    getProducts({ limit: 200 }).then((res) => {
      const map: Record<string, Product> = {};
      for (const p of res.items) map[p._id] = p;
      setProducts(map);
    }).finally(() => setLoading(false));
  }, [items.length]);

  const subtotal = items.reduce((sum, item) => sum + ((products[item.productId]?.price ?? 0) * item.qty), 0);
  const shipping = subtotal >= FREE_SHIPPING ? 0 : (subtotal > 0 ? FLAT_SHIPPING : 0);
  const total = subtotal - couponDiscount + shipping;

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const res = await validateCoupon(couponInput.trim().toUpperCase(), subtotal);
      if (res.valid) {
        setCoupon(couponInput.trim().toUpperCase(), res.discount);
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

  if (loading) return <div className="flex justify-center py-24"><Spinner className="w-10 h-10" /></div>;

  if (items.length === 0) return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="w-24 h-24 bg-orange-50 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-5">🛒</div>
      <h2 className="text-2xl font-bold text-[#2C1810] mb-2">Your cart is empty</h2>
      <p className="text-stone-500 mb-8">Looks like you haven't added any sweets yet!</p>
      <Link to="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C0392B] to-[#E8891A] text-white px-8 py-3.5 rounded-full font-bold hover:shadow-lg transition-all">
        <ShoppingBag size={18} /> Shop Now
      </Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#2C1810] mb-2">Your Cart</h1>
      <p className="text-stone-400 text-sm mb-7">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => {
            const p = products[item.productId];
            return (
              <div key={item.productId} className="bg-white rounded-2xl border border-orange-100 p-4 flex gap-4 hover:shadow-sm transition-shadow">
                <Link to={p ? `/product/${p.slug}` : '#'} className="w-20 h-20 bg-orange-50 rounded-xl overflow-hidden shrink-0">
                  {p?.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🍬</div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-[#2C1810] text-sm truncate">{p?.name ?? 'Loading...'}</h3>
                      {p && <p className="text-xs text-stone-400 mt-0.5">{p.weight}{p.unit}</p>}
                    </div>
                    <button onClick={() => removeItem(item.productId)} className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0">
                      <X size={15} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-orange-200 rounded-xl overflow-hidden bg-orange-50/50">
                      <button onClick={() => updateQty(item.productId, item.qty - 1)} className="px-2.5 py-1.5 hover:bg-orange-100 transition-colors text-stone-600">
                        <Minus size={13} />
                      </button>
                      <span className="px-3 py-1.5 text-sm font-bold text-[#2C1810] min-w-[2rem] text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.productId, item.qty + 1)} className="px-2.5 py-1.5 hover:bg-orange-100 transition-colors text-stone-600">
                        <Plus size={13} />
                      </button>
                    </div>
                    {p && <span className="font-bold text-[#2C1810]">{formatINR(p.price * item.qty)}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-orange-100 p-5">
            <h3 className="font-bold text-[#2C1810] mb-4 text-base">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)</span>
                <span className="font-medium">{formatINR(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1"><Tag size={12} /> {couponCode}</span>
                  <span className="font-semibold">-{formatINR(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>Delivery</span>
                <span className={shipping === 0 ? 'text-green-600 font-semibold' : 'font-medium'}>
                  {shipping === 0 ? 'FREE' : formatINR(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-orange-500 bg-orange-50 px-3 py-2 rounded-lg">
                  Add {formatINR(FREE_SHIPPING - subtotal)} more for free delivery!
                </p>
              )}
              <div className="border-t border-orange-100 pt-3 flex justify-between font-bold text-base text-[#2C1810]">
                <span>Total</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>
          </div>

          {/* Coupon */}
          <div className="bg-white rounded-2xl border border-orange-100 p-4">
            <p className="text-sm font-semibold text-[#2C1810] mb-3 flex items-center gap-2">
              <Tag size={14} className="text-[#E8891A]" /> Apply Coupon
            </p>
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponMsg(''); }}
                placeholder="Enter coupon code"
                className="flex-1 px-3 py-2.5 border border-orange-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E8891A]/30 focus:border-[#E8891A] bg-orange-50/30"
              />
              <button
                onClick={applyCoupon}
                disabled={couponLoading || !couponInput.trim()}
                className="px-4 py-2.5 bg-[#2C1810] text-white rounded-xl text-sm font-semibold hover:bg-[#3d2118] transition-colors disabled:opacity-50"
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
            className="w-full py-4 bg-gradient-to-r from-[#C0392B] to-[#E8891A] text-white font-bold rounded-2xl hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-base"
          >
            {user ? 'Proceed to Checkout' : 'Login to Checkout'}
            <ArrowRight size={18} />
          </button>

          <Link to="/" className="flex items-center justify-center gap-1.5 text-sm text-stone-400 hover:text-[#C0392B] transition-colors py-1">
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
