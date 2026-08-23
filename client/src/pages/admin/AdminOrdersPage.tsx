import { useEffect, useState } from 'react';
import { X, MapPin, Package, CreditCard, User as UserIcon } from 'lucide-react';
import api from '../../api/client';
import type { Order } from '../../types';
import { formatINR } from '../../lib/format';
import Spinner from '../../components/Spinner';

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  packed: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-stone-100 text-stone-700',
};

const NEXT_STATUS: Record<string, string> = {
  paid: 'packed',
  packed: 'shipped',
  shipped: 'delivered',
};

interface OrderCustomer {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

function OrderDetailModal({ order, onClose, onMarkStatus, updating }: {
  order: Order;
  onClose: () => void;
  onMarkStatus: (id: string, status: string) => void;
  updating: boolean;
}) {
  const customer = order.userId as unknown as OrderCustomer | string;
  const customerName = typeof customer === 'object' ? customer.name : null;
  const customerEmail = typeof customer === 'object' ? customer.email : null;
  const customerPhone = typeof customer === 'object' ? customer.phone : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-[#C41230] to-[#9B0E25] px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-bold text-white text-lg">{order.orderNumber}</h2>
            <p className="text-white/70 text-xs mt-0.5">
              {new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[order.status] ?? 'bg-stone-100'}`}>{order.status}</span>
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Customer */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-stone-400 mb-2 flex items-center gap-1.5"><UserIcon size={12} /> Customer</p>
            <div className="bg-stone-50 rounded-xl p-3.5 text-sm">
              <p className="font-semibold text-stone-800">{customerName ?? 'Unknown'}</p>
              {customerEmail && <p className="text-stone-500 text-xs mt-0.5">{customerEmail}</p>}
              {customerPhone && <p className="text-stone-500 text-xs">{customerPhone}</p>}
            </div>
          </div>

          {/* Address */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-stone-400 mb-2 flex items-center gap-1.5"><MapPin size={12} /> Delivery Address</p>
            <div className="bg-stone-50 rounded-xl p-3.5 text-sm text-stone-700">
              <p className="font-semibold">{order.address?.label}</p>
              <p>{order.address?.line1}{order.address?.line2 ? `, ${order.address.line2}` : ''}</p>
              <p>{order.address?.city}, {order.address?.state} — {order.address?.pincode}</p>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-stone-400 mb-2 flex items-center gap-1.5"><Package size={12} /> Items ({order.items.length})</p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-stone-50 rounded-xl p-3">
                  <div className="w-11 h-11 bg-red-50 rounded-lg overflow-hidden shrink-0">
                    {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">🍬</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{item.name}</p>
                    <p className="text-xs text-stone-400">Qty {item.qty} × {formatINR(item.unitPrice)}</p>
                  </div>
                  <span className="text-sm font-semibold text-stone-800 shrink-0">{formatINR(item.lineTotal)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-stone-400 mb-2">Price Details</p>
            <div className="bg-stone-50 rounded-xl p-3.5 text-sm space-y-1.5">
              <div className="flex justify-between text-stone-600"><span>Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
              {order.couponDiscount > 0 && (
                <div className="flex justify-between text-green-600"><span>Coupon {order.couponCode ? `(${order.couponCode})` : ''}</span><span>-{formatINR(order.couponDiscount)}</span></div>
              )}
              <div className="flex justify-between text-stone-600"><span>Shipping</span><span>{order.shippingFee === 0 ? 'FREE' : formatINR(order.shippingFee)}</span></div>
              <div className="flex justify-between text-stone-600"><span>GST</span><span>{formatINR(order.gst)}</span></div>
              <div className="flex justify-between font-bold text-stone-900 pt-1.5 border-t border-stone-200"><span>Total</span><span>{formatINR(order.total)}</span></div>
            </div>
          </div>

          {/* Payment */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-stone-400 mb-2 flex items-center gap-1.5"><CreditCard size={12} /> Payment</p>
            <div className="bg-stone-50 rounded-xl p-3.5 text-sm space-y-1 text-stone-600">
              <div className="flex justify-between"><span>Provider</span><span className="font-medium text-stone-800">{order.payment?.provider ?? '—'}</span></div>
              <div className="flex justify-between"><span>Status</span><span className="font-medium text-stone-800">{order.payment?.status ?? '—'}</span></div>
              {order.payment?.razorpayOrderId && <div className="flex justify-between"><span>Razorpay Order</span><span className="font-mono text-xs text-stone-500">{order.payment.razorpayOrderId}</span></div>}
              {order.payment?.razorpayPaymentId && <div className="flex justify-between"><span>Razorpay Payment</span><span className="font-mono text-xs text-stone-500">{order.payment.razorpayPaymentId}</span></div>}
              {order.payment?.paidAt && <div className="flex justify-between"><span>Paid At</span><span className="text-stone-800">{new Date(order.payment.paidAt).toLocaleString('en-IN')}</span></div>}
            </div>
          </div>
        </div>

        {NEXT_STATUS[order.status] && (
          <div className="px-6 py-4 border-t border-stone-100 shrink-0">
            <button
              onClick={() => onMarkStatus(order._id, NEXT_STATUS[order.status])}
              disabled={updating}
              className="w-full py-2.5 bg-gradient-to-r from-[#C41230] to-[#9B0E25] text-white rounded-xl text-sm font-bold hover:shadow-md transition-all disabled:opacity-60"
            >
              {updating ? 'Updating…' : `Mark as ${NEXT_STATUS[order.status]}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setError('');
    const params = statusFilter ? { status: statusFilter } : {};
    const res = await api.get<{ orders: Order[] }>('/admin/orders', { params });
    const fetched = res.data.orders ?? [];
    setOrders(fetched);
    setLoading(false);
    setSelected((prev) => (prev ? fetched.find((o) => o._id === prev._id) ?? prev : prev));
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    setError('');
    try {
      await api.patch(`/admin/orders/${id}/status`, { status });
      await fetchOrders();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? 'Failed to update status';
      setError(msg);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner className="w-10 h-10" /></div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Orders</h1>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-stone-200 rounded-xl text-sm bg-white focus:outline-none">
          <option value="">All Status</option>
          {['pending','paid','packed','shipped','delivered','cancelled','refunded'].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-100">
            <tr className="text-left text-stone-500">
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Items</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {orders.map((o) => (
              <tr key={o._id} onClick={() => setSelected(o)} className="hover:bg-stone-50 cursor-pointer">
                <td className="px-5 py-3 font-medium text-stone-900">{o.orderNumber}</td>
                <td className="px-5 py-3 text-stone-500">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                <td className="px-5 py-3 text-stone-600">{o.items.length}</td>
                <td className="px-5 py-3 font-semibold">{formatINR(o.total)}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[o.status] ?? 'bg-stone-100'}`}>{o.status}</span>
                </td>
                <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                  {NEXT_STATUS[o.status] && (
                    <button
                      onClick={() => updateStatus(o._id, NEXT_STATUS[o.status])}
                      disabled={updating === o._id}
                      className="text-xs px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating === o._id ? 'Updating…' : `Mark ${NEXT_STATUS[o.status]}`}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-stone-400">No orders found.</td></tr>}
          </tbody>
        </table>
      </div>

      {selected && (
        <OrderDetailModal
          order={selected}
          onClose={() => setSelected(null)}
          onMarkStatus={updateStatus}
          updating={updating === selected._id}
        />
      )}
    </div>
  );
}
