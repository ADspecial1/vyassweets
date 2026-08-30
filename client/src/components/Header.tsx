import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag, User, LogOut, LayoutDashboard,
  Menu, X, ChevronDown, Package, Phone, MapPin, Clock, Sparkles,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth';
import { useCartStore } from '../store/cart';
import { logout } from '../api/auth';

const TICKER_ITEMS = [
  { icon: <ShoppingBag size={11} />, text: 'Free delivery above ₹500' },
  { icon: <Phone    size={11} />, text: '+91 98693 13539' },
  { icon: <MapPin   size={11} />, text: 'Station Road, Goregaon West, Mumbai' },
  { icon: <Clock    size={11} />, text: 'Opens 8:15 AM daily' },
  { icon: <Sparkles size={11} />, text: '★ 4.3 Rated · 1,172+ Delivery Reviews' },
];

function VyasLogo({ size = 72 }: { size?: number }) {
  const h = Math.round(size * 0.65);
  return (
    <svg
      viewBox="0 0 120 78"
      width={size}
      height={h}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Vyas Sweets logo"
    >
      <defs>
        <linearGradient id="hdr-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#F0CE6A" />
          <stop offset="45%"  stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#B8962A" />
        </linearGradient>
      </defs>
      {/* outer gold ring */}
      <ellipse cx="60" cy="39" rx="58" ry="37" fill="#C41230" />
      <ellipse cx="60" cy="39" rx="58" ry="37" fill="none" stroke="url(#hdr-gold)" strokeWidth="3.5" />
      {/* Since 1951 */}
      <text
        x="60" y="22"
        textAnchor="middle"
        fill="#F0CE6A"
        fontFamily="Fraunces, Georgia, serif"
        fontSize="9"
        fontStyle="italic"
        letterSpacing="0.8"
      >
        Since 1951
      </text>
      {/* VYAS */}
      <text
        x="60" y="52"
        textAnchor="middle"
        fill="white"
        fontFamily="Fraunces, Georgia, serif"
        fontSize="30"
        fontWeight="900"
        letterSpacing="4"
      >
        VYAS
      </text>
      {/* ® */}
      <text
        x="102" y="29"
        textAnchor="middle"
        fill="#F0CE6A"
        fontFamily="Arial, sans-serif"
        fontSize="9"
      >
        ®
      </text>
    </svg>
  );
}

