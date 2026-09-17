import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Star, ShoppingBag, ArrowRight, Heart } from 'lucide-react';

/* Storefront footer — "The Counter" redesign.
   Sits on the signature bottle-green display-case surface. Logo SVG untouched. */

export default function Footer() {
  return (
    <footer className="mt-24 sf-body sf-band-dark">

      {/* Brass hairline top border (varak) */}
      <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--sf-crimson), var(--sf-gold), var(--sf-crimson), transparent)' }} />

      <div className="relative">
        <div className="absolute inset-0 dot-grid-light pointer-events-none opacity-20" />

        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">

            {/* Brand column */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-5">
                {/* Oval VYAS logo — footer version, mark untouched */}
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
                  <text x="60" y="22" textAnchor="middle" fill="#F0CE6A" fontFamily="Fraunces, Georgia, serif" fontSize="9" fontStyle="italic" letterSpacing="0.8">Since 1951</text>
                  <text x="60" y="52" textAnchor="middle" fill="white" fontFamily="Fraunces, Georgia, serif" fontSize="30" fontWeight="900" letterSpacing="4">VYAS</text>
                  <text x="102" y="29" textAnchor="middle" fill="#F0CE6A" fontFamily="Arial, sans-serif" fontSize="9">®</text>
                </svg>
                <div>
                  <div className="sf-display font-bold text-white text-lg leading-none">
                    Vyas Sweets
                  </div>
                  <div className="sf-tag mt-1.5" style={{ color: 'var(--sf-marigold)', letterSpacing: '0.12em' }}>
                    &amp; Dryfruits · Mumbai
                  </div>
                </div>
              </div>

              <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(247,239,224,0.6)' }}>
                Ghee-roasted mithai, farsan &amp; dryfruits — handmade fresh every
                morning. Trusted by Mumbai families since 1951.
              </p>

              {/* Rating tickets */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: 'Delivery', value: '4.3' },
                  { label: 'Dining',   value: '4.1' },
                  { label: 'Reviews',  value: '1,172' },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl px-3 py-2 text-center"
                    style={{ background: 'var(--sf-dark-2)', border: '1px solid var(--sf-dark-line)' }}
                  >
                    <div className="flex items-center gap-1 justify-center">
                      {label !== 'Reviews' && <Star size={11} style={{ fill: 'var(--sf-marigold)', color: 'var(--sf-marigold)' }} />}
                      <span className="sf-num text-white font-medium text-sm">{value}</span>
                    </div>
                    <p className="sf-tag mt-1" style={{ color: 'rgba(247,239,224,0.45)', letterSpacing: '0.08em' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="sf-tag mb-5" style={{ color: 'var(--sf-gold)', letterSpacing: '0.16em' }}>
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
                      style={{ color: 'rgba(247,239,224,0.62)' }}
                    >
                      <ArrowRight
                        size={12}
                        style={{ color: 'var(--sf-marigold)' }}
                        className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all"
                      />
                      <span className="group-hover:text-white transition-colors">{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* What we offer */}
            <div>
              <h4 className="sf-tag mb-5" style={{ color: 'var(--sf-gold)', letterSpacing: '0.16em' }}>
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
                    style={{ background: 'var(--sf-dark-2)', border: '1px solid var(--sf-dark-line)', color: 'rgba(247,239,224,0.78)' }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="sf-tag mb-5" style={{ color: 'var(--sf-gold)', letterSpacing: '0.16em' }}>
                Visit Us
              </h4>
              <div className="space-y-4 text-sm">
                <a href="tel:+919869313539" className="flex items-center gap-3 group">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    style={{ background: 'var(--sf-crimson)' }}
                  >
                    <Phone size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="sf-num text-white font-medium group-hover:text-[var(--sf-marigold)] transition-colors">+91 98693 13539</p>
                    <p className="sf-tag" style={{ color: 'rgba(247,239,224,0.4)', letterSpacing: '0.06em' }}>Tap to call</p>
                  </div>
                </a>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'var(--sf-dark-2)', border: '1px solid var(--sf-dark-line)' }}>
                    <MapPin size={14} style={{ color: 'var(--sf-marigold)' }} />
                  </div>
                  <p className="leading-relaxed" style={{ color: 'rgba(247,239,224,0.6)' }}>
                    Station Road,<br />Goregaon West, Mumbai — 400 104
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--sf-dark-2)', border: '1px solid var(--sf-dark-line)' }}>
                    <Clock size={14} style={{ color: 'var(--sf-gold-light)' }} />
                  </div>
                  <p style={{ color: 'rgba(247,239,224,0.6)' }}>Opens 8:15 AM daily</p>
                </div>

                <Link
                  to="/category/all"
                  className="sf-btn sf-btn-primary flex w-full py-3.5 text-sm mt-2"
                >
                  <ShoppingBag size={14} /> Order Now
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs"
            style={{ borderTop: '1px solid var(--sf-dark-line)', color: 'rgba(247,239,224,0.35)' }}
          >
            <p className="sf-tag" style={{ letterSpacing: '0.04em', textTransform: 'none' }}>© {new Date().getFullYear()} Vyas Sweets and Dryfruits. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              Crafted with <Heart size={11} style={{ color: 'var(--sf-crimson)', fill: 'var(--sf-crimson)' }} /> in Mumbai, India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
