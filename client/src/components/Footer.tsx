import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Star, ShoppingBag, ArrowRight, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20" style={{ background: '#4A2C2A' }}>

      {/* Warm gradient top border */}
      <div className="h-1" style={{ background: 'linear-gradient(90deg, transparent, #F4A261, #A8D5BA, #F7A8A8, #F4A261, transparent)' }} />

      {/* Subtle pattern overlay */}
      <div className="relative">
        <div className="absolute inset-0 dot-grid-light pointer-events-none opacity-30" />

        <div className="relative max-w-6xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">

            {/* Brand column */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="relative shrink-0">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #F4A261, #E8762A)' }}
                  >
                    <span
                      className="text-white font-black text-base tracking-tight"
                      style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                    >
                      VS
                    </span>
                  </div>
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2"
                    style={{ background: 'linear-gradient(135deg, #A8D5BA, #7DC49A)', borderColor: '#4A2C2A' }}
                  />
                </div>
                <div>
                  <div
                    className="font-black text-white text-base leading-tight"
                    style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                  >
                    Vyas Sweets
                  </div>
                  <div className="text-[9px] font-bold tracking-[0.14em] uppercase" style={{ color: '#F4A261' }}>
                    &amp; Dryfruits · Mumbai
                  </div>
                </div>
              </div>

              <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,243,224,0.55)' }}>
                Authentic Indian sweets &amp; snacks crafted with pure desi ghee every morning.
                Trusted by Mumbai families for generations.
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
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(244,162,97,0.12)' }}
                  >
                    <div className="flex items-center gap-1 justify-center">
                      {label !== 'Reviews' && <Star size={11} style={{ fill: '#F4A261', color: '#F4A261' }} />}
                      <span className="text-white font-black text-sm">{value}</span>
                    </div>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,243,224,0.4)' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4
                className="text-white font-bold mb-5 text-xs uppercase tracking-widest"
                style={{ color: 'rgba(255,243,224,0.6)' }}
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
                      style={{ color: 'rgba(255,243,224,0.5)' }}
                    >
                      <ArrowRight
                        size={12}
                        style={{ color: '#F4A261' }}
                        className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all"
                      />
                      <span className="group-hover:text-[#F4A261] transition-colors">{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* What we offer */}
            <div>
              <h4
                className="font-bold mb-5 text-xs uppercase tracking-widest"
                style={{ color: 'rgba(255,243,224,0.6)' }}
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
                    style={{ background: 'rgba(244,162,97,0.1)', color: 'rgba(244,162,97,0.8)' }}
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
                style={{ color: 'rgba(255,243,224,0.6)' }}
              >
                Visit Us
              </h4>
              <div className="space-y-4 text-sm">
                <a href="tel:+919869313539" className="flex items-center gap-3 group">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    style={{ background: 'linear-gradient(135deg, #F4A261, #E8762A)' }}
                  >
                    <Phone size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold group-hover:text-[#F4A261] transition-colors">+91 98693 13539</p>
                    <p className="text-[11px]" style={{ color: 'rgba(255,243,224,0.35)' }}>Tap to call</p>
                  </div>
                </a>

                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'rgba(255,255,255,0.07)' }}
                  >
                    <MapPin size={14} style={{ color: '#A8D5BA' }} />
                  </div>
                  <p className="leading-relaxed" style={{ color: 'rgba(255,243,224,0.5)' }}>
                    Station Road,<br />Goregaon West, Mumbai
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(255,255,255,0.07)' }}
                  >
                    <Clock size={14} style={{ color: '#F7A8A8' }} />
                  </div>
                  <p style={{ color: 'rgba(255,243,224,0.5)' }}>Opens 8:15 AM daily</p>
                </div>

                <Link
                  to="/category/all"
                  className="btn-shine flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-black text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg mt-2"
                  style={{ background: 'linear-gradient(135deg, #F4A261, #E8762A)', color: '#fff' }}
                >
                  <ShoppingBag size={14} /> Order Now
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs"
            style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,243,224,0.25)' }}
          >
            <p>© {new Date().getFullYear()} Vyas Sweets and Dryfruits. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              Crafted with <Heart size={11} style={{ color: '#F7A8A8', fill: '#F7A8A8' }} /> in Mumbai, India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
