import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChefHat, Leaf,
  Star, MapPin, Phone, Clock, Gift,
  ShoppingBag, Award, Quote,
} from 'lucide-react';
import { getCategories, getProducts } from '../api/catalog';
import type { Category, Product } from '../types';
import { formatINR } from '../lib/format';
import { useCartStore } from '../store/cart';
import ProductCard from '../components/ProductCard';
import Reveal from '../components/Reveal';
import Tilt from '../components/Tilt';
import { ReelsShowcase } from '../components/VideoShowcase';
import { VyasHeroCarousel, VyasWideBanner, VyasRibbonBanner, OrnamentStrip } from '../components/VyasBanners';
import CinematicHero from '../components/CinematicHero';

/* ══════════════════════════════════════
   STATIC DATA
══════════════════════════════════════ */

const FEATURED_SWEETS = [
  {
    id: 1,
    name: 'Kaju Katli',
    hindi: 'काजू कतली',
    desc: 'Premium cashews, saffron & silver leaf — the jewel of Indian sweets.',
    accent: '#C41230',
    dot: '#C41230',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Kaju_Katri.jpg/280px-Kaju_Katri.jpg',
    emoji: '🍬',
  },
  {
    id: 2,
    name: 'Besan Ladoo',
    hindi: 'बेसन लड्डू',
    desc: 'Roasted gram flour rounds in pure desi ghee with cardamom.',
    accent: '#B8962A',
    dot: '#D4AF37',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Besan_laddu.jpg/280px-Besan_laddu.jpg',
    emoji: '🟤',
  },
  {
    id: 3,
    name: 'Kesar Barfi',
    hindi: 'केसर बर्फी',
    desc: 'Soft milk fudge infused with Kashmiri saffron and pistachios.',
    accent: '#9B0E25',
    dot: '#C41230',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Burfi.jpg/280px-Burfi.jpg',
    emoji: '🍰',
  },
  {
    id: 4,
    name: 'Gulab Jamun',
    hindi: 'गुलाब जामुन',
    desc: 'Melt-in-mouth dumplings soaked in rose and cardamom syrup.',
    accent: '#D4AF37',
    dot: '#F0CE6A',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Gulab_jamun_%28culture%29.jpg/280px-Gulab_jamun_%28culture%29.jpg',
    emoji: '🫘',
  },
];

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    location: 'Goregaon West',
    rating: 5,
    text: 'Vyas Sweets has been our family tradition for 15 years. The Kaju Katli literally melts in your mouth — pure cashew magic you can\'t find anywhere else in Mumbai!',
    initials: 'PS',
    accent: '#C41230',
  },
  {
    name: 'Rajesh Mehta',
    location: 'Andheri',
    rating: 5,
    text: 'Ordered Diwali gift boxes for our entire office. The packaging was gorgeous, and every single sweet was fresh and authentic. My colleagues were thoroughly impressed!',
    initials: 'RM',
    accent: '#D4AF37',
  },
  {
    name: 'Sunita Patel',
    location: 'Borivali',
    rating: 5,
    text: 'The ladoos and namkeen are consistently excellent — fresh stock every morning and made with real desi ghee. My children now refuse sweets from anywhere else!',
    initials: 'SP',
    accent: '#9B0E25',
  },
];

/* Category image map using Wikimedia Commons public-domain food photos */
const CATEGORY_IMAGES: Record<string, string> = {
  sweets:       'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Kaju_Katri.jpg/200px-Kaju_Katri.jpg',
  mithai:       'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Kaju_Katri.jpg/200px-Kaju_Katri.jpg',
  ladoo:        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Besan_laddu.jpg/200px-Besan_laddu.jpg',
  barfi:        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Burfi.jpg/200px-Burfi.jpg',
  halwa:        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Suji-Halwa.jpg/200px-Suji-Halwa.jpg',
  namkeen:      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Chakli.jpg/200px-Chakli.jpg',
  chakli:       'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Chakli.jpg/200px-Chakli.jpg',
  'dry-fruit':  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Mixed_nuts_and_dry_fruits.jpg/200px-Mixed_nuts_and_dry_fruits.jpg',
  bakery:       'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Assorted_Indian_cookies.jpg/200px-Assorted_Indian_cookies.jpg',
  rasgulla:     'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Rasgulla.jpg/200px-Rasgulla.jpg',
  modak:        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Modak_3.jpg/200px-Modak_3.jpg',
};

