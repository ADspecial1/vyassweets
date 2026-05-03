import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, ShoppingBag, IndianRupee, Package,
  AlertTriangle, ArrowUpRight, Clock, CheckCircle2, Truck
} from 'lucide-react';
import api from '../../api/client';
import { formatINR } from '../../lib/format';
import Spinner from '../../components/Spinner';

interface DashboardData {
  today: { orders: number; revenue: number };
  week: { orders: number; revenue: number };
  month: { orders: number; revenue: number };
  topProducts: { name: string; qty: number }[];
  lowStock: { name: string; stock: number; _id: string }[];
  recentOrders: {
    _id: string; orderNumber: string; total: number;
    status: string; createdAt: string;
    userId?: { name?: string; email?: string };
  }[];
}

const STATUS_STYLE: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  pending:   { bg: 'bg-yellow-50',  text: 'text-yellow-700',  icon: <Clock size={12} /> },
  paid:      { bg: 'bg-blue-50',    text: 'text-blue-700',    icon: <CheckCircle2 size={12} /> },
  packed:    { bg: 'bg-purple-50',  text: 'text-purple-700',  icon: <Package size={12} /> },
  shipped:   { bg: 'bg-indigo-50',  text: 'text-indigo-700',  icon: <Truck size={12} /> },
  delivered: { bg: 'bg-green-50',   text: 'text-green-700',   icon: <CheckCircle2 size={12} /> },
  cancelled: { bg: 'bg-red-50',     text: 'text-red-700',     icon: <AlertTriangle size={12} /> },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? { bg: 'bg-stone-50', text: 'text-stone-600', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
      {s.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function KPICard({ label, value, sub, icon, gradient }: {
  label: string; value: string; sub: string;
  icon: React.ReactNode; gradient: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-orange-100 p-5 flex items-start justify-between overflow-hidden relative">
      <div>
        <p className="text-sm text-stone-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-[#2C1810]">{value}</p>
        <p className="text-xs text-stone-400 mt-1">{sub}</p>
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${gradient}`}>
        {icon}
      </div>
      <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-5 ${gradient}`} />
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<DashboardData>('/admin/dashboard')
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-24"><Spinner className="w-10 h-10" /></div>
  );

  return (
    <div className="p-5 md:p-8 max-w-6xl space-y-7">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2C1810]">Dashboard</h1>
          <p className="text-sm text-stone-400 mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link
          to="/admin/orders"
          className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#C0392B] bg-red-50 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors"
        >
          View Orders <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Today's Revenue"
          value={formatINR(data?.today.revenue ?? 0)}
          sub={`${data?.today.orders ?? 0} orders today`}
          icon={<IndianRupee size={20} />}
          gradient="bg-gradient-to-br from-[#C0392B] to-[#E8891A]"
        />
        <KPICard
          label="This Week"
          value={formatINR(data?.week.revenue ?? 0)}
          sub={`${data?.week.orders ?? 0} orders`}
          icon={<TrendingUp size={20} />}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <KPICard
          label="This Month"
          value={formatINR(data?.month.revenue ?? 0)}
          sub={`${data?.month.orders ?? 0} orders`}
          icon={<ShoppingBag size={20} />}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <KPICard
          label="Low Stock"
          value={String(data?.lowStock?.length ?? 0)}
          sub="products need restock"
          icon={<AlertTriangle size={20} />}
          gradient="bg-gradient-to-br from-orange-400 to-orange-500"
        />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Low stock */}
        <div className="bg-white rounded-2xl border border-orange-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#2C1810]">Low Stock Alert</h2>
            <Link to="/admin/products" className="text-xs text-[#C0392B] font-medium hover:underline">Manage →</Link>
          </div>
          {data?.lowStock && data.lowStock.length > 0 ? (
            <div className="space-y-3">
              {data.lowStock.map((p) => (
                <div key={p._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${p.stock === 0 ? 'bg-red-500' : 'bg-yellow-400'}`} />
                    <span className="text-sm text-stone-700 truncate">{p.name}</span>
                  </div>
                  <span className={`text-xs font-bold shrink-0 ml-2 ${p.stock === 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                    {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <CheckCircle2 size={28} className="text-green-400 mx-auto mb-2" />
              <p className="text-sm text-stone-400">All products well stocked!</p>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-orange-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#2C1810]">Top Products</h2>
            <span className="text-xs text-stone-400">Last 30 days</span>
          </div>
          {data?.topProducts && data.topProducts.length > 0 ? (
            <div className="space-y-3">
              {data.topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-stone-100 text-stone-600' : 'bg-orange-50 text-orange-600'}`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm text-stone-700 truncate">{p.name}</span>
                  <span className="text-xs font-bold text-stone-500">{p.qty} sold</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Package size={28} className="text-stone-300 mx-auto mb-2" />
              <p className="text-sm text-stone-400">No sales data yet</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-orange-100 p-5">
          <h2 className="font-bold text-[#2C1810] mb-4">Quick Actions</h2>
          <div className="space-y-2.5">
            {[
              { to: '/admin/products', label: 'Add New Product', icon: '📦', color: 'bg-blue-50 hover:bg-blue-100 text-blue-700' },
              { to: '/admin/categories', label: 'Add Category', icon: '🏷️', color: 'bg-purple-50 hover:bg-purple-100 text-purple-700' },
              { to: '/admin/banners', label: 'Manage Banners', icon: '🖼️', color: 'bg-green-50 hover:bg-green-100 text-green-700' },
              { to: '/admin/coupons', label: 'Create Coupon', icon: '🎫', color: 'bg-orange-50 hover:bg-orange-100 text-orange-700' },
              { to: '/admin/orders', label: 'View All Orders', icon: '🛍️', color: 'bg-red-50 hover:bg-red-100 text-red-700' },
            ].map(({ to, label, icon, color }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${color}`}
              >
                <span className="text-base">{icon}</span>
                {label}
                <ArrowUpRight size={13} className="ml-auto" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-orange-50">
          <h2 className="font-bold text-[#2C1810]">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm font-semibold text-[#C0392B] hover:underline flex items-center gap-1">
            View all <ArrowUpRight size={13} />
          </Link>
        </div>

        {data?.recentOrders && data.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-orange-50 bg-orange-50/50">
                  <th className="px-6 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wide">Order</th>
                  <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wide">Customer</th>
                  <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wide">Amount</th>
                  <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50">
                {data.recentOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-6 py-3.5">
                      <span className="font-mono text-xs font-bold text-[#2C1810] bg-orange-50 px-2 py-1 rounded-lg">{o.orderNumber}</span>
                    </td>
                    <td className="px-4 py-3.5 text-stone-600">{o.userId?.name ?? '—'}</td>
                    <td className="px-4 py-3.5 text-stone-500 text-xs">
                      {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-[#2C1810]">{formatINR(o.total)}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <ShoppingBag size={36} className="text-stone-200 mx-auto mb-3" />
            <p className="text-stone-400 font-medium">No orders yet</p>
            <p className="text-sm text-stone-300 mt-1">Orders will appear here once customers start buying</p>
          </div>
        )}
      </div>
    </div>
  );
}
