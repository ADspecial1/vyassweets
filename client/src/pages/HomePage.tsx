import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, ArrowRight,
  Truck, ChefHat, Leaf, ShieldCheck,
  Star, MapPin, Phone, Clock, Gift,
  ShoppingBag, Sparkles, Users, Award, Quote,
} from 'lucide-react';
import { getBanners, getCategories, getProducts } from '../api/catalog';
import type { Banner, Category, Product } from '../types';
import ProductCard from '../components/ProductCard';

/* ══════════════════════════════════════
   STATIC DATA
══════════════════════════════════════ */

const FEATURED_SWEETS = [
  {
    id: 1,
    name: 'Kaju Katli',
    hindi: 'काजू कतली',
    desc: 'Premium cashews, saffron & silver leaf — the jewel of Indian sweets.',
    from: '#FFF3E0', to: '#FFE0B2',
    accent: '#E8762A',
    dot: '#F4A261',
    icon: '🟡',
  },
  {
    id: 2,
    name: 'Besan Ladoo',
    hindi: 'बेसन लड्डू',
    desc: 'Roasted gram flour rounds in pure desi ghee with cardamom.',
    from: '#FFF0EC', to: '#FFDDD5',
    accent: '#E06B5A',
    dot: '#F7A8A8',
    icon: '🟠',
  },
  {
    id: 3,
    name: 'Kesar Barfi',
    hindi: 'केसर बर्फी',
    desc: 'Soft milk fudge infused with Kashmiri saffron and pistachios.',
    from: '#F0FBF5', to: '#D4EFE2',
    accent: '#5A9E78',
    dot: '#A8D5BA',
    icon: '🟢',
  },
  {
    id: 4,
    name: 'Gulab Jamun',
    hindi: 'गुलाब जामुन',
    desc: 'Melt-in-mouth dumplings soaked in rose and cardamom syrup.',
    from: '#FEF4FF', to: '#F9DEFF',
    accent: '#9B59B6',
    dot: '#D4A0EB',
    icon: '🟣',
  },
];

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    location: 'Goregaon West',
    rating: 5,
    text: 'Vyas Sweets has been our family tradition for 15 years. The Kaju Katli literally melts in your mouth — pure cashew magic you can\'t find anywhere else in Mumbai!',
    initials: 'PS',
    accent: '#F4A261',
  },
  {
    name: 'Rajesh Mehta',
    location: 'Andheri',
    rating: 5,
    text: 'Ordered Diwali gift boxes for our entire office. The packaging was gorgeous, and every single sweet was fresh and authentic. My colleagues were thoroughly impressed!',
    initials: 'RM',
    accent: '#A8D5BA',
  },
  {
    name: 'Sunita Patel',
    location: 'Borivali',
    rating: 5,
    text: 'The ladoos and namkeen are consistently excellent — fresh stock every morning and made with real desi ghee. My children now refuse sweets from anywhere else!',
    initials: 'SP',
    accent: '#F7A8A8',
  },
];

const CAT_COLORS: Record<string, string> = {
  sweets:     'from-amber-300 to-orange-400',
  mithai:     'from-amber-300 to-orange-400',
  barfi:      'from-pink-300 to-rose-400',
  ladoo:      'from-yellow-300 to-amber-400',
  halwa:      'from-orange-300 to-amber-400',
  namkeen:    'from-lime-300 to-green-400',
  chakli:     'from-teal-300 to-cyan-400',
  mixture:    'from-emerald-300 to-teal-400',
  chivda:     'from-yellow-200 to-yellow-400',
  'dry-fruit':'from-amber-400 to-orange-500',
  cookies:    'from-orange-200 to-amber-300',
  chocolate:  'from-stone-400 to-stone-600',
  gifts:      'from-purple-300 to-violet-500',
  snacks:     'from-green-300 to-emerald-400',
  upvas:      'from-sky-300 to-blue-400',
  farali:     'from-cyan-300 to-sky-400',
  bakery:     'from-amber-200 to-yellow-400',
};
function catGradient(slug: string) {
  return CAT_COLORS[slug] ?? 'from-[#F4A261] to-[#E8762A]';
}
function catInitials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

/* ══════════════════════════════════════
   HERO DECORATIVE ELEMENT
══════════════════════════════════════ */

