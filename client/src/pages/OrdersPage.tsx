import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../api/orders';
import type { Order } from '../types';
import { formatINR } from '../lib/format';
import Spinner from '../components/Spinner';

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  packed: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-stone-100 text-stone-700',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-24"><Spinner className="w-10 h-10" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-stone-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-stone-500">No orders yet.</p>
          <Link to="/" className="mt-4 inline-block text-[#C0392B] font-medium hover:underline">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order._id} to={`/orders/${order._id}`} className="block bg-white rounded-2xl border border-stone-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-stone-900">{order.orderNumber}</p>
                  <p className="text-sm text-stone-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <p className="text-sm text-stone-600 mt-1">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-stone-900">{formatINR(order.total)}</p>
                  <span className={`inline-block mt-1 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[order.status] ?? 'bg-stone-100 text-stone-700'}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
