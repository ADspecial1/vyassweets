import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag, User, LogOut, LayoutDashboard,
  Menu, X, ChevronDown, Package, Phone, MapPin, Clock, Star,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth';
import { useCartStore } from '../store/cart';
import { logout } from '../api/auth';

/* Storefront header — "The Counter" redesign.
   Slim bottle-green ticket strip over a ghee-paper bar that turns to white
   glass on scroll. Brand logo SVG is intentionally left untouched. */

const TICKER_ITEMS = [
  { icon: <ShoppingBag size={11} />, text: 'Free delivery above ₹500' },
  { icon: <Star     size={11} />, text: '4.3 · 1,172+ delivery reviews' },
  { icon: <MapPin   size={11} />, text: 'Station Road, Goregaon West' },
  { icon: <Clock    size={11} />, text: 'Open 8:15 AM daily' },
  { icon: <Phone    size={11} />, text: '+91 98693 13539' },
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
      <ellipse cx="60" cy="39" rx="58" ry="37" fill="#C41230" />
      <ellipse cx="60" cy="39" rx="58" ry="37" fill="none" stroke="url(#hdr-gold)" strokeWidth="3.5" />
      <text x="60" y="22" textAnchor="middle" fill="#F0CE6A" fontFamily="Fraunces, Georgia, serif" fontSize="9" fontStyle="italic" letterSpacing="0.8">Since 1951</text>
      <text x="60" y="52" textAnchor="middle" fill="white" fontFamily="Fraunces, Georgia, serif" fontSize="30" fontWeight="900" letterSpacing="4">VYAS</text>
      <text x="102" y="29" textAnchor="middle" fill="#F0CE6A" fontFamily="Arial, sans-serif" fontSize="9">®</text>
    </svg>
  );
}