function HeroDecoration() {
  const badges = [
    { name: 'Kaju Katli', sub: 'Cashew Fudge',    bg: '#FFF3E0', dot: '#F4A261', style: { top: '-20px', right: '20px'  } },
    { name: 'Besan Ladoo', sub: 'Pure Ghee',       bg: '#FFF0EC', dot: '#F7A8A8', style: { top: '50%',   right: '-24px', transform: 'translateY(-50%)' } },
    { name: 'Kesar Barfi', sub: 'Milk & Saffron',  bg: '#F0FBF5', dot: '#A8D5BA', style: { bottom: '0',  left: '-10px'  } },
  ];

  return (
    <div className="relative w-72 h-72 lg:w-80 lg:h-80 xl:w-96 xl:h-96 shrink-0 mx-auto lg:mx-0">
      {/* Outer dashed ring */}
      <div
        className="absolute inset-0 rounded-full border-2 border-dashed pointer-events-none"
        style={{ borderColor: 'rgba(244,162,97,0.2)', animation: 'spin-slow 30s linear infinite' }}
      />
      {/* Inner dashed ring */}
      <div
        className="absolute inset-10 rounded-full border border-dashed pointer-events-none"
        style={{ borderColor: 'rgba(168,213,186,0.25)', animation: 'spin-slow-rev 20s linear infinite' }}
      />

      {/* Main circle */}
      <div
        className="absolute inset-16 rounded-full flex items-center justify-center shadow-2xl"
        style={{ background: 'radial-gradient(circle at 35% 35%, #FFECD2, #FFD4A8)' }}
      >
        {/* Lotus / mandala center */}
        <div className="text-center select-none pointer-events-none">
          <div
            className="text-4xl font-black leading-none"
            style={{ fontFamily: 'Playfair Display, Georgia, serif', color: 'rgba(74,44,42,0.12)' }}
          >
            VS
          </div>
          <div className="text-[10px] font-bold tracking-widest uppercase mt-1" style={{ color: 'rgba(74,44,42,0.1)' }}>
            SWEETS
          </div>
        </div>
      </div>

      {/* Dot accents on ring */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const r = 50;
        const x = 50 + r * Math.cos((deg * Math.PI) / 180);
        const y = 50 + r * Math.sin((deg * Math.PI) / 180);
        return (
          <div
            key={deg}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left:   `${x}%`, top: `${y}%`,
              transform: 'translate(-50%, -50%)',
              background: deg % 90 === 0 ? '#F4A261' : 'rgba(244,162,97,0.3)',
            }}
          />
        );
      })}

      {/* Floating sweet badges */}
      {badges.map((badge) => (
        <div
          key={badge.name}
          className="absolute glass rounded-2xl shadow-xl px-3 py-2.5 flex items-center gap-2.5 animate-float-badge"
          style={{
            ...badge.style,
            background: badge.bg,
            border: '1px solid rgba(244,162,97,0.2)',
            animationDelay: badge.name === 'Kaju Katli' ? '0s' : badge.name === 'Besan Ladoo' ? '1.2s' : '2.4s',
          }}
        >
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: badge.dot }}
          />
          <div>
            <p className="text-[11px] font-bold text-[#4A2C2A] leading-tight">{badge.name}</p>
            <p className="text-[9px] text-[#7A5C5A]">{badge.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════
   DEFAULT HERO
══════════════════════════════════════ */

function DefaultHero() {
  return (
    <section
      className="relative overflow-hidden rounded-3xl"
      style={{
        background: 'linear-gradient(135deg, #FFF3E0 0%, #FFECD2 50%, #FFE0B2 100%)',
        minHeight: 560,
      }}
    >
      {/* Indian pattern overlay */}
      <div className="absolute inset-0 indian-pattern opacity-100 pointer-events-none" />

      {/* Soft orb accents */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 480, height: 480,
          top: -160, right: -100,
          background: 'radial-gradient(circle, rgba(244,162,97,0.18) 0%, transparent 70%)',
          animation: 'orb-drift 12s ease-in-out infinite',
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 360, height: 360,
          bottom: -120, left: -80,
          background: 'radial-gradient(circle, rgba(168,213,186,0.2) 0%, transparent 70%)',
          animation: 'orb-drift-2 15s ease-in-out infinite',
          animationDelay: '-5s',
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 px-8 md:px-14 py-14"
        style={{ minHeight: 560 }}
      >
        {/* Left: text */}
        <div className="flex-1 max-w-xl text-center lg:text-left">
          {/* Badge */}
          <div className="animate-fade-up d-0 inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full" style={{ background: 'rgba(244,162,97,0.12)', border: '1px solid rgba(244,162,97,0.25)' }}>
            <Sparkles size={12} style={{ color: '#E8762A' }} className="animate-glow-pulse" />
            <span className="text-xs font-bold tracking-wide" style={{ color: '#E8762A' }}>
              Premium Indian Sweets · Mumbai
            </span>
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-up d-1 leading-[1.1] mb-4"
            style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#4A2C2A' }}
          >
            <span className="block text-5xl md:text-6xl xl:text-7xl font-bold">Taste the</span>
            <span
              className="block text-5xl md:text-6xl xl:text-7xl font-black italic mt-1"
              style={{
                background: 'linear-gradient(135deg, #F4A261, #E8762A)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Tradition
            </span>
          </h1>

          {/* Hindi tagline */}
          <p
            className="animate-fade-up d-1 text-lg mb-3 font-medium tracking-wide"
            style={{ color: 'rgba(74,44,42,0.45)', fontFamily: 'serif' }}
          >
            मिठाई · नमकीन · ड्राईफ्रूट्स
          </p>

          {/* Subtext */}
          <p className="animate-fade-up d-2 text-base md:text-lg max-w-md mb-8 leading-relaxed" style={{ color: '#7A5C5A' }}>
            Handcrafted with pure desi ghee and ancestral recipes —
            fresh every morning at Station Road, Goregaon.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up d-3 flex flex-wrap gap-3 justify-center lg:justify-start mb-10">
            <Link
              to="/category/all"
              className="btn-shine inline-flex items-center gap-2.5 text-white font-black px-8 py-4 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.03] transition-all duration-200 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #F4A261, #E8762A)' }}
            >
              <ShoppingBag size={17} /> Explore Menu
            </Link>
            <a
              href="tel:+919869313539"
              className="inline-flex items-center gap-2.5 font-bold px-7 py-4 rounded-full transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: 'rgba(255,255,255,0.7)',
                border: '1.5px solid rgba(244,162,97,0.3)',
                color: '#4A2C2A',
              }}
            >
              <Phone size={15} style={{ color: '#F4A261' }} /> +91 98693 13539
            </a>
          </div>

          {/* Stats */}
          <div className="animate-fade-up d-4 flex flex-wrap gap-3 justify-center lg:justify-start">
            {[
              { icon: <Award  size={14} style={{ color: '#F4A261' }} />, value: '40+',    label: 'Years' },
              { icon: <Star   size={14} style={{ fill: '#F4A261', color: '#F4A261' }} />, value: '4.3★', label: 'Rating' },
              { icon: <Users  size={14} style={{ color: '#A8D5BA' }} />,                  value: '1,172', label: 'Reviews' },
              { icon: <Clock  size={14} style={{ color: '#F7A8A8' }} />,                  value: '8:15 AM', label: 'Daily Fresh' },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2.5 rounded-2xl px-4 py-2.5"
                style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(244,162,97,0.15)' }}
              >
                {s.icon}
                <div>
                  <p className="font-black text-sm leading-tight" style={{ color: '#4A2C2A' }}>{s.value}</p>
                  <p className="text-[10px] leading-tight" style={{ color: '#7A5C5A' }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: decorative */}
        <div className="animate-fade-up d-5 hidden lg:block">
          <HeroDecoration />
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════
   BANNER CAROUSEL
══════════════════════════════════════ */

function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (!banners.length) return <DefaultHero />;

  return (
    <div className="relative rounded-3xl overflow-hidden" style={{ minHeight: 320 }}>
      {banners.map((ban, i) => (
        <div
          key={ban._id ?? i}
          className="absolute inset-0 transition-all duration-700"
          style={{ opacity: i === idx ? 1 : 0, transform: i === idx ? 'scale(1)' : 'scale(1.04)', zIndex: i === idx ? 2 : 1 }}
        >
          <img src={ban.image} alt={ban.title ?? ''} className="w-full h-full object-cover" style={{ minHeight: 320 }} />
          <div className="absolute inset-0 bg-gradient-to-r from-[#4A2C2A]/60 via-[#4A2C2A]/20 to-transparent flex items-center px-8 md:px-16">
            <div style={{ opacity: i === idx ? 1 : 0, transition: 'opacity 0.5s 0.2s' }}>
              {ban.title && (
                <h2
                  className="text-white text-2xl md:text-4xl font-black mb-2"
                  style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                >
                  {ban.title}
                </h2>
              )}
              {ban.subtitle && <p className="text-white/85 text-base md:text-lg mb-5">{ban.subtitle}</p>}
              {ban.ctaText && ban.ctaLink && (
                <a
                  href={ban.ctaLink}
                  className="btn-shine inline-flex items-center gap-2 text-white font-black px-7 py-3 rounded-full hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  style={{ background: 'linear-gradient(135deg, #F4A261, #E8762A)' }}
                >
                  {ban.ctaText} <ArrowRight size={15} />
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
      {banners.length > 1 && (
        <>
          <button onClick={() => setIdx((i) => (i - 1 + banners.length) % banners.length)} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg hover:scale-110 transition-all">
            <ChevronLeft size={17} style={{ color: '#4A2C2A' }} />
          </button>
          <button onClick={() => setIdx((i) => (i + 1) % banners.length)} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg hover:scale-110 transition-all">
            <ChevronRight size={17} style={{ color: '#4A2C2A' }} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className="rounded-full transition-all duration-300"
                style={{ background: i === idx ? '#F4A261' : 'rgba(255,255,255,0.5)', width: i === idx ? '2rem' : '0.625rem', height: '0.625rem' }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   MARQUEE TICKER
══════════════════════════════════════ */

const TICKER = [
  'Kaju Katli', 'Gulab Jamun', 'Besan Ladoo', 'Soan Papdi', 'Kesar Barfi',
  'Chakli', 'Chivda', 'Dry Fruits', 'Halwa', 'Modak',
  'Rasmalai', 'Jalebi', 'Gift Boxes', 'Namkeen', 'Peda',
];

function MarqueeTicker() {
  const doubled = [...TICKER, ...TICKER];
  return (
    <div
      className="overflow-hidden rounded-2xl relative"
      style={{ background: 'linear-gradient(90deg, #FFF3E0, #FFECD2 50%, #FFF3E0)' }}
    >
      <div className="absolute left-0 inset-y-0 w-16 z-10" style={{ background: 'linear-gradient(90deg, #FFF3E0, transparent)' }} />
      <div className="absolute right-0 inset-y-0 w-16 z-10" style={{ background: 'linear-gradient(270deg, #FFF3E0, transparent)' }} />
      <div className="py-3.5 flex animate-marquee whitespace-nowrap" style={{ animationDuration: '32s' }}>
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center mx-5 text-sm font-bold" style={{ color: '#7A5C5A' }}>
            <span className="w-1.5 h-1.5 rounded-full mr-5 shrink-0" style={{ background: '#F4A261' }} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   STORE INFO BAR
══════════════════════════════════════ */

function StoreInfoBar() {
  return (
    <div
      className="animate-fade-up rounded-2xl border px-5 py-4 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-sm shadow-sm"
      style={{ background: '#fff', borderColor: 'rgba(244,162,97,0.2)' }}
    >
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1,2,3,4].map((s) => <Star key={s} size={13} style={{ fill: '#F4A261', color: '#F4A261' }} />)}
          <Star size={13} style={{ fill: 'rgba(244,162,97,0.35)', color: 'rgba(244,162,97,0.35)' }} />
        </div>
        <span className="font-black text-[#4A2C2A]">4.3</span>
        <span className="text-xs text-[#7A5C5A]">Delivery · 1,172 ratings</span>
      </div>

      <span className="text-orange-200 hidden md:block">|</span>

      <div className="flex items-center gap-1.5 text-[#7A5C5A]">
        <Star size={13} style={{ fill: '#F4A261', color: '#F4A261' }} />
        <span className="font-black text-[#4A2C2A]">4.1</span>
        <span className="text-xs text-[#7A5C5A]">Dining · 20 ratings</span>
      </div>

      <span className="text-orange-200 hidden md:block">|</span>

      <div className="flex items-center gap-1.5 text-[#7A5C5A]">
        <MapPin size={12} style={{ color: '#F4A261' }} className="shrink-0" />
        Station Road, Goregaon West, Mumbai
      </div>

      <span className="text-orange-200 hidden md:block">|</span>

      <div className="flex items-center gap-1.5 text-[#7A5C5A]">
        <Clock size={12} style={{ color: '#F4A261' }} className="shrink-0" />
        Opens 8:15 AM daily
      </div>

      <a
        href="tel:+919869313539"
        className="btn-shine ml-auto flex items-center gap-2 text-white text-xs font-black px-4 py-2.5 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all shrink-0"
        style={{ background: 'linear-gradient(135deg, #F4A261, #E8762A)' }}
      >
        <Phone size={12} /> +91 98693 13539
      </a>
    </div>
  );
}

/* ══════════════════════════════════════
   FEATURED SWEETS SHOWCASE (static)
══════════════════════════════════════ */

function FeaturedSweetsSection() {
  return (
    <section>
      <SectionHead
        title="Our Signature Sweets"
        titleHindi="हमारी खास मिठाइयाँ"
        sub="Timeless classics crafted with generations of expertise"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {FEATURED_SWEETS.map((sweet, i) => (
          <Link
            key={sweet.id}
            to="/category/all"
            className="sweet-card-hover animate-fade-up group rounded-3xl overflow-hidden flex flex-col"
            style={{
              background: `linear-gradient(135deg, ${sweet.from}, ${sweet.to})`,
              border: '1.5px solid rgba(74,44,42,0.07)',
              animationDelay: `${i * 0.07}s`,
            }}
          >
            {/* Icon area */}
            <div className="flex items-center justify-center pt-8 pb-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300"
                style={{ background: 'rgba(255,255,255,0.55)' }}
              >
                <div className="w-4 h-4 rounded-full" style={{ background: sweet.dot }} />
              </div>
            </div>

            {/* Text */}
            <div className="px-4 pb-5 flex-1 flex flex-col">
              <p className="text-[10px] font-semibold mb-0.5 tracking-wide" style={{ color: sweet.accent }}>
                {sweet.hindi}
              </p>
              <h3
                className="font-bold text-sm leading-snug text-[#4A2C2A] mb-1.5"
                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
              >
                {sweet.name}
              </h3>
              <p className="text-[11px] text-[#7A5C5A] leading-relaxed flex-1">{sweet.desc}</p>
              <div
                className="mt-3 flex items-center gap-1 text-[11px] font-bold group-hover:gap-2 transition-all"
                style={{ color: sweet.accent }}
              >
                Order Now <ArrowRight size={11} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════
   ABOUT SECTION
══════════════════════════════════════ */

function AboutSection() {
  return (
    <section
      className="relative overflow-hidden rounded-3xl"
      style={{ background: '#4A2C2A' }}
    >
      <div className="absolute inset-0 dot-grid-light pointer-events-none opacity-40" />

      {/* Warm orbs */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 350, height: 350,
          top: -100, right: -80,
          background: 'radial-gradient(circle, rgba(244,162,97,0.15) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 280, height: 280,
          bottom: -80, left: -60,
          background: 'radial-gradient(circle, rgba(168,213,186,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 grid md:grid-cols-2 gap-10 p-10 md:p-14">

        {/* Left: Story */}
        <div>
          <div
            className="inline-flex items-center gap-2 mb-5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide"
            style={{ background: 'rgba(244,162,97,0.12)', border: '1px solid rgba(244,162,97,0.2)', color: '#F4A261' }}
          >
            <Award size={11} /> Our Heritage
          </div>

          <h2
            className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
          >
            A Legacy of<br />
            <span
              style={{
                background: 'linear-gradient(135deg, #F4A261, #E8762A)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Sweetness
            </span>
          </h2>

          <p className="text-sm font-medium mb-2" style={{ color: 'rgba(255,243,224,0.45)' }}>
            मिठास की विरासत
          </p>

          <p className="text-[15px] leading-relaxed mb-5" style={{ color: 'rgba(255,243,224,0.65)' }}>
            For over four decades, Vyas Sweets has been weaving sweetness into
            the lives of Mumbai families. Every <em>मिठाई</em> we craft carries
            the warmth of tradition — made with pure desi ghee, hand-selected
            ingredients, and recipes passed down through generations.
          </p>

          <p className="text-[15px] leading-relaxed" style={{ color: 'rgba(255,243,224,0.55)' }}>
            From the bustling festivals of Diwali to the quiet joy of a Sunday
            morning, our sweets have been present at every celebration, every
            memory, every moment of your life.
          </p>
        </div>

        {/* Right: Pillars */}
        <div className="flex flex-col justify-center gap-4">
          {[
            { icon: <ChefHat size={18} />, title: 'Pure Desi Ghee',      desc: 'Every sweet crafted with 100% authentic desi ghee — no substitutes, no shortcuts.',     color: '#F4A261' },
            { icon: <Leaf    size={18} />, title: 'No Preservatives',     desc: 'Fresh daily. No artificial colours, flavours, or preservatives. Ever.',                 color: '#A8D5BA' },
            { icon: <Award   size={18} />, title: 'Traditional Recipes',  desc: 'Ancestral recipes refined over 40+ years, preserving the authentic taste of India.',    color: '#F7A8A8' },
            { icon: <Gift    size={18} />, title: 'Gift Packaging',        desc: 'Elegant presentation for every occasion — Diwali, weddings, birthdays & more.',         color: '#D4A017' },
          ].map((pillar) => (
            <div
              key={pillar.title}
              className="flex items-start gap-4 rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: `${pillar.color}20`, color: pillar.color }}
              >
                {pillar.icon}
              </div>
              <div>
                <h4 className="font-bold text-white text-sm mb-1">{pillar.title}</h4>
                <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,243,224,0.5)' }}>{pillar.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════
   FEATURES STRIP
══════════════════════════════════════ */

const FEATURES = [
  { icon: Truck,       title: 'Free Delivery',    desc: 'Orders above ₹500',      from: '#F4A261', to: '#E8762A' },
  { icon: ChefHat,     title: 'Made Fresh',        desc: 'Every morning at 8:15',  from: '#A8D5BA', to: '#7DC49A' },
  { icon: Leaf,        title: '100% Pure',         desc: 'No preservatives',       from: '#F7A8A8', to: '#E88888' },
  { icon: ShieldCheck, title: '4.3 ★ Rated',       desc: '1,172 delivery reviews', from: '#D4A017', to: '#B8860B' },
];

function FeatureStrip() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {FEATURES.map(({ icon: Icon, title, desc, from, to }, i) => (
        <div
          key={title}
          className="animate-fade-up bg-white rounded-2xl p-4 flex items-center gap-3.5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default group"
          style={{ border: '1px solid rgba(244,162,97,0.15)', animationDelay: `${i * 0.08}s` }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300"
            style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
          >
            <Icon size={19} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-[#4A2C2A]">{title}</p>
            <p className="text-xs text-[#7A5C5A] mt-0.5">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════
   SECTION HEADING
══════════════════════════════════════ */

function SectionHead({
  title, titleHindi, sub, to,
}: {
  title: string;
  titleHindi?: string;
  sub: string;
  to?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2
          className="text-2xl md:text-3xl font-black text-[#4A2C2A] leading-tight"
          style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
        >
          {title}
        </h2>
        {titleHindi && (
          <p className="text-sm font-medium mt-0.5" style={{ color: 'rgba(74,44,42,0.35)', fontFamily: 'serif' }}>
            {titleHindi}
          </p>
        )}
        <p className="text-sm text-[#7A5C5A] mt-1">{sub}</p>
      </div>
      {to && (
        <Link
          to={to}
          className="group flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full transition-all"
          style={{ color: '#E8762A', background: 'rgba(244,162,97,0.1)' }}
        >
          View all
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   CATEGORY CARD
══════════════════════════════════════ */

function CatCard({ cat, index }: { cat: Category; index: number }) {
  const gradient = catGradient(cat.slug);
  return (
    <Link
      to={`/category/${cat.slug}`}
      className="cat-card animate-fade-up group flex flex-col items-center gap-3 p-4 rounded-2xl"
      style={{
        background: '#fff',
        border: '1.5px solid rgba(244,162,97,0.15)',
        animationDelay: `${index * 0.055}s`,
      }}
    >
      <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0">
        {cat.image ? (
          <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-400" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <span className="text-white font-black text-xl tracking-tight drop-shadow">
              {catInitials(cat.name)}
            </span>
          </div>
        )}
      </div>
      <span className="text-xs font-bold text-[#7A5C5A] group-hover:text-[#E8762A] text-center transition-colors leading-snug">
        {cat.name}
      </span>
    </Link>
  );
}

/* ══════════════════════════════════════
   TESTIMONIALS SECTION
══════════════════════════════════════ */

function TestimonialsSection() {
  return (
    <section>
      <SectionHead
        title="Loved by Mumbai"
        titleHindi="मुंबई की पसंद"
        sub="What our customers say about Vyas Sweets"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {TESTIMONIALS.map((t, i) => (
          <div
            key={t.name}
            className="animate-fade-up rounded-3xl p-6 flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-300"
            style={{
              background: '#fff',
              border: '1.5px solid rgba(244,162,97,0.15)',
              boxShadow: '0 4px 24px rgba(74,44,42,0.06)',
              animationDelay: `${i * 0.1}s`,
            }}
          >
            {/* Quote icon */}
            <Quote size={24} style={{ color: t.accent, opacity: 0.5 }} />

            {/* Stars */}
            <div className="flex gap-0.5">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} size={14} style={{ fill: '#F4A261', color: '#F4A261' }} />
              ))}
            </div>

            {/* Text */}
            <p className="text-sm leading-relaxed text-[#7A5C5A] flex-1">
              "{t.text}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid rgba(244,162,97,0.12)' }}>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent}bb)` }}
              >
                {t.initials}
              </div>
              <div>
                <p className="text-sm font-bold text-[#4A2C2A]">{t.name}</p>
                <p className="text-[11px] text-[#7A5C5A] flex items-center gap-1">
                  <MapPin size={9} style={{ color: t.accent }} /> {t.location}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════
   GIFT CTA BANNER
══════════════════════════════════════ */

function GiftCTA() {
  return (
    <div
      className="relative overflow-hidden rounded-3xl"
      style={{
        background: 'linear-gradient(135deg, #FFECD2 0%, #FFD4A8 50%, #FFECD2 100%)',
        border: '1.5px solid rgba(244,162,97,0.25)',
      }}
    >
      <div className="absolute inset-0 indian-pattern opacity-50 pointer-events-none" />

      {/* Soft orbs */}
      <div className="absolute right-0 top-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(244,162,97,0.2) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute left-0 bottom-0 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(168,213,186,0.15) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 p-10 md:p-14">
        <div className="text-center md:text-left">
          <div
            className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full text-xs font-bold"
            style={{ background: 'rgba(74,44,42,0.08)', color: '#4A2C2A' }}
          >
            <Gift size={11} /> For Every Celebration
          </div>
          <h3
            className="text-[#4A2C2A] font-black text-3xl md:text-4xl leading-tight mb-3"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
          >
            Gift Your<br />
            <span style={{ background: 'linear-gradient(135deg, #E8762A, #D4A017)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Loved Ones
            </span>
          </h3>
          <p className="text-[15px] max-w-sm" style={{ color: '#7A5C5A' }}>
            Beautifully packed sweet gift boxes — perfect for Diwali, Holi,
            weddings &amp; birthdays.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 shrink-0">
          <Link
            to="/category/all"
            className="btn-shine text-white font-black text-base px-10 py-4 rounded-full shadow-xl hover:-translate-y-1 hover:scale-[1.04] transition-all duration-200 whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #F4A261, #E8762A)' }}
          >
            Shop Gift Boxes
          </Link>
          <a
            href="tel:+919869313539"
            className="text-sm font-semibold hover:text-[#E8762A] transition-colors flex items-center gap-1.5"
            style={{ color: 'rgba(74,44,42,0.55)' }}
          >
            <Phone size={12} /> Custom orders: +91 98693 13539
          </a>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   CONTACT SECTION
══════════════════════════════════════ */

function ContactSection() {
  return (
    <section>
      <SectionHead
        title="Find Us"
        titleHindi="हमारा पता"
        sub="Come visit us at our store in Goregaon West, Mumbai"
      />

      <div className="grid md:grid-cols-3 gap-5">
        {[
          {
            icon: <MapPin  size={20} />,
            title: 'Our Location',
            content: 'Station Road, Goregaon West, Mumbai — 400 104',
            action: { label: 'Get Directions', href: 'https://maps.google.com/?q=Vyas+Sweets+Goregaon+West+Mumbai' },
            color: '#F4A261',
            bg: '#FFF3E0',
          },
          {
            icon: <Phone   size={20} />,
            title: 'Call Us',
            content: '+91 98693 13539\nFreshest sweets every morning',
            action: { label: 'Call Now', href: 'tel:+919869313539' },
            color: '#A8D5BA',
            bg: '#F0FBF5',
          },
          {
            icon: <Clock   size={20} />,
            title: 'Store Hours',
            content: 'Opens 8:15 AM daily\nFresh stock every morning',
            action: { label: 'Order Online', href: '/category/all' },
            color: '#F7A8A8',
            bg: '#FFF5F5',
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-3xl p-6 flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-300"
            style={{ background: item.bg, border: `1.5px solid ${item.color}30` }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
              style={{ background: `linear-gradient(135deg, ${item.color}22, ${item.color}44)`, color: item.color }}
            >
              {item.icon}
            </div>
            <div>
              <h4
                className="font-bold text-[#4A2C2A] mb-1.5"
                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
              >
                {item.title}
              </h4>
              <p className="text-sm text-[#7A5C5A] leading-relaxed whitespace-pre-line">{item.content}</p>
            </div>
            <a
              href={item.action.href}
              className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold transition-all"
              style={{ color: item.color }}
            >
              {item.action.label} <ArrowRight size={13} />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════
   EMPTY STATE
══════════════════════════════════════ */

function EmptyState() {
  return (
    <div className="text-center py-24">
      <div
        className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-5 shadow-xl animate-bounce-soft"
        style={{ background: 'linear-gradient(135deg, #F4A261, #E8762A)' }}
      >
        <ShoppingBag size={32} className="text-white" />
      </div>
      <h2
        className="text-2xl font-black text-[#4A2C2A] mb-2"
        style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
      >
        Coming Soon!
      </h2>
      <p className="text-[#7A5C5A] mb-6">We're stocking up with fresh products.</p>
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-2 text-sm font-bold hover:underline"
        style={{ color: '#E8762A' }}
      >
        Add products from admin <ArrowRight size={14} />
      </Link>
    </div>
  );
}

/* ══════════════════════════════════════
   LOADING SPINNER
══════════════════════════════════════ */

function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-36 gap-5">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-orange-100 border-t-[#F4A261] animate-spin" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-b-[#A8D5BA] animate-spin-slow-rev" />
        <div
          className="absolute inset-0 flex items-center justify-center"
        >
          <div
            className="w-8 h-8 rounded-full animate-pulse-ring"
            style={{ background: 'linear-gradient(135deg, #F4A261, #E8762A)' }}
          />
        </div>
      </div>
      <div className="text-center">
        <p
          className="font-black text-[#4A2C2A]"
          style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
        >
          Vyas Sweets
        </p>
        <p className="text-[#7A5C5A] text-sm mt-0.5">Loading fresh goodness…</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════ */

/** Wraps a promise with a hard timeout so it always settles. */
function withTimeout<T>(p: Promise<T>, ms = 8000): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms),
    ),
  ]);
}

export default function HomePage() {
  const [banners,     setBanners]     = useState<Banner[]>([]);
  const [categories,  setCategories]  = useState<Category[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [apiReady,    setApiReady]    = useState(false);

  useEffect(() => {
    let alive = true;

    Promise.allSettled([
      withTimeout(getBanners()),
      withTimeout(getCategories()),
      withTimeout(getProducts({ limit: 8, sort: 'newest' })),
    ]).then(([b, c, p]) => {
      if (!alive) return;
      if (b.status === 'fulfilled') setBanners(b.value);
      if (c.status === 'fulfilled') setCategories(c.value);
      if (p.status === 'fulfilled') setNewArrivals(p.value.items.slice(0, 8));
    }).finally(() => {
      if (alive) setApiReady(true);
    });

    return () => { alive = false; };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-12 overflow-x-hidden">

      {/* 1. Hero */}
      <BannerCarousel banners={banners} />

      {/* Ticker */}
      <MarqueeTicker />

      {/* Store info */}
      <StoreInfoBar />

      {/* 2. Featured Sweets showcase */}
      <FeaturedSweetsSection />

      {/* Warm divider */}
      <div className="divider-warm" />

      {/* 3. About / Heritage */}
      <AboutSection />

      {/* 4. Features */}
      <FeatureStrip />

      {/* 5. Categories + 6. Products — skeleton while API loads */}
      {!apiReady ? (
        <div className="flex flex-col items-center gap-3 py-10">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-orange-100 border-t-[#F4A261] animate-spin" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-b-[#A8D5BA] animate-spin-slow-rev" />
          </div>
          <p className="text-sm text-[#7A5C5A]">Loading fresh products…</p>
        </div>
      ) : (
        <>
          {/* 5. Categories */}
          {categories.length > 0 && (
            <section>
              <SectionHead
                title="Shop by Category"
                titleHindi="श्रेणी के अनुसार"
                sub="34 categories · 427+ products"
                to="/category/all"
              />
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {categories.slice(0, 12).map((cat, i) => (
                  <CatCard key={cat._id} cat={cat} index={i} />
                ))}
              </div>
            </section>
          )}

          {/* 6. Menu / Products */}
          {newArrivals.length > 0 && (
            <section>
              <SectionHead
                title="Popular Picks"
                titleHindi="लोकप्रिय उत्पाद"
                sub="Loved by 1,172+ satisfied customers"
                to="/category/all"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {newArrivals.map((p, i) => (
                  <div
                    key={p._id}
                    className="product-card-hover animate-fade-up"
                    style={{ animationDelay: `${i * 0.065}s` }}
                  >
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {categories.length === 0 && newArrivals.length === 0 && <EmptyState />}
        </>
      )}

      {/* Divider */}
      <div className="divider-warm" />

      {/* 7. Testimonials */}
      <TestimonialsSection />

      {/* 8. Gift CTA */}
      <GiftCTA />

      {/* 9. Contact */}
      <ContactSection />

      {/* Bottom strip */}
      <div className="flex items-center justify-center gap-2 text-xs pb-2" style={{ color: 'rgba(74,44,42,0.4)' }}>
        <MapPin size={11} style={{ color: '#F4A261' }} />
        Serving Mumbai since generations · Station Road, Goregaon West · Open 8:15 AM daily
      </div>
    </div>
  );
}
