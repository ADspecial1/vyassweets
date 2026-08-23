import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Tag, Package, Image, Ticket,
  ShoppingBag, Users, LogOut, ChevronRight, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import { useAdminAuthStore } from '../../store/adminAuth';
import { adminLogout } from '../../api/auth';

const NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/categories', icon: Tag, label: 'Categories' },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/banners', icon: Image, label: 'Banners' },
  { to: '/admin/coupons', icon: Ticket, label: 'Coupons' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/users', icon: Users, label: 'Users' },
];

function Sidebar({ onClose }: { onClose?: () => void }) {
  const { pathname } = useLocation();
  const { user, setUser } = useAdminAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await adminLogout();
    setUser(null);
    navigate('/admin/login');
  };

  return (
    <div className="flex flex-col h-full bg-[#1A0F0A]">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-[#C0392B] to-[#E8891A] rounded-lg flex items-center justify-center text-base">🍬</div>
            <div>
              <div className="text-white font-bold text-sm">Vyas Sweets</div>
              <div className="text-[#E8891A] text-[10px] font-medium tracking-wider">ADMIN PANEL</div>
            </div>
          </Link>
          {onClose && (
            <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors p-1">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <p className="text-stone-600 text-[10px] font-bold uppercase tracking-widest px-5 mb-2">Menu</p>
        {NAV.map(({ to, icon: Icon, label, exact }) => {
          const active = exact ? pathname === to : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className={`flex items-center justify-between px-4 py-2.5 mx-2 rounded-xl text-sm font-medium transition-all mb-0.5 ${
                active
                  ? 'bg-gradient-to-r from-[#C0392B] to-[#E8891A] text-white shadow-sm'
                  : 'text-stone-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon size={16} />
                {label}
              </span>
              {active && <ChevronRight size={13} />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#C0392B] to-[#E8891A] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.charAt(0) ?? 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-stone-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-stone-400 hover:text-white text-sm transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-white/5"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-stone-100">
      {/* Desktop sidebar */}
      <aside className="w-60 shrink-0 fixed inset-y-0 left-0 z-40 hidden md:block">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 h-full">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 md:ml-60 min-h-screen flex flex-col">
        {/* Mobile topbar */}
        <div className="md:hidden bg-white border-b border-stone-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-stone-100 transition-colors">
            <Menu size={20} className="text-stone-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-[#C0392B] to-[#E8891A] rounded-lg flex items-center justify-center text-sm">🍬</div>
            <span className="font-bold text-[#2C1810] text-sm">Vyas Admin</span>
          </div>
        </div>

        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
