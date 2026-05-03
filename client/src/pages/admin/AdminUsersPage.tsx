import { useEffect, useState, useCallback } from 'react';
import { Search, User, Phone, Mail, Calendar, ShoppingBag } from 'lucide-react';
import api from '../../api/client';
import { formatINR } from '../../lib/format';
import Spinner from '../../components/Spinner';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  addresses: unknown[];
  createdAt: string;
}

interface OrderSummary {
  _id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
}

interface UserDetail {
  user: AdminUser;
  orders: OrderSummary[];
}

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  paid:      'bg-blue-100 text-blue-700',
  packed:    'bg-purple-100 text-purple-700',
  shipped:   'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selected, setSelected] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    api.get<{ users: AdminUser[]; total: number; page: number; pages: number }>(
      '/admin/users',
      { params: { page, limit: 20, search: search || undefined } },
    )
      .then((r) => {
        setUsers(r.data.users);
        setTotal(r.data.total);
        setPages(r.data.pages);
      })
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openDetail = (id: string) => {
    setDetailLoading(true);
    api.get<UserDetail>(`/admin/users/${id}`)
      .then((r) => setSelected(r.data))
      .finally(() => setDetailLoading(false));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Users</h1>
          <p className="text-sm text-stone-400 mt-0.5">{total} registered customers</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-5">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by name, email or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#C0392B] bg-white"
          />
        </div>
      </form>

      <div className="flex gap-6">
        {/* Users table */}
        <div className="flex-1 bg-white rounded-2xl border border-stone-100 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-24"><Spinner className="w-8 h-8" /></div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-stone-100">
                  <tr className="text-left text-stone-500">
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium hidden sm:table-cell">Email</th>
                    <th className="px-5 py-3 font-medium hidden md:table-cell">Phone</th>
                    <th className="px-5 py-3 font-medium hidden lg:table-cell">Joined</th>
                    <th className="px-5 py-3 font-medium">Addresses</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {users.map((u) => (
                    <tr
                      key={u._id}
                      onClick={() => openDetail(u._id)}
                      className={`hover:bg-orange-50/40 cursor-pointer transition-colors ${selected?.user._id === u._id ? 'bg-orange-50' : ''}`}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C0392B] to-[#E8891A] flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-stone-800">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-stone-500 hidden sm:table-cell">{u.email}</td>
                      <td className="px-5 py-3 text-stone-500 hidden md:table-cell">{u.phone}</td>
                      <td className="px-5 py-3 text-stone-400 text-xs hidden lg:table-cell">
                        {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3 text-stone-500">{(u.addresses as unknown[]).length}</td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-stone-400">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-stone-100">
                  <span className="text-xs text-stone-400">Page {page} of {pages}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 text-xs border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(pages, p + 1))}
                      disabled={page === pages}
                      className="px-3 py-1.5 text-xs border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Detail drawer */}
        {selected && (
          <div className="w-80 shrink-0 bg-white rounded-2xl border border-stone-100 p-5 self-start sticky top-6">
            {detailLoading ? (
              <div className="flex justify-center py-10"><Spinner className="w-7 h-7" /></div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C0392B] to-[#E8891A] flex items-center justify-center text-white text-lg font-bold">
                      {selected.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-stone-900">{selected.user.name}</p>
                      <span className="text-xs px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full">
                        {selected.user.role}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-stone-400 hover:text-stone-600 text-lg leading-none"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-2.5 text-sm mb-5">
                  <div className="flex items-center gap-2.5 text-stone-600">
                    <Mail size={13} className="text-stone-400 shrink-0" />
                    <span className="truncate">{selected.user.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-stone-600">
                    <Phone size={13} className="text-stone-400 shrink-0" />
                    {selected.user.phone}
                  </div>
                  <div className="flex items-center gap-2.5 text-stone-600">
                    <User size={13} className="text-stone-400 shrink-0" />
                    {(selected.user.addresses as unknown[]).length} saved address{(selected.user.addresses as unknown[]).length !== 1 ? 'es' : ''}
                  </div>
                  <div className="flex items-center gap-2.5 text-stone-600">
                    <Calendar size={13} className="text-stone-400 shrink-0" />
                    Joined {new Date(selected.user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingBag size={13} className="text-[#C0392B]" />
                    <span className="text-xs font-semibold text-stone-700 uppercase tracking-wide">Recent Orders</span>
                  </div>
                  {selected.orders.length === 0 ? (
                    <p className="text-xs text-stone-400 text-center py-4">No orders yet</p>
                  ) : (
                    <div className="space-y-2">
                      {selected.orders.map((o) => (
                        <div key={o._id} className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
                          <div>
                            <p className="text-xs font-bold text-stone-800">{o.orderNumber}</p>
                            <p className="text-xs text-stone-400">
                              {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold text-stone-800">{formatINR(o.total)}</p>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${STATUS_COLOR[o.status] ?? 'bg-stone-100 text-stone-600'}`}>
                              {o.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
