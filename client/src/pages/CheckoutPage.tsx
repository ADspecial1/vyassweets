import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ShoppingBag, Tag, Truck, Receipt } from 'lucide-react';
import { useCartStore } from '../store/cart';
import { useAuthStore } from '../store/auth';
import { getProducts } from '../api/catalog';
import { createOrder, verifyOrder } from '../api/orders';
import type { Product, Address } from '../types';
import { formatINR } from '../lib/format';
import Spinner from '../components/Spinner';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

const FREE_SHIPPING = 50000;
const FLAT_SHIPPING = 5000;
const GST_RATE = 5;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, couponCode, couponDiscount, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (items.length === 0) { navigate('/cart'); return; }
    getProducts({ limit: 200 }).then((res) => {
      const map: Record<string, Product> = {};
      for (const p of res.items) map[p._id] = p;
      setProducts(map);
    }).finally(() => setLoading(false));
  }, [items.length, navigate]);

  useEffect(() => {
    if (user?.addresses) {
      const def = user.addresses.find((a) => a.isDefault);
      setSelectedAddressId(def?._id ?? user.addresses[0]?._id ?? '');
    }
  }, [user]);

  const subtotal = items.reduce((sum, item) => sum + ((products[item.productId]?.price ?? 0) * item.qty), 0);
  const shippingFee = subtotal >= FREE_SHIPPING ? 0 : (subtotal > 0 ? FLAT_SHIPPING : 0);
  const gst = Math.floor(((subtotal - couponDiscount) * GST_RATE) / 100);
  const total = subtotal - couponDiscount + shippingFee + gst;

  const handlePay = async () => {
    if (!selectedAddressId) { setError('Please select a delivery address'); return; }
    setError('');
    setPaying(true);

    try {
      const orderPayload = await createOrder({
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        couponCode: couponCode || undefined,
        addressId: selectedAddressId,
      });

      const rzp = new window.Razorpay({
        key: orderPayload.key,
        amount: orderPayload.amount,
        currency: 'INR',
        name: 'Vyas Sweets',
        description: 'Order Payment',
        order_id: orderPayload.razorpayOrderId,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone,
        },
        theme: { color: '#C0392B' },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await verifyOrder({
              orderId: orderPayload.order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            clearCart();
            navigate(`/checkout/success/${orderPayload.order._id}`);
          } catch {
            setError('Payment verification failed. Contact support.');
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
          },
        },
      });

      rzp.open();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create order';
      setError(msg);
      setPaying(false);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner className="w-10 h-10" /></div>;

  if (!user?.addresses?.length) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <MapPin size={48} className="mx-auto text-stone-300 mb-4" />
        <h2 className="text-xl font-bold text-stone-800 mb-2">No delivery address</h2>
        <p className="text-stone-500 mb-6">Add an address in your profile to continue.</p>
        <button onClick={() => navigate('/profile')} className="bg-[#C0392B] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#a93226]">
          Go to Profile
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#2C1810] mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Address */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-orange-100 p-5">
            <h2 className="font-bold text-[#2C1810] mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-[#C0392B]" /> Delivery Address
            </h2>
            <div className="space-y-3">
              {user.addresses.map((addr: Address) => (
                <label
                  key={addr._id}
                  className={`block rounded-xl border-2 p-4 cursor-pointer transition-all ${
                    selectedAddressId === addr._id
                      ? 'border-[#C0392B] bg-red-50'
                      : 'border-stone-200 hover:border-orange-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="address"
                      value={addr._id}
                      checked={selectedAddressId === addr._id}
                      onChange={() => setSelectedAddressId(addr._id ?? '')}
                      className="mt-1 accent-[#C0392B]"
                    />
                    <div className="text-sm">
                      <p className="font-semibold text-stone-800">{addr.label}</p>
                      <p className="text-stone-600">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                      <p className="text-stone-600">{addr.city}, {addr.state} — {addr.pincode}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <button onClick={() => navigate('/profile')} className="mt-3 text-sm text-[#C0392B] hover:underline">
              + Add new address
            </button>
          </div>

          {/* Items summary */}
          <div className="bg-white rounded-2xl border border-orange-100 p-5">
            <h2 className="font-bold text-[#2C1810] mb-4 flex items-center gap-2">
              <ShoppingBag size={18} className="text-[#C0392B]" /> Items ({items.reduce((s, i) => s + i.qty, 0)})
            </h2>
            <div className="space-y-3">
              {items.map((item) => {
                const p = products[item.productId];
                return (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-50 rounded-lg overflow-hidden shrink-0">
                      {p?.images?.[0]
                        ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-xl">🍬</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 truncate">{p?.name ?? '...'}</p>
                      <p className="text-xs text-stone-400">Qty: {item.qty}</p>
                    </div>
                    {p && <span className="text-sm font-semibold text-stone-800">{formatINR(p.price * item.qty)}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Price breakdown + Pay */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-orange-100 p-5">
            <h2 className="font-bold text-[#2C1810] mb-4 flex items-center gap-2">
              <Receipt size={18} className="text-[#C0392B]" /> Price Details
            </h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1"><Tag size={12} /> {couponCode}</span>
                  <span>-{formatINR(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span className="flex items-center gap-1"><Truck size={12} /> Delivery</span>
                <span className={shippingFee === 0 ? 'text-green-600 font-semibold' : ''}>
                  {shippingFee === 0 ? 'FREE' : formatINR(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>GST ({GST_RATE}%)</span>
                <span>{formatINR(gst)}</span>
              </div>
              <div className="border-t border-orange-100 pt-2.5 flex justify-between font-bold text-base text-[#2C1810]">
                <span>Total</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={paying || !selectedAddressId}
            className="w-full py-4 bg-gradient-to-r from-[#C0392B] to-[#E8891A] text-white font-bold rounded-2xl hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {paying ? <><Spinner className="w-5 h-5" /> Processing...</> : `Pay ${formatINR(total)}`}
          </button>

          <p className="text-xs text-stone-400 text-center">
            Secured by Razorpay. You will be redirected to complete the payment.
          </p>
        </div>
      </div>
    </div>
  );
}
