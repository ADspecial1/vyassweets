import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, CheckCircle, Truck, MapPin, Tag, Receipt } from 'lucide-react';
import { getOrderById } from '../api/orders';
import type { Order } from '../types';
import { formatINR } from '../lib/format';
import Spinner from '../components/Spinner';

const STATUS_STEPS = ['pending', 'paid', 'packed', 'shipped', 'delivered'] as const;

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  paid: 'Payment Confirmed',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  packed: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-stone-100 text-stone-700',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      getOrderById(id).then(setOrder).catch(() => setError('Order not found')).finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="flex justify-center py-24"><Spinner className="w-10 h-10" /></div>;

  if (error || !order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-stone-500 mb-4">{error || 'Order not found'}</p>
        <Link to="/orders" className="text-[#C0392B] hover:underline">Back to orders</Link>
      </div>
    );
  }

  const isCancelledOrRefunded = order.status === 'cancelled' || order.status === 'refunded';
  const currentStepIdx = STATUS_STEPS.indexOf(order.status as typeof STATUS_STEPS[number]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-stone-900">{order.orderNumber}</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${STATUS_COLOR[order.status] ?? 'bg-stone-100 text-stone-700'}`}>
          {STATUS_LABEL[order.status] ?? order.status}
        </span>
      </div>

      {/* Status Timeline */}
      {!isCancelledOrRefunded && (
        <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-4">
          <div className="flex items-center">
            {STATUS_STEPS.map((step, idx) => {
              const done = currentStepIdx >= idx;
              const isLast = idx === STATUS_STEPS.length - 1;
              return (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${done ? 'bg-[#C0392B] text-white' : 'bg-stone-100 text-stone-400'}`}>
                      <CheckCircle size={16} />
                    </div>
                    <span className={`text-[10px] font-medium text-center leading-tight ${done ? 'text-[#C0392B]' : 'text-stone-400'}`}>
                      {STATUS_LABEL[step]}
                    </span>
                  </div>
                  {!isLast && (
                    <div className={`flex-1 h-1 mx-1 rounded-full ${currentStepIdx > idx ? 'bg-[#C0392B]' : 'bg-stone-100'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Items */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <h2 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Package size={16} className="text-[#C0392B]" /> Items
          </h2>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-50 rounded-lg overflow-hidden shrink-0">
                  {item.image
                    ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xl">🍬</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 truncate">{item.name}</p>
                  <p className="text-xs text-stone-400">Qty: {item.qty}</p>
                </div>
                <span className="text-sm font-semibold text-stone-800">{formatINR(item.lineTotal)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery address */}
        <div className="space-y-4">
          {order.address && (
            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <h2 className="font-bold text-stone-800 mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-[#C0392B]" /> Delivery Address
              </h2>
              <div className="text-sm text-stone-600 space-y-0.5">
                <p className="font-medium text-stone-800">{order.address.label}</p>
                <p>{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}</p>
                <p>{order.address.city}, {order.address.state} — {order.address.pincode}</p>
              </div>
            </div>
          )}

          {/* Price breakdown */}
          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <h2 className="font-bold text-stone-800 mb-3 flex items-center gap-2">
              <Receipt size={16} className="text-[#C0392B]" /> Price Breakdown
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span><span>{formatINR(order.subtotal)}</span>
              </div>
              {order.couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1"><Tag size={12} /> {order.couponCode}</span>
                  <span>-{formatINR(order.couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>Delivery</span>
                <span className={order.shippingFee === 0 ? 'text-green-600' : ''}>{order.shippingFee === 0 ? 'FREE' : formatINR(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>GST</span><span>{formatINR(order.gst)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-stone-900">
                <span>Total</span><span>{formatINR(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery truck icon for shipped */}
      {order.status === 'shipped' && (
        <div className="mt-4 bg-indigo-50 rounded-2xl p-4 flex items-center gap-3 text-indigo-700">
          <Truck size={22} />
          <p className="text-sm font-medium">Your order is on the way!</p>
        </div>
      )}

      <div className="mt-6">
        <Link to="/orders" className="text-sm text-[#C0392B] hover:underline">← Back to all orders</Link>
      </div>
    </div>
  );
}