const CAT_COLORS: Record<string, string> = {
  sweets:      'from-red-400 to-rose-600',
  mithai:      'from-red-400 to-rose-600',
  barfi:       'from-rose-300 to-red-500',
  ladoo:       'from-amber-400 to-yellow-500',
  halwa:       'from-orange-400 to-amber-500',
  namkeen:     'from-lime-400 to-green-500',
  chakli:      'from-teal-400 to-cyan-500',
  mixture:     'from-emerald-400 to-teal-500',
  chivda:      'from-yellow-300 to-amber-400',
  'dry-fruit': 'from-amber-500 to-orange-600',
  cookies:     'from-orange-300 to-amber-400',
  chocolate:   'from-stone-500 to-stone-700',
  gifts:       'from-purple-400 to-violet-600',
  snacks:      'from-green-400 to-emerald-500',
  upvas:       'from-sky-400 to-blue-500',
  farali:      'from-cyan-400 to-sky-500',
  bakery:      'from-amber-300 to-yellow-500',
};
function catGradient(slug: string) {
  return CAT_COLORS[slug] ?? 'from-[#C41230] to-[#9B0E25]';
}
function catInitials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
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
      style={{ background: 'linear-gradient(90deg, #FBF4E9, #F5E7D0 50%, #FBF4E9)' }}
    >
      <div className="absolute left-0 inset-y-0 w-16 z-10" style={{ background: 'linear-gradient(90deg, #FBF4E9, transparent)' }} />
      <div className="absolute right-0 inset-y-0 w-16 z-10" style={{ background: 'linear-gradient(270deg, #FBF4E9, transparent)' }} />
      <div className="py-3.5 flex animate-marquee whitespace-nowrap" style={{ animationDuration: '32s' }}>
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center mx-5 text-sm font-bold" style={{ color: '#5C1818' }}>
            <span className="w-1.5 h-1.5 rounded-full mr-5 shrink-0" style={{ background: '#C41230' }} />
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
      style={{ background: '#fff', borderColor: 'rgba(196,18,48,0.15)' }}
    >
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1,2,3,4].map((s) => <Star key={s} size={13} style={{ fill: '#D4AF37', color: '#D4AF37' }} />)}
          <Star size={13} style={{ fill: 'rgba(212,175,55,0.35)', color: 'rgba(212,175,55,0.35)' }} />
        </div>
        <span className="font-black text-[#1A0808]">4.3</span>
        <span className="text-xs text-[#5C1818]">Delivery · 1,172 ratings</span>
      </div>

      <span className="text-red-200 hidden md:block">|</span>

      <div className="flex items-center gap-1.5 text-[#5C1818]">
        <Star size={13} style={{ fill: '#D4AF37', color: '#D4AF37' }} />
        <span className="font-black text-[#1A0808]">4.1</span>
        <span className="text-xs text-[#5C1818]">Dining · 20 ratings</span>
      </div>

      <span className="text-red-200 hidden md:block">|</span>

      <div className="flex items-center gap-1.5 text-[#5C1818]">
        <MapPin size={12} style={{ color: '#C41230' }} className="shrink-0" />
        Station Road, Goregaon West, Mumbai
      </div>

      <span className="text-red-200 hidden md:block">|</span>

      <div className="flex items-center gap-1.5 text-[#5C1818]">
        <Clock size={12} style={{ color: '#C41230' }} className="shrink-0" />
        Opens 8:15 AM daily
      </div>

      <a
        href="tel:+919869313539"
        className="btn-shine ml-auto flex items-center gap-2 text-white text-xs font-black px-4 py-2.5 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all shrink-0"
        style={{ background: 'linear-gradient(135deg, #C41230, #9B0E25)' }}
      >
        <Phone size={12} /> +91 98693 13539
      </a>
    </div>
  );
}

