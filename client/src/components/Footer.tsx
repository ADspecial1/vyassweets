import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Star, ShoppingBag, ArrowRight, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20" style={{ background: '#1A0808' }}>

      {/* Brand-colour top border */}
      <div className="h-1" style={{ background: 'linear-gradient(90deg, transparent, #C41230, #D4AF37, #F0CE6A, #C41230, transparent)' }} />

      {/* Subtle pattern overlay */}
      <div className="relative">
        <div className="absolute inset-0 dot-grid-light pointer-events-none opacity-30" />

        <div className="relative max-w-6xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">

            {/* Brand column */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-5">
                {/* Oval VYAS logo — footer version */}
                <svg viewBox="0 0 120 78" width="72" height="47" xmlns="http://www.w3.org/2000/svg" aria-label="Vyas logo">
                  <defs>
                    <linearGradient id="ftr-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%"   stopColor="#F0CE6A" />
                      <stop offset="45%"  stopColor="#D4AF37" />
                      <stop offset="100%" stopColor="#B8962A" />
                    </linearGradient>
                  </defs>
                  <ellipse cx="60" cy="39" rx="58" ry="37" fill="#C41230" />
                  <ellipse cx="60" cy="39" rx="58" ry="37" fill="none" stroke="url(#ftr-gold)" strokeWidth="3.5" />
                  <text x="60" y="22" textAnchor="middle" fill="#F0CE6A" fontFamily="Playfair Display, Georgia, serif" fontSize="9" fontStyle="italic" letterSpacing="0.8">Since 1951</text>
                  <text x="60" y="52" textAnchor="middle" fill="white" fontFamily="Playfair Display, Georgia, serif" fontSize="30" fontWeight="900" letterSpacing="4">VYAS</text>
                  <text x="102" y="29" textAnchor="middle" fill="#F0CE6A" fontFamily="Arial, sans-serif" fontSize="9">®</text>
                </svg>
                <div>
                  <div
                    className="font-black text-white text-base leading-tight"
                    style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                  >
                    Vyas Sweets
                  </div>
                  <div className="text-[9px] font-bold tracking-[0.14em] uppercase" style={{ color: '#D4AF37' }}>
                    &amp; Dryfruits · Mumbai
                  </div>
                </div>
              </div>

              <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,248,240,0.55)' }}>
                Authentic Indian sweets &amp; snacks crafted with pure desi ghee every morning.
                Trusted by Mumbai families since 1951.
              </p>

              {/* Rating badges */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: 'Delivery', value: '4.3' },
                  { label: 'Dining',   value: '4.1' },
                  { label: 'Reviews',  value: '1,172' },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl px-3 py-2 text-center"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,175,55,0.18)' }}
                  >
                    <div className="flex items-center gap-1 justify-center">
                      {label !== 'Reviews' && <Star size={11} style={{ fill: '#D4AF37', color: '#D4AF37' }} />}
                      <span className="text-white font-black text-sm">{value}</span>
                    </div>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,248,240,0.4)' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4
                className="text-white font-bold mb-5 text-xs uppercase tracking-widest"
                style={{ color: 'rgba(255,248,240,0.6)' }}
              >
                Quick Links
              </h4>
              <ul className="space-y-3 text-sm">
                {[
                  { to: '/',             label: 'Home' },
                  { to: '/category/all', label: 'Shop All' },
                  { to: '/cart',         label: 'My Cart' },
                  { to: '/orders',       label: 'My Orders' },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="flex items-center gap-2 font-medium transition-colors group"
                      style={{ color: 'rgba(255,248,240,0.5)' }}
                    >
                      <ArrowRight
                        size={12}
                        style={{ color: '#D4AF37' }}
                        className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all"
                      />
                      <span className="group-hover:text-[#D4AF37] transition-colors">{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* What we offer */}
            <div>
              <h4
                className="font-bold mb-5 text-xs uppercase tracking-widest"
                style={{ color: 'rgba(255,248,240,0.6)' }}
              >
                What We Offer
              </h4>
              <div className="flex flex-wrap gap-2">
                {[
                  'Mithai', 'Namkeen', 'Gujarati', 'Maharashtrian',
                  'Bengali', 'Halwa', 'Bakery', 'Dry Fruits',
                  'Gift Boxes', 'Khakhra', 'Sugar-Free',
                ].map((c) => (
                  <span
                    key={c}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(196,18,48,0.15)', color: 'rgba(240,206,106,0.85)' }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4
                className="font-bold mb-5 text-xs uppercase tracking-widest"
                style={{ color: 'rgba(255,248,240,0.6)' }}
              >
                Visit Us
              </h4>
              <div className="space-y-4 text-sm">
                <a href="tel:+919869313539" className="flex items-center gap-3 group">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    style={{ background: 'linear-gradient(135deg, #C41230, #9B0E25)' }}
                  >
                    <Phone size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold group-hover:text-[#D4AF37] transition-colors">+91 98693 13539</p>
                    <p className="text-[11px]" style={{ color: 'rgba(255,248,240,0.35)' }}>Tap to call</p>
                  </div>
                </a>

                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'rgba(255,255,255,0.07)' }}
                  >
                    <MapPin size={14} style={{ color: '#D4AF37' }} />
                  </div>
                  <p className="leading-relaxed" style={{ color: 'rgba(255,248,240,0.5)' }}>
                    Station Road,<br />Goregaon West, Mumbai
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(255,255,255,0.07)' }}
                  >
                    <Clock size={14} style={{ color: '#F0CE6A' }} />
                  </div>
                  <p style={{ color: 'rgba(255,248,240,0.5)' }}>Opens 8:15 AM daily</p>
                </div>

                <Link
                  to="/category/all"
                  className="btn-shine flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-black text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg mt-2"
                  style={{ background: 'linear-gradient(135deg, #C41230, #9B0E25)', color: '#fff' }}
                >
                  <ShoppingBag size={14} /> Order Now
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs"
            style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,248,240,0.25)' }}
          >
            <p>© {new Date().getFullYear()} Vyas Sweets and Dryfruits. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              Crafted with <Heart size={11} style={{ color: '#C41230', fill: '#C41230' }} /> in Mumbai, India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
