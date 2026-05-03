import { useEffect, useState } from 'react';
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = () => {
    const params = statusFilter ? { status: statusFilter } : {};
    api.get<{ orders: Order[] }>('/admin/orders', { params }).then((r) => setOrders(r.data.orders ?? [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/admin/orders/${id}/status`, { status });
    fetchOrders();
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
              <tr key={o._id} className="hover:bg-stone-50">
                <td className="px-5 py-3 font-medium text-stone-900">{o.orderNumber}</td>
                <td className="px-5 py-3 text-stone-500">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                <td className="px-5 py-3 text-stone-600">{o.items.length}</td>
                <td className="px-5 py-3 font-semibold">{formatINR(o.total)}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[o.status] ?? 'bg-stone-100'}`}>{o.status}</span>
                </td>
                <td className="px-5 py-3">
                  {NEXT_STATUS[o.status] && (
                    <button
                      onClick={() => updateStatus(o._id, NEXT_STATUS[o.status])}
                      className="text-xs px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-medium transition-colors"
                    >
                      Mark {NEXT_STATUS[o.status]}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-stone-400">No orders found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