function TopTicker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="sf-band-dark overflow-hidden py-1.5">
      <div className="animate-marquee whitespace-nowrap flex sf-tag" style={{ animationDuration: '38s', color: 'var(--sf-cream)' }}>
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 mx-6">
            <span style={{ color: 'var(--sf-marigold)' }}>{item.icon}</span>
            <span style={{ opacity: 0.85, textTransform: 'none', letterSpacing: '0.02em' }}>{item.text}</span>
            <span className="mx-4" style={{ color: 'var(--sf-gold)' }}>◆</span>
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
      className="sticky top-0 z-50 transition-all duration-300 sf-body"
      style={{
        background: scrolled ? 'rgba(250,246,239,0.86)' : 'var(--sf-paper)',
        backdropFilter: scrolled ? 'blur(14px)' : undefined,
        WebkitBackdropFilter: scrolled ? 'blur(14px)' : undefined,
        borderBottom: `1px solid ${scrolled ? 'var(--sf-line-2)' : 'var(--sf-line)'}`,
        boxShadow: scrolled ? '0 8px 30px -20px rgba(36,26,21,0.5)' : undefined,
      }}
    >
      <TopTicker />

      <div className="relative max-w-7xl mx-auto px-4 h-[72px] flex items-center justify-between gap-4">

        {/* Logo — mark left untouched */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group" onClick={() => setMenuOpen(false)}>
          <div className="group-hover:scale-105 transition-transform duration-200 shrink-0">
            <VyasLogo size={68} />
          </div>
          <div className="hidden sm:flex flex-col justify-center leading-none">
            <div className="sf-display text-[20px] font-bold leading-none" style={{ color: 'var(--sf-ink)' }}>
              Vyas Sweets
            </div>
            <div className="sf-tag mt-1.5 leading-none" style={{ color: 'var(--sf-crimson)', letterSpacing: '0.14em' }}>
              Mithai · Farsan · Dryfruits
            </div>
          </div>
        </Link>

        {/* Desktop nav — absolutely centered so it stays balanced regardless of
            logo / action widths */}
        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {[
            { to: '/',             label: 'Home' },
            { to: '/category/all', label: 'Shop' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
              style={{
                color: isActive(to) ? 'var(--sf-crimson)' : 'var(--sf-ink-soft)',
                background: isActive(to) ? 'rgba(194,18,48,0.07)' : 'transparent',
              }}
            >
              {label}
              {isActive(to) && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-full" style={{ background: 'var(--sf-crimson)' }} />
              )}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">

          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex items-center gap-2 px-3 py-2 rounded-full transition-colors group hover:bg-[rgba(194,18,48,0.06)]"
          >
            <div className="relative">
              <ShoppingBag size={20} style={{ color: 'var(--sf-ink)' }} className="group-hover:text-[#C21230] transition-colors" />
              {cartCount > 0 && (
                <span
                  className="sf-num absolute -top-1.5 -right-1.5 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium shadow-sm"
                  style={{ background: 'var(--sf-crimson)' }}
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-sm font-semibold transition-colors" style={{ color: 'var(--sf-ink-soft)' }}>
              Cart
            </span>
          </Link>

          {/* User dropdown */}
          {user ? (
            <div className="hidden md:block relative">
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full transition-colors hover:bg-[rgba(194,18,48,0.06)]"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-sm"
                  style={{ background: 'var(--sf-crimson)' }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--sf-ink)' }}>{user.name.split(' ')[0]}</span>
                <ChevronDown size={13} style={{ color: 'var(--sf-ink-soft)' }} className={`transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropOpen(false)} />
                  <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-white rounded-2xl shadow-2xl py-2 z-20 overflow-hidden animate-scale-in" style={{ border: '1px solid var(--sf-line)' }}>
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--sf-line)' }}>
                      <p className="text-sm font-bold" style={{ color: 'var(--sf-ink)' }}>{user.name}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--sf-ink-soft)' }}>{user.email}</p>
                    </div>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setDropOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors font-medium hover:bg-[rgba(194,18,48,0.06)]" style={{ color: 'var(--sf-ink-soft)' }}>
                        <LayoutDashboard size={14} /> Admin Panel
                      </Link>
                    )}
                    <Link to="/profile" onClick={() => setDropOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors font-medium hover:bg-[rgba(194,18,48,0.06)]" style={{ color: 'var(--sf-ink-soft)' }}>
                      <User size={14} /> My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setDropOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors font-medium hover:bg-[rgba(194,18,48,0.06)]" style={{ color: 'var(--sf-ink-soft)' }}>
                      <Package size={14} /> My Orders
                    </Link>
                    <div className="mt-1 pt-1" style={{ borderTop: '1px solid var(--sf-line)' }}>
                      <button onClick={handleLogout} className="flex items-center gap-2.5 px-4 py-2.5 text-sm w-full transition-colors font-medium hover:bg-[rgba(194,18,48,0.06)]" style={{ color: 'var(--sf-crimson)' }}>
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
                className="text-sm font-semibold px-4 py-2 rounded-full transition-colors hover:bg-[rgba(194,18,48,0.06)]"
                style={{ color: 'var(--sf-ink-soft)' }}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="sf-btn sf-btn-primary text-sm px-5 py-2.5"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2.5 rounded-full transition-colors hover:bg-[rgba(194,18,48,0.06)]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen
              ? <X    size={21} style={{ color: 'var(--sf-ink)' }} />
              : <Menu size={21} style={{ color: 'var(--sf-ink)' }} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-4 py-4 space-y-1 animate-fade-up" style={{ background: 'var(--sf-paper)', borderTop: '1px solid var(--sf-line)' }}>
          {[
            { to: '/',             label: 'Home' },
            { to: '/category/all', label: 'Shop All' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-semibold transition-colors"
              style={{
                background: isActive(to) ? 'rgba(194,18,48,0.07)' : 'transparent',
                color: isActive(to) ? 'var(--sf-crimson)' : 'var(--sf-ink)',
              }}
            >
              {label}
            </Link>
          ))}
          <div className="pt-3 mt-3" style={{ borderTop: '1px solid var(--sf-line)' }}>
            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2 mb-1">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
                    style={{ background: 'var(--sf-crimson)' }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--sf-ink)' }}>{user.name}</p>
                    <p className="text-xs" style={{ color: 'var(--sf-ink-soft)' }}>{user.email}</p>
                  </div>
                </div>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[rgba(194,18,48,0.06)]" style={{ color: 'var(--sf-ink)' }}>
                    <LayoutDashboard size={14} /> Admin Panel
                  </Link>
                )}
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[rgba(194,18,48,0.06)]" style={{ color: 'var(--sf-ink)' }}>
                  <User size={14} /> My Profile
                </Link>
                <Link to="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[rgba(194,18,48,0.06)]" style={{ color: 'var(--sf-ink)' }}>
                  <Package size={14} /> My Orders
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold w-full mt-1 hover:bg-[rgba(194,18,48,0.06)]" style={{ color: 'var(--sf-crimson)' }}>
                  <LogOut size={14} /> Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-3 px-4">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="sf-btn sf-btn-ghost flex-1 py-3 text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="sf-btn sf-btn-primary flex-1 py-3 text-sm"
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