function TopTicker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div
      className="overflow-hidden text-[11px] font-semibold py-2"
      style={{ background: 'linear-gradient(90deg, #C41230, #9B0E25)', color: '#fff' }}
    >
      <div className="animate-marquee whitespace-nowrap flex" style={{ animationDuration: '32s' }}>
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 mx-7">
            {item.icon}
            {item.text}
            <span className="mx-5 text-white/40 font-light">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Header() {
  const { user, setUser } = useAuthStore();
  const items    = useCartStore((s) => s.items);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate('/login');
    setMenuOpen(false);
    setDropOpen(false);
  };

  const cartCount = items.reduce((sum, i) => sum + i.qty, 0);
  const isActive  = (path: string) => location.pathname === path;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-md shadow-red-100/60'
          : 'bg-[#FBF4E9]'
      } border-b border-red-100`}
    >
      <TopTicker />

      <div className="max-w-6xl mx-auto px-4 h-[66px] flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group" onClick={() => setMenuOpen(false)}>
          <div className="group-hover:scale-105 transition-transform duration-200 drop-shadow-md">
            <VyasLogo size={72} />
          </div>
          <div className="leading-tight hidden sm:block">
            <div
              className="font-black text-[#1A0808] text-[15px] tracking-tight"
              style={{ fontFamily: 'Fraunces, Georgia, serif' }}
            >
              Vyas Sweets
            </div>
            <div className="text-[9px] font-bold tracking-[0.12em] uppercase text-[#C41230]">
              &amp; Dryfruits · Mumbai
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {[
            { to: '/',             label: 'Home' },
            { to: '/category/all', label: 'Shop' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive(to)
                  ? 'text-[#C41230] bg-red-50'
                  : 'text-[#5C1818] hover:text-[#C41230] hover:bg-red-50/70'
              }`}
            >
              {label}
              {isActive(to) && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#C41230]" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">

          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors group"
          >
            <div className="relative">
              <ShoppingBag size={20} className="text-[#5C1818] group-hover:text-[#C41230] transition-colors" />
              {cartCount > 0 && (
                <span
                  className="animate-pulse-ring-red absolute -top-1.5 -right-1.5 text-white text-[9px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-black shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #C41230, #9B0E25)' }}
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-sm font-semibold text-[#5C1818] group-hover:text-[#C41230] transition-colors">
              Cart
            </span>
          </Link>

          {/* User dropdown */}
          {user ? (
            <div className="hidden md:block relative">
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-black shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #C41230, #9B0E25)' }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-[#1A0808]">{user.name.split(' ')[0]}</span>
                <ChevronDown size={13} className={`text-[#5C1818] transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropOpen(false)} />
                  <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-white border border-red-100 rounded-2xl shadow-2xl shadow-red-100/40 py-2 z-20 overflow-hidden animate-scale-in">
                    <div className="px-4 py-3 border-b border-red-50">
                      <p className="text-sm font-bold text-[#1A0808]">{user.name}</p>
                      <p className="text-xs text-[#5C1818] truncate">{user.email}</p>
                    </div>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setDropOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#5C1818] hover:bg-red-50 hover:text-[#C41230] transition-colors font-medium">
                        <LayoutDashboard size={14} /> Admin Panel
                      </Link>
                    )}
                    <Link to="/profile" onClick={() => setDropOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#5C1818] hover:bg-red-50 hover:text-[#C41230] transition-colors font-medium">
                      <User size={14} /> My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setDropOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#5C1818] hover:bg-red-50 hover:text-[#C41230] transition-colors font-medium">
                      <Package size={14} /> My Orders
                    </Link>
                    <div className="border-t border-red-50 mt-1 pt-1">
                      <button onClick={handleLogout} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#C41230] hover:bg-red-50 w-full transition-colors font-medium">
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-semibold text-[#5C1818] hover:text-[#C41230] px-3 py-2 rounded-xl hover:bg-red-50 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn-shine text-white text-sm font-black px-5 py-2.5 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                style={{ background: 'linear-gradient(135deg, #C41230, #9B0E25)' }}
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2.5 rounded-xl hover:bg-red-50 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen
              ? <X    size={21} className="text-[#1A0808]" />
              : <Menu size={21} className="text-[#1A0808]" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#FBF4E9] border-t border-red-100 px-4 py-4 space-y-1 animate-fade-up">
          {[
            { to: '/',             label: 'Home' },
            { to: '/category/all', label: 'Shop All' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                isActive(to)
                  ? 'bg-red-50 text-[#C41230]'
                  : 'text-[#1A0808] hover:bg-red-50'
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="border-t border-red-100 pt-3 mt-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2 mb-1">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black shadow-sm"
                    style={{ background: 'linear-gradient(135deg, #C41230, #9B0E25)' }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1A0808]">{user.name}</p>
                    <p className="text-xs text-[#5C1818]">{user.email}</p>
                  </div>
                </div>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#1A0808] hover:bg-red-50">
                    <LayoutDashboard size={14} /> Admin Panel
                  </Link>
                )}
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#1A0808] hover:bg-red-50">
                  <User size={14} /> My Profile
                </Link>
                <Link to="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#1A0808] hover:bg-red-50">
                  <Package size={14} /> My Orders
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#C41230] hover:bg-red-50 w-full mt-1">
                  <LogOut size={14} /> Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-3 px-4">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center py-3 border-2 border-[#C41230] text-[#C41230] rounded-xl text-sm font-bold hover:bg-red-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center py-3 text-white rounded-xl text-sm font-black hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #C41230, #9B0E25)' }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
