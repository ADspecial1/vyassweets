import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Package } from 'lucide-react';
import { getMyOrders } from '../api/orders';
import type { Order } from '../types';
import { formatINR } from '../lib/format';
import Spinner from '../components/Spinner';

const STATUS_CONFIG: Record<string, { label: string; dot: string; text: string }> = {
  pending:   { label: 'Pending',           dot: 'bg-yellow-400', text: 'text-yellow-700' },
  paid:      { label: 'Order Confirmed',   dot: 'bg-blue-500',   text: 'text-blue-700'   },
  packed:    { label: 'Packed',            dot: 'bg-purple-500', text: 'text-purple-700' },
  shipped:   { label: 'Shipped',           dot: 'bg-indigo-500', text: 'text-indigo-700' },
  delivered: { label: 'Delivered',         dot: 'bg-green-500',  text: 'text-green-700'  },
  cancelled: { label: 'Cancelled',         dot: 'bg-red-400',    text: 'text-red-600'    },
  refunded:  { label: 'Refunded',          dot: 'bg-stone-400',  text: 'text-stone-600'  },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-24"><Spinner className="w-10 h-10" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-[#1A0808] mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={48} className="mx-auto text-stone-300 mb-4" />
          <p className="text-stone-500 font-medium mb-1">No orders yet</p>
          <p className="text-sm text-stone-400 mb-6">You haven't placed any orders yet.</p>
          <Link
            to="/"
            className="inline-block text-white px-6 py-3 rounded-xl font-semibold transition"
            style={{ background: 'linear-gradient(135deg, #C41230, #9B0E25)' }}
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['pending'];
            const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            });

            return (
              <Link
                key={order._id}
                to={`/orders/${order._id}`}
                className="block bg-white rounded-2xl border border-stone-100 hover:border-red-200 hover:shadow-md transition-all overflow-hidden"
              >
                {/* Order header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-50 bg-stone-50/60">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">
                      {order.orderNumber}
                    </span>
                    <span className="text-stone-300">·</span>
                    <span className="text-xs text-stone-400">{date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="px-5 py-4">
                  <div className="flex items-start gap-4">
                    {/* Item thumbnails */}
                    <div className="flex -space-x-2 shrink-0">
                      {order.items.slice(0, 3).map((item, i) => (
                        <div
                          key={i}
                          className="w-14 h-14 rounded-xl border-2 border-white bg-red-50 overflow-hidden shadow-sm"
                          style={{ zIndex: order.items.length - i }}
                        >
                          {item.image
                            ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-2xl">🍬</div>
                          }
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-14 h-14 rounded-xl border-2 border-white bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-500 shadow-sm">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>

                    {/* Item names */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1A0808] truncate">
                        {order.items[0]?.name}
                        {order.items.length > 1 && (
                          <span className="text-stone-400 font-normal">
                            {' '}+ {order.items.length - 1} more
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {order.items.reduce((sum, i) => sum + i.qty, 0)} item{order.items.reduce((sum, i) => sum + i.qty, 0) > 1 ? 's' : ''}
                        {order.address?.city ? ` · Deliver to ${order.address.city}` : ''}
                      </p>
                    </div>

                    {/* Price + arrow */}
                    <div className="flex items-center gap-2 shrink-0">
                      <p className="text-sm font-bold text-[#1A0808]">{formatINR(order.total)}</p>
                      <ChevronRight size={16} className="text-stone-300" />
                    </div>
                  </div>

                  {/* Status message */}
                  {order.status === 'delivered' && (
                    <p className="text-xs text-green-600 font-medium mt-3 flex items-center gap-1">
                      ✓ Delivered successfully
                    </p>
                  )}
                  {order.status === 'shipped' && (
                    <p className="text-xs text-indigo-600 font-medium mt-3">
                      🚚 On the way to you
                    </p>
                  )}
                  {order.status === 'paid' && (
                    <p className="text-xs text-blue-600 font-medium mt-3">
                      ✓ Payment confirmed · Being prepared
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