/* ══════════════════════════════════════
   FEATURED SWEETS SHOWCASE
   Live from backend (featured=true products),
   falls back to static cards when none exist.
══════════════════════════════════════ */

/* One editorial tile — full-bleed photo, serif name laid over it like a
   display-case card. `large` gets the confident type. No two the same size. */
type MosaicItem = {
  key: string;
  to: string;
  img?: string;
  name: string;
  sub?: string;
  price?: number;
  onAdd?: () => void;
};

function MosaicCard({ item }: { item: MosaicItem }) {
  return (
    <Link
      to={item.to}
      className="group relative block w-full overflow-hidden rounded-3xl"
      style={{ aspectRatio: '4 / 5', border: '1px solid rgba(26,8,8,0.06)' }}
    >
      {item.img ? (
        <img
          src={item.img}
          alt={item.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.05]"
          onError={(e) => { e.currentTarget.style.opacity = '0'; }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(150deg,#FBF4E9,#F5E7D0)' }}>
          <div className="absolute inset-0 indian-pattern opacity-60" />
          <span
            className="font-display leading-none select-none"
            style={{ fontSize: '6rem', color: 'rgba(196,18,48,0.14)' }}
            aria-hidden="true"
          >
            {item.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* readability wash rising from the base */}
      <div className="absolute inset-0" style={{
        background: item.img
          ? 'linear-gradient(0deg, rgba(26,8,8,0.84) 0%, rgba(26,8,8,0.22) 46%, transparent 70%)'
          : 'linear-gradient(0deg, rgba(126,10,29,0.10), transparent 60%)',
      }} />

      {/* Signature badge, top-left */}
      <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm text-white tracking-wide"
        style={{ background: 'linear-gradient(135deg, #C41230, #9B0E25)' }}>
        Signature
      </span>

      {/* Add button, top-right (live products only) */}
      {item.onAdd && (
        <button
          onClick={(e) => { e.preventDefault(); item.onAdd?.(); }}
          aria-label={`Add ${item.name} to cart`}
          className="btn-shine absolute top-2.5 right-2.5 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95 hover:-translate-y-0.5 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          style={{ background: 'linear-gradient(135deg, #C41230, #9B0E25)' }}
        >
          <ShoppingBag size={13} /> Add
        </button>
      )}

      {/* Name + meta, laid over the base of the photo */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col p-4">
        {item.sub && (
          <p className="tnum uppercase tracking-wide text-white/70 mb-1 text-[10px]">
            {item.sub}
          </p>
        )}
        <h3 className={`font-display font-semibold text-white leading-tight text-lg ${item.img ? '' : '!text-[#7E0A1D]'}`}>
          {item.name}
        </h3>
        <div className="flex items-center justify-between gap-2 mt-2">
          {item.price != null ? (
            <span className="tnum font-display font-semibold text-white text-sm">
              {formatINR(item.price)}
            </span>
          ) : <span />}
          <span className="inline-flex items-center gap-1 font-semibold text-white/90 group-hover:gap-2 transition-all text-xs">
            {item.price != null ? 'View' : 'Order now'} <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* A clean four-up showcase — each card self-sizes via aspect-ratio so it can
   never collapse, and tilts on hover. */
function FeaturedMosaic({ items }: { items: MosaicItem[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((it, i) => (
        <div key={it.key} className="animate-fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
          <Tilt max={7} lift={10} className="h-full rounded-3xl">
            <MosaicCard item={it} />
          </Tilt>
        </div>
      ))}
    </div>
  );
}

function FeaturedSweetsSection({ featured }: { featured: Product[] }) {
  const addItem = useCartStore((s) => s.addItem);

  // surface products that actually have a photo first, so the showcase leads
  // with imagery when any exists in the catalogue
  const ordered = [...featured].sort(
    (a, b) => (b.images?.[0] ? 1 : 0) - (a.images?.[0] ? 1 : 0),
  );

  const items: MosaicItem[] = featured.length > 0
    ? ordered.slice(0, 4).map((p) => ({
        key: p._id,
        to: `/product/${p.slug}`,
        img: p.images[0],
        name: p.name,
        sub: `Net ${p.weight}${p.unit}`,
        price: p.price,
        onAdd: p.stock === 0 ? undefined : () => addItem(p._id),
      }))
    : FEATURED_SWEETS.slice(0, 4).map((s) => ({
        key: String(s.id),
        to: '/category/all',
        img: s.image,
        name: s.name,
        sub: s.hindi,
      }));

  return (
    <section>
      <SectionHead
        title="Our Signature Sweets"
        titleHindi="हमारी खास मिठाइयाँ"
        sub="Timeless classics crafted with generations of expertise"
        to="/category/all"
      />
      <FeaturedMosaic items={items} />
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
      style={{ background: '#1A0808' }}
    >
      <div className="absolute inset-0 dot-grid-light pointer-events-none opacity-40" />

      {/* Orbs */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 350, height: 350,
          top: -100, right: -80,
          background: 'radial-gradient(circle, rgba(196,18,48,0.15) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 280, height: 280,
          bottom: -80, left: -60,
          background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 grid md:grid-cols-2 gap-10 p-10 md:p-14">

        {/* Left: Story */}
        <div>
          <div
            className="inline-flex items-center gap-2 mb-5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide"
            style={{ background: 'rgba(196,18,48,0.12)', border: '1px solid rgba(196,18,48,0.25)', color: '#C41230' }}
          >
            <Award size={11} /> Our Heritage
          </div>

          <h2
            className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight"
            style={{ fontFamily: 'Fraunces, Georgia, serif' }}
          >
            A Legacy of<br />
            <span
              style={{
                background: 'linear-gradient(135deg, #C41230, #9B0E25)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Sweetness
            </span>
          </h2>

          <p className="text-sm font-medium mb-2" style={{ color: 'rgba(255,248,240,0.45)' }}>
            मिठास की विरासत
          </p>

          <p className="text-[15px] leading-relaxed mb-5" style={{ color: 'rgba(255,248,240,0.65)' }}>
            Since 1951, Vyas Sweets has been weaving sweetness into
            the lives of Mumbai families. Every <em>मिठाई</em> we craft carries
            the warmth of tradition — made with pure desi ghee, hand-selected
            ingredients, and recipes passed down through generations.
          </p>

          <p className="text-[15px] leading-relaxed" style={{ color: 'rgba(255,248,240,0.55)' }}>
            From the bustling festivals of Diwali to the quiet joy of a Sunday
            morning, our sweets have been present at every celebration, every
            memory, every moment of your life.
          </p>
        </div>

        {/* Right: what we promise — a quiet ledger, hairline-ruled, not boxed */}
        <div className="flex flex-col justify-center">
          {[
            { icon: <ChefHat size={16} />, title: 'Pure Desi Ghee',     desc: 'Every sweet crafted with 100% authentic desi ghee — no substitutes, no shortcuts.',   color: '#C41230' },
            { icon: <Leaf    size={16} />, title: 'No Preservatives',    desc: 'Fresh daily. No artificial colours, flavours, or preservatives. Ever.',               color: '#D4AF37' },
            { icon: <Award   size={16} />, title: 'Traditional Recipes', desc: 'Ancestral recipes refined over 70+ years, preserving the authentic taste of India.',   color: '#F0CE6A' },
            { icon: <Gift    size={16} />, title: 'Gift Packaging',      desc: 'Elegant presentation for every occasion — Diwali, weddings, birthdays & more.',       color: '#D4AF37' },
          ].map((pillar, i) => (
            <div
              key={pillar.title}
              className="flex items-start gap-4 py-4"
              style={i > 0 ? { borderTop: '1px solid rgba(255,255,255,0.09)' } : undefined}
            >
              <span className="shrink-0 mt-1" style={{ color: pillar.color }}>{pillar.icon}</span>
              <div>
                <h4 className="font-display font-semibold text-white text-base mb-1">{pillar.title}</h4>
                <p className="text-[12.5px] leading-relaxed" style={{ color: 'rgba(255,248,240,0.5)' }}>{pillar.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
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
    <div className="flex items-end justify-between gap-4 mb-7">
      <div>
        {titleHindi && (
          <p className="eyebrow mb-2" style={{ fontFamily: 'serif', letterSpacing: '0.05em', textTransform: 'none', color: 'rgba(196,18,48,0.75)', fontSize: '0.9rem' }}>
            {titleHindi}
          </p>
        )}
        <h2 className="font-display text-3xl md:text-[2.5rem] font-semibold text-[#1A0808] leading-[1.05]">
          {title}
        </h2>
        <div className="rule-draw w-14 mt-3 mb-2.5" />
        <p className="text-sm text-[#5C1818]">{sub}</p>
      </div>
      {to && (
        <Link
          to={to}
          className="group shrink-0 flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-all hover:gap-2.5"
          style={{ color: '#C41230', background: 'rgba(196,18,48,0.08)' }}
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
  // Use admin-set image first, then Wikimedia fallback, then gradient
  const imageSrc = cat.image || CATEGORY_IMAGES[cat.slug];

  return (
    <div className="animate-fade-up" style={{ animationDelay: `${index * 0.055}s` }}>
    <Tilt max={9} lift={10} className="rounded-2xl h-full">
    <Link
      to={`/category/${cat.slug}`}
      className="group flex flex-col items-center gap-3 p-4 rounded-2xl h-full"
      style={{
        background: '#fff',
        border: '1.5px solid rgba(196,18,48,0.12)',
      }}
    >
      <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={cat.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
              const fallback = img.nextElementSibling as HTMLElement | null;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className={`${imageSrc ? 'hidden' : ''} w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
          style={{ display: imageSrc ? 'none' : undefined }}
        >
          <span className="text-white font-black text-xl tracking-tight drop-shadow">
            {catInitials(cat.name)}
          </span>
        </div>
      </div>
      <span className="text-xs font-bold text-[#5C1818] group-hover:text-[#C41230] text-center transition-colors leading-snug">
        {cat.name}
      </span>
    </Link>
    </Tilt>
    </div>
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
          <div key={t.name} className="animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
          <Tilt
            max={7}
            lift={10}
            className="rounded-3xl p-6 flex flex-col gap-4 h-full"
            style={{
              background: '#fff',
              border: '1.5px solid rgba(196,18,48,0.12)',
              boxShadow: '0 4px 24px rgba(26,8,8,0.05)',
            }}
          >
            {/* Quote icon */}
            <Quote size={24} style={{ color: t.accent, opacity: 0.5 }} />

            {/* Stars */}
            <div className="flex gap-0.5">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} size={14} style={{ fill: '#D4AF37', color: '#D4AF37' }} />
              ))}
            </div>

            {/* Text */}
            <p className="text-sm leading-relaxed text-[#5C1818] flex-1">
              "{t.text}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid rgba(196,18,48,0.1)' }}>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent}bb)` }}
              >
                {t.initials}
              </div>
              <div>
                <p className="text-sm font-bold text-[#1A0808]">{t.name}</p>
                <p className="text-[11px] text-[#5C1818] flex items-center gap-1">
                  <MapPin size={9} style={{ color: t.accent }} /> {t.location}
                </p>
              </div>
            </div>
          </Tilt>
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
        background: 'linear-gradient(135deg, #FBF4E9 0%, #F5E7D0 50%, #FBF4E9 100%)',
        border: '1.5px solid rgba(196,18,48,0.15)',
      }}
    >
      <div className="absolute inset-0 indian-pattern opacity-50 pointer-events-none" />
      <div className="absolute inset-0 paper-grain pointer-events-none" />

      {/* Soft orbs */}
      <div className="absolute right-0 top-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(196,18,48,0.1) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute left-0 bottom-0 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 p-10 md:p-14">
        <div className="text-center md:text-left">
          <div
            className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full text-xs font-bold"
            style={{ background: 'rgba(26,8,8,0.06)', color: '#1A0808' }}
          >
            <Gift size={11} /> For Every Celebration
          </div>
          <h3
            className="text-[#1A0808] font-black text-3xl md:text-4xl leading-tight mb-3"
            style={{ fontFamily: 'Fraunces, Georgia, serif' }}
          >
            Gift Your<br />
            <span style={{ background: 'linear-gradient(135deg, #C41230, #D4AF37)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Loved Ones
            </span>
          </h3>
          <p className="text-[15px] max-w-sm" style={{ color: '#5C1818' }}>
            Beautifully packed sweet gift boxes — perfect for Diwali, Holi,
            weddings &amp; birthdays.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 shrink-0">
          <Link
            to="/category/all"
            className="btn-shine text-white font-black text-base px-10 py-4 rounded-full shadow-xl hover:-translate-y-1 hover:scale-[1.04] transition-all duration-200 whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #C41230, #9B0E25)' }}
          >
            Shop Gift Boxes
          </Link>
          <a
            href="tel:+919869313539"
            className="text-sm font-semibold hover:text-[#C41230] transition-colors flex items-center gap-1.5"
            style={{ color: 'rgba(26,8,8,0.5)' }}
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
            icon: <MapPin size={20} />,
            title: 'Our Location',
            content: 'Station Road, Goregaon West, Mumbai — 400 104',
            action: { label: 'Get Directions', href: 'https://maps.google.com/?q=Vyas+Sweets+Goregaon+West+Mumbai' },
            color: '#C41230',
            bg: '#FFF0F2',
          },
          {
            icon: <Phone size={20} />,
            title: 'Call Us',
            content: '+91 98693 13539\nFreshest sweets every morning',
            action: { label: 'Call Now', href: 'tel:+919869313539' },
            color: '#D4AF37',
            bg: '#FFFBF0',
          },
          {
            icon: <Clock size={20} />,
            title: 'Store Hours',
            content: 'Opens 8:15 AM daily\nFresh stock every morning',
            action: { label: 'Order Online', href: '/category/all' },
            color: '#B8962A',
            bg: '#FFFBF0',
          },
        ].map((item) => (
          <Tilt
            key={item.title}
            max={7}
            lift={10}
            className="rounded-3xl p-6 flex flex-col gap-4 h-full"
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
                className="font-bold text-[#1A0808] mb-1.5"
                style={{ fontFamily: 'Fraunces, Georgia, serif' }}
              >
                {item.title}
              </h4>
              <p className="text-sm text-[#5C1818] leading-relaxed whitespace-pre-line">{item.content}</p>
            </div>
            <a
              href={item.action.href}
              className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold transition-all"
              style={{ color: item.color }}
            >
              {item.action.label} <ArrowRight size={13} />
            </a>
          </Tilt>
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
        style={{ background: 'linear-gradient(135deg, #C41230, #9B0E25)' }}
      >
        <ShoppingBag size={32} className="text-white" />
      </div>
      <h2
        className="text-2xl font-black text-[#1A0808] mb-2"
        style={{ fontFamily: 'Fraunces, Georgia, serif' }}
      >
        Coming Soon!
      </h2>
      <p className="text-[#5C1818] mb-6">We're stocking up with fresh products.</p>
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-2 text-sm font-bold hover:underline"
        style={{ color: '#C41230' }}
      >
        Add products from admin <ArrowRight size={14} />
      </Link>
    </div>
  );
}

/* ══════════════════════════════════════
   LOADING SPINNER
══════════════════════════════════════ */


/* ══════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════ */

function withTimeout<T>(p: Promise<T>, ms = 8000): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms),
    ),
  ]);
}

export default function HomePage() {
  const [categories,       setCategories]       = useState<Category[]>([]);
  const [newArrivals,      setNewArrivals]      = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [apiReady,         setApiReady]         = useState(false);

  useEffect(() => {
    let alive = true;

    Promise.allSettled([
      withTimeout(getCategories()),
      withTimeout(getProducts({ limit: 8, sort: 'newest' })),
      withTimeout(getProducts({ limit: 8, featured: true })),
    ]).then(([c, p, f]) => {
      if (!alive) return;
      if (c.status === 'fulfilled') setCategories(c.value);
      if (p.status === 'fulfilled') setNewArrivals(p.value.items.slice(0, 8));
      if (f.status === 'fulfilled') setFeaturedProducts(f.value.items.slice(0, 8));
    }).finally(() => {
      if (alive) setApiReady(true);
    });

    return () => { alive = false; };
  }, []);

  return (
    <>
      {/* Full-viewport cinematic video hero */}
      <CinematicHero />

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-12">

      {/* Designed Vyas banner carousel (1a ⇄ 1b) */}
      <Reveal variant="up"><VyasHeroCarousel /></Reveal>

      {/* Ticker */}
      <Reveal variant="fade"><MarqueeTicker /></Reveal>

      {/* Store info */}
      <Reveal variant="up"><StoreInfoBar /></Reveal>

      {/* 2. Featured Sweets showcase */}
      <Reveal variant="up"><FeaturedSweetsSection featured={featuredProducts.length ? featuredProducts : newArrivals} /></Reveal>

      {/* Ornament divider */}
      <Reveal variant="fade"><OrnamentStrip variant="gold" /></Reveal>

      {/* 3. About / Heritage */}
      <Reveal variant="scale"><AboutSection /></Reveal>

      {/* Wide designed banner (1d) — full-bleed background band */}
      <div style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)' }}>
        <Reveal variant="fade"><VyasWideBanner bleed /></Reveal>
      </div>

      {/* 4. Categories + 5. Products — skeleton while API loads */}
      {!apiReady ? (
        <div className="flex flex-col items-center gap-3 py-10">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-red-100 border-t-[#C41230] animate-spin" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-b-[#D4AF37] animate-spin-slow-rev" />
          </div>
          <p className="text-sm text-[#5C1818]">Loading fresh products…</p>
        </div>
      ) : (
        <>
          {/* 5. Categories */}
          {categories.length > 0 && (
            <Reveal as="section" variant="up">
              <SectionHead
                title="Shop by Category"
                titleHindi="श्रेणी के अनुसार"
                sub={`${categories.length} categor${categories.length === 1 ? 'y' : 'ies'} available`}
                to="/category/all"
              />
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {categories.slice(0, 12).map((cat, i) => (
                  <CatCard key={cat._id} cat={cat} index={i} />
                ))}
              </div>
            </Reveal>
          )}

          {/* 6. Menu / Products */}
          {newArrivals.length > 0 && (
            <Reveal as="section" variant="up">
              <SectionHead
                title="New Arrivals"
                titleHindi="नए उत्पाद"
                sub="Freshly added to our collection"
                to="/category/all"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {newArrivals.map((p, i) => (
                  <div
                    key={p._id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${i * 0.065}s` }}
                  >
                    <Tilt className="h-full rounded-3xl">
                      <ProductCard product={p} />
                    </Tilt>
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {categories.length === 0 && newArrivals.length === 0 && <EmptyState />}
        </>
      )}

      {/* Full-catalogue ribbon banner (1c) — full-bleed background band */}
      <div style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)' }}>
        <Reveal variant="fade"><VyasRibbonBanner bleed /></Reveal>
      </div>

      {/* Divider */}
      <div className="divider-warm" />

      {/* Vertical reels showcase */}
      <Reveal variant="up"><ReelsShowcase /></Reveal>

      {/* Divider */}
      <div className="divider-warm" />

      {/* 7. Testimonials */}
      <Reveal variant="up"><TestimonialsSection /></Reveal>

      {/* 8. Gift CTA */}
      <Reveal variant="scale"><GiftCTA /></Reveal>

      {/* 9. Contact */}
      <Reveal variant="up"><ContactSection /></Reveal>

      {/* Bottom strip */}
      <div className="flex items-center justify-center gap-2 text-xs pb-2" style={{ color: 'rgba(26,8,8,0.4)' }}>
        <MapPin size={11} style={{ color: '#C41230' }} />
        Serving Mumbai since 1951 · Station Road, Goregaon West · Open 8:15 AM daily
      </div>
      </div>
    </>
  );
}
