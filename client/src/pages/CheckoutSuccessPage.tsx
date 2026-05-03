import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { getOrderById } from '../api/orders';
import type { Order } from '../types';
import { formatINR } from '../lib/format';
import Spinner from '../components/Spinner';

export default function CheckoutSuccessPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      getOrderById(orderId).then(setOrder).finally(() => setLoading(false));
    }
  }, [orderId]);

  if (loading) return <div className="flex justify-center py-24"><Spinner className="w-10 h-10" /></div>;

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={52} className="text-green-500" />
      </div>

      <h1 className="text-2xl font-bold text-stone-900 mb-2">Order Placed!</h1>
      <p className="text-stone-500 mb-6">
        Thank you for your order. We'll start preparing it right away.
      </p>

      {order && (
        <div className="bg-white rounded-2xl border border-stone-100 p-5 text-left mb-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">Order Number</span>
            <span className="font-bold text-stone-900">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">Items</span>
            <span className="text-stone-700">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">Total Paid</span>
            <span className="font-bold text-green-600">{formatINR(order.total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">Delivery to</span>
            <span className="text-stone-700 text-right max-w-[60%]">
              {order.address?.city}, {order.address?.state}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Link
          to={`/orders/${orderId}`}
          className="flex items-center justify-center gap-2 bg-[#2C1810] text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-[#3d2118] transition-colors"
        >
          <Package size={18} /> Track Order
        </Link>
        <Link
          to="/"
          className="flex items-center justify-center gap-2 text-[#C0392B] font-medium hover:underline"
        >
          Continue Shopping <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
