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
import { WM, sweetImage } from '../lib/sweetImage';
import { useCartStore } from '../store/cart';
import ProductCard from '../components/ProductCard';
import Reveal from '../components/Reveal';
import Tilt from '../components/Tilt';
import { ReelsShowcase } from '../components/VideoShowcase';
import { VyasHeroCarousel, VyasWideBanner
  , OrnamentStrip } from '../components/VyasBanners';
import CinematicHero from '../components/CinematicHero';

/* ══════════════════════════════════════════════════════════════════════
   HOMEPAGE — "THE COUNTER" premium re-composition
   Same locked brand palette + Fraunces display. The transformation is
   structural: asymmetric grids, a bento display case, an ink museum-plaque
   band, staggered gold-glow tiles, pull-quote testimonials, a split CTA,
   doubled whitespace, soft layered shadows, and gold/crimson ornaments.
══════════════════════════════════════════════════════════════════════ */

const FEATURED_SWEETS = [
  { id: 1, name: 'Kaju Katli',  hindi: 'काजू कतली',   image: WM('Kaju_barfi.jpg') },
  { id: 2, name: 'Besan Ladoo', hindi: 'बेसन लड्डू',  image: WM('Motichoor_Laddu.jpg') },
  { id: 3, name: 'Kesar Barfi', hindi: 'केसर बर्फी',  image: WM('Burfi.jpg') },
  { id: 4, name: 'Gulab Jamun', hindi: 'गुलाब जामुन', image: WM('Gulab_jamun.jpg') },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma',  location: 'Goregaon West', rating: 5, initials: 'PS',
    text: 'Vyas Sweets has been our family tradition for 15 years. The Kaju Katli literally melts in your mouth — pure cashew magic you can\'t find anywhere else in Mumbai.' },
  { name: 'Rajesh Mehta',  location: 'Andheri',       rating: 5, initials: 'RM',
    text: 'Ordered Diwali gift boxes for the whole office. Gorgeous packaging, every sweet fresh and authentic.' },
  { name: 'Sunita Patel',  location: 'Borivali',      rating: 5, initials: 'SP',
    text: 'Ladoos and namkeen are consistently excellent — fresh every morning, real desi ghee.' },
];

function catInitials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

/* ══════════════════════════════════════
   DIAMOND DIVIDER
══════════════════════════════════════ */
function DiamondRule() {
  return <div className="sf-diamond-rule py-2"><span /></div>;
}

/* ══════════════════════════════════════
   SECTION HEADING — bigger, optionally centered
══════════════════════════════════════ */
function SectionHead({
  eyebrow, title, titleHindi, sub, to, center = false,
}: {
  eyebrow?: string; title: string; titleHindi?: string; sub: string; to?: string; center?: boolean;
}) {
  return (
    <div className={`flex items-end gap-4 mb-10 ${center ? 'flex-col text-center' : 'justify-between'}`}>
      <div className={center ? 'max-w-2xl mx-auto' : ''}>
        {eyebrow && (
          <p className={`sf-eyebrow mb-4 flex items-center gap-2.5 ${center ? 'justify-center' : ''}`}>
            <span className="inline-block w-6 h-px" style={{ background: 'var(--sf-crimson)' }} />
            {eyebrow}
          </p>
        )}
        <h2 className="sf-display sf-h2" style={{ color: 'var(--sf-ink)' }}>{title}</h2>
        {titleHindi && (
          <p className="sf-deva mt-2 text-xl" style={{ color: 'rgba(196,18,48,0.7)' }}>{titleHindi}</p>
        )}
        <div className={`sf-rule w-16 mt-4 mb-3 ${center ? 'mx-auto' : ''}`} />
        <p className="text-[15px]" style={{ color: 'var(--sf-ink-soft)' }}>{sub}</p>
      </div>
      {to && !center && (
        <Link
          to={to}
          className="group shrink-0 flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-full transition-all hover:gap-2.5"
          style={{ color: 'var(--sf-crimson)', background: 'rgba(196,18,48,0.08)' }}
        >
          View all <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   COUNTER TICKET RIBBON  (marquee, perforated)
══════════════════════════════════════ */
const TICKER = [
  'Kaju Katli', 'Gulab Jamun', 'Besan Ladoo', 'Soan Papdi', 'Kesar Barfi',
  'Chakli', 'Chivda', 'Dry Fruits', 'Halwa', 'Modak',
  'Rasmalai', 'Jalebi', 'Gift Boxes', 'Namkeen', 'Peda',
];
function CounterRibbon() {
  const doubled = [...TICKER, ...TICKER];
  return (
    <div className="relative" style={{ background: 'var(--sf-paper-2)' }}>
      <div className="sf-perf" style={{ color: 'var(--sf-paper)' }} />
      <div className="overflow-hidden relative py-3.5">
        <div className="absolute left-0 inset-y-0 w-20 z-10" style={{ background: 'linear-gradient(90deg, var(--sf-paper-2), transparent)' }} />
        <div className="absolute right-0 inset-y-0 w-20 z-10" style={{ background: 'linear-gradient(270deg, var(--sf-paper-2), transparent)' }} />
        <div className="flex animate-marquee whitespace-nowrap" style={{ animationDuration: '36s' }}>
          {doubled.map((item, i) => (
            <span key={i} className="sf-tag inline-flex items-center mx-5" style={{ color: 'var(--sf-ink)', letterSpacing: '0.1em' }}>
              <span className="w-1.5 h-1.5 rounded-full mr-5 shrink-0" style={{ background: i % 2 ? 'var(--sf-gold)' : 'var(--sf-crimson)' }} />
              {item}
            </span>
          ))}
        </div>
      </div>
      <div className="sf-perf" style={{ color: 'var(--sf-paper)', transform: 'rotate(180deg)' }} />
    </div>
  );
}

/* ══════════════════════════════════════
   OVERLAPPING STAT STRIP  (was single pill)
   Four counter tickets with gold hairline dividers, pulled up to overlap the
   ribbon seam so it layers instead of stacking flat.
══════════════════════════════════════ */
function StatStrip() {
  const stats = [
    { k: '1951', l: 'Serving since', mono: true },
    { k: '4.3 ★', l: '1,172 reviews' },
    { k: '8:15 AM', l: 'Fresh daily', mono: true },
    { k: 'Goregaon W', l: 'Station Road' },
  ];
  return (
    <div className="relative z-20 mt-10 md:mt-12 bg-white rounded-3xl sf-shadow-lg sf-ring-gold grid grid-cols-2 md:grid-cols-4 overflow-hidden">
      {stats.map((s, i) => (
        <div key={s.l} className="px-5 py-6 md:py-7 text-center relative" style={i % 4 !== 0 ? { borderLeft: '1px solid var(--sf-line)' } : undefined}>
          <div className={`${s.mono ? 'sf-num' : 'sf-display'} font-medium text-2xl md:text-[1.75rem]`} style={{ color: i === 1 ? 'var(--sf-crimson)' : 'var(--sf-ink)' }}>
            {s.k}
          </div>
          <div className="sf-tag mt-1.5" style={{ color: 'var(--sf-ink-soft)' }}>{s.l}</div>
          {/* hairline top accent for the last two on mobile wrap */}
          {i >= 2 && <div className="md:hidden absolute top-0 left-0 right-0 h-px" style={{ background: 'var(--sf-line)' }} />}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════
   FEATURED — BENTO DISPLAY CASE
   One large 2×2 hero tile (tilts) + one wide + two square tiles. Varied
   aspect ratios and type scale, gold-brackets on the hero tile.
══════════════════════════════════════ */
type MosaicItem = {
  key: string; to: string; img?: string; name: string; sub?: string; price?: number; onAdd?: () => void;
};

function MosaicCard({ item, size }: { item: MosaicItem; size: 'lg' | 'wide' | 'sm' }) {
  const big = size === 'lg';
  return (
    <Link to={item.to} className="group relative block w-full h-full overflow-hidden rounded-3xl" style={{ border: '1px solid rgba(212,175,55,0.30)' }}>
      {item.img ? (
        <img
          src={item.img}
          alt={item.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.06]"
          onError={(e) => { e.currentTarget.style.opacity = '0'; }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(150deg,var(--sf-paper),var(--sf-paper-2))' }}>
          <div className="absolute inset-0 indian-pattern opacity-60" />
          <span className="sf-display leading-none select-none" style={{ fontSize: big ? '9rem' : '5rem', color: 'rgba(196,18,48,0.14)' }} aria-hidden="true">
            {item.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, rgba(26,8,8,0.88) 0%, rgba(26,8,8,0.20) 48%, transparent 72%)' }} />

      <span className="sf-tag absolute top-3 left-3 px-2.5 py-1 rounded-md text-white sf-shadow" style={{ background: 'var(--sf-crimson)', letterSpacing: '0.08em' }}>
        {big ? 'House Signature' : 'Signature'}
      </span>

      {item.onAdd && (
        <button
          onClick={(e) => { e.preventDefault(); item.onAdd?.(); }}
          aria-label={`Add ${item.name} to cart`}
          className="sf-btn sf-btn-primary absolute top-2.5 right-2.5 px-3 py-2 text-xs opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
        >
          <ShoppingBag size={13} /> Add
        </button>
      )}

      {/* ticket overlay slides up on hover */}
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 transition-transform duration-500 ease-out group-hover:-translate-y-1">
        {item.sub && <p className="sf-deva mb-1.5 text-white/75 leading-none" style={{ fontSize: big ? '1.25rem' : '0.95rem' }}>{item.sub}</p>}
        <h3 className={`sf-display font-semibold text-white leading-tight ${big ? 'text-3xl md:text-5xl' : 'text-lg'}`}>{item.name}</h3>
        <div className="flex items-center justify-between gap-2 mt-2.5">
          {item.price != null
            ? <span className={`sf-num font-medium text-white ${big ? 'text-xl' : 'text-sm'}`}>{formatINR(item.price)}</span>
            : <span />}
          <span className="sf-tag inline-flex items-center gap-1 text-white/90 group-hover:gap-2 transition-all">
            {item.price != null ? 'View' : 'Order'} <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function FeaturedSweetsSection({ featured }: { featured: Product[] }) {
  const addItem = useCartStore((s) => s.addItem);
  const ordered = [...featured].sort((a, b) => (b.images?.[0] ? 1 : 0) - (a.images?.[0] ? 1 : 0));

  const items: MosaicItem[] = (featured.length > 0
    ? ordered.slice(0, 4).map((p) => ({
        key: p._id, to: `/product/${p.slug}`, img: p.images[0] || sweetImage(p.name), name: p.name,
        sub: `Net ${p.weight}${p.unit}`, price: p.price,
        onAdd: p.stock === 0 ? undefined : () => addItem(p._id),
      }))
    : FEATURED_SWEETS.map((s) => ({ key: String(s.id), to: '/category/all', img: s.image, name: s.name, sub: s.hindi })));

  return (
    <section>
      <SectionHead eyebrow="The Display Case" title="Our Signature Sweets" titleHindi="हमारी खास मिठाइयाँ"
        sub="Timeless classics, crafted with generations of expertise" to="/category/all" />

      <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-4 md:gap-5 md:h-[580px]">
        {items[0] && (
          <div className="col-span-2 md:row-span-2 aspect-[4/5] md:aspect-auto md:h-full animate-fade-up">
            <Tilt max={6} lift={12} className="h-full rounded-3xl sf-brackets">
              <MosaicCard item={items[0]} size="lg" />
            </Tilt>
          </div>
        )}
        {items[1] && (
          <div className="col-span-2 aspect-[16/10] md:aspect-auto md:h-full animate-fade-up" style={{ animationDelay: '0.07s' }}>
            <MosaicCard item={items[1]} size="wide" />
          </div>
        )}
        {items[2] && (
          <div className="aspect-square md:aspect-auto md:h-full animate-fade-up" style={{ animationDelay: '0.14s' }}>
            <MosaicCard item={items[2]} size="sm" />
          </div>
        )}
        {items[3] && (
          <div className="aspect-square md:aspect-auto md:h-full animate-fade-up" style={{ animationDelay: '0.21s' }}>
            <MosaicCard item={items[3]} size="sm" />
          </div>
        )}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════
   ABOUT — INK MUSEUM PLAQUE  (full-bleed)
══════════════════════════════════════ */
function AboutSection() {
  const stats = [
    { k: '1951', l: 'Established' },
    { k: '3', l: 'Generations' },
    { k: '100%', l: 'Desi ghee' },
    { k: '0', l: 'Preservatives' },
  ];
  return (
    <section className="relative overflow-hidden sf-band-dark sf-brackets">
      <div className="absolute inset-0 dot-grid-light pointer-events-none opacity-20" />
      {/* oversized watermark numeral */}
      <div className="sf-watermark absolute -right-6 -bottom-16 select-none" style={{ fontSize: 'clamp(12rem, 26vw, 26rem)' }}>1951</div>

      <div className="relative z-10 max-w-3xl mx-auto text-center px-6 py-24 md:py-36">
        <p className="sf-eyebrow mb-6 inline-flex items-center gap-2" style={{ color: 'var(--sf-gold-light)' }}>
          <Award size={12} /> Our Heritage
        </p>

        <h2 className="sf-display font-bold text-white leading-[1.05]" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
          A legacy of <span style={{ color: 'var(--sf-gold-light)' }}>sweetness</span>
        </h2>
        <p className="sf-deva mt-3 text-2xl" style={{ color: 'rgba(247,239,224,0.5)' }}>मिठास की विरासत</p>

        {/* single thin gold rule */}
        <div className="mx-auto mt-8 mb-8 h-px w-40" style={{ background: 'linear-gradient(90deg, transparent, var(--sf-gold), transparent)' }} />

        <p className="sf-lead mx-auto max-w-2xl" style={{ color: 'rgba(247,239,224,0.72)' }}>
          Since 1951, Vyas Sweets has been weaving sweetness into the lives of
          Mumbai families — every <em>मिठाई</em> made with pure desi ghee,
          hand-selected ingredients, and recipes passed down through generations.
        </p>

        {/* plaque stat row with diamond separators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {stats.map((s, i) => (
            <div key={s.l} className="flex items-center gap-10">
              {i > 0 && <span className="hidden sm:block w-1.5 h-1.5 rotate-45" style={{ background: 'var(--sf-gold)' }} />}
              <div className="text-center">
                <div className="sf-display font-bold text-3xl md:text-4xl" style={{ color: 'var(--sf-gold-light)' }}>{s.k}</div>
                <div className="sf-tag mt-1.5" style={{ color: 'rgba(247,239,224,0.5)' }}>{s.l}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════
   PROMISES — hairline ledger (was inside About)
══════════════════════════════════════ */
function PromisesRow() {
  const promises = [
    { icon: <ChefHat size={18} />, title: 'Pure Desi Ghee',     desc: '100% authentic ghee — no substitutes.' },
    { icon: <Leaf    size={18} />, title: 'No Preservatives',    desc: 'Fresh daily. No artificial anything.' },
    { icon: <Award   size={18} />, title: 'Traditional Recipes', desc: 'Refined over 70+ years.' },
    { icon: <Gift    size={18} />, title: 'Gift Packaging',      desc: 'Elegant for every occasion.' },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-3xl overflow-hidden sf-ring-gold" style={{ background: 'var(--sf-line)' }}>
      {promises.map((p) => (
        <div key={p.title} className="bg-white p-6 md:p-7 flex flex-col gap-3">
          <span className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(196,18,48,0.09)', color: 'var(--sf-crimson)' }}>{p.icon}</span>
          <h4 className="sf-display font-semibold text-base" style={{ color: 'var(--sf-ink)' }}>{p.title}</h4>
          <p className="text-[13px] leading-relaxed" style={{ color: 'var(--sf-ink-soft)' }}>{p.desc}</p>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════
   CATEGORY CARD — staggered + gold glow
══════════════════════════════════════ */
function CatCard({ cat, index }: { cat: Category; index: number }) {
  const imageSrc = cat.image || sweetImage(`${cat.name} ${cat.slug}`, 400);
  return (
    <div className="animate-fade-up" style={{ animationDelay: `${index * 0.05}s` }}>
      <Link to={`/category/${cat.slug}`} className="sf-glow bg-white rounded-3xl group flex flex-col items-center gap-3.5 p-5 h-full" style={{ border: '1px solid var(--sf-line)' }}>
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0">
          {imageSrc ? (
            <img src={imageSrc} alt={cat.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                const img = e.target as HTMLImageElement; img.style.display = 'none';
                const fb = img.nextElementSibling as HTMLElement | null; if (fb) fb.style.display = 'flex';
              }} />
          ) : null}
          <div className={`${imageSrc ? 'hidden' : ''} w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}
            style={{ display: imageSrc ? 'none' : undefined, background: 'linear-gradient(135deg, var(--sf-crimson), var(--sf-crimson-deep))' }}>
            <span className="sf-display text-white font-bold text-2xl">{catInitials(cat.name)}</span>
          </div>
        </div>
        <span className="text-[13px] font-bold text-center leading-snug transition-colors group-hover:text-[var(--sf-crimson)]" style={{ color: 'var(--sf-ink-soft)' }}>
          {cat.name}
        </span>
      </Link>
    </div>
  );
}

/* ══════════════════════════════════════
   NEW ARRIVALS — first item promoted to a wide feature
══════════════════════════════════════ */
function FeatureProduct({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  return (
    <div className="col-span-2 row-span-1 sf-glow bg-white rounded-3xl overflow-hidden group flex flex-col sm:flex-row h-full" style={{ border: '1px solid var(--sf-line)' }}>
      <Link to={`/product/${product.slug}`} className="relative sm:w-1/2 overflow-hidden block">
        <img src={product.images[0] || sweetImage(product.name)} alt={product.name} className="w-full h-48 sm:h-full min-h-[192px] object-cover group-hover:scale-105 transition-transform duration-[700ms]" />
        <span className="sf-tag absolute top-3 left-3 px-2.5 py-1 rounded-md text-white" style={{ background: 'var(--sf-gold-dk)', letterSpacing: '0.08em' }}>Just in</span>
      </Link>
      <div className="p-6 sm:w-1/2 flex flex-col justify-center">
        <Link to={`/product/${product.slug}`}>
          <div className="flex items-start gap-2">
            <span className="veg-dot mt-1.5 shrink-0" aria-label="Vegetarian" />
            <h3 className="sf-display font-semibold text-2xl leading-tight group-hover:text-[var(--sf-crimson)] transition-colors" style={{ color: 'var(--sf-ink)' }}>{product.name}</h3>
          </div>
          <p className="sf-tag mt-2" style={{ color: 'var(--sf-ink-soft)' }}>Net {product.weight}{product.unit}</p>
        </Link>
        <div className="flex items-end justify-between gap-2 mt-5">
          <span className="sf-num font-medium text-2xl" style={{ color: 'var(--sf-ink)' }}>{formatINR(product.price)}</span>
          <button onClick={() => addItem(product._id)} disabled={product.stock === 0}
            className="sf-btn sf-btn-primary px-4 py-2.5 text-sm disabled:opacity-40">
            <ShoppingBag size={14} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   TESTIMONIALS — pull-quote 7/5
══════════════════════════════════════ */
function TestimonialsSection() {
  const [lead, ...rest] = TESTIMONIALS;
  return (
    <section>
      <SectionHead center eyebrow="From the Regulars" title="Loved by Mumbai" titleHindi="मुंबई की पसंद"
        sub="What our customers say about Vyas Sweets" />

      <div className="grid lg:grid-cols-12 gap-5">
        {/* big pull-quote */}
        <div className="lg:col-span-7 relative bg-white rounded-3xl p-8 md:p-12 sf-shadow-lg sf-ring-gold sf-brackets overflow-hidden">
          <span className="sf-quote-glyph absolute top-4 left-6 leading-none select-none" aria-hidden="true">“</span>
          <div className="relative">
            <div className="flex gap-1 mb-6">
              {Array.from({ length: lead.rating }).map((_, j) => <Star key={j} size={18} style={{ fill: 'var(--sf-gold)', color: 'var(--sf-gold)' }} />)}
            </div>
            <p className="sf-display font-medium leading-[1.3]" style={{ fontSize: 'clamp(1.4rem, 2.4vw, 2rem)', color: 'var(--sf-ink)' }}>
              {lead.text}
            </p>
            <div className="flex items-center gap-3 mt-8 pt-6" style={{ borderTop: '1px solid var(--sf-line)' }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: 'var(--sf-crimson)' }}>{lead.initials}</div>
              <div>
                <p className="font-bold" style={{ color: 'var(--sf-ink)' }}>{lead.name}</p>
                <p className="sf-tag flex items-center gap-1" style={{ color: 'var(--sf-ink-soft)' }}>
                  <MapPin size={9} style={{ color: 'var(--sf-crimson)' }} /> {lead.location}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* two compact stacked */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {rest.map((t) => (
            <div key={t.name} className="bg-white rounded-3xl p-6 sf-shadow flex-1 flex flex-col gap-3" style={{ border: '1px solid var(--sf-line)' }}>
              <div className="flex items-center justify-between">
                <Quote size={22} style={{ color: 'var(--sf-crimson)', opacity: 0.3 }} />
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={13} style={{ fill: 'var(--sf-gold)', color: 'var(--sf-gold)' }} />)}
                </div>
              </div>
              <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--sf-ink-soft)' }}>"{t.text}"</p>
              <div className="flex items-center gap-2.5 pt-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: 'var(--sf-crimson)' }}>{t.initials}</div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--sf-ink)' }}>{t.name}</p>
                  <p className="sf-tag" style={{ color: 'var(--sf-ink-soft)' }}>{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════
   GIFT CTA — split band, visual bleeds off the edge
══════════════════════════════════════ */
function GiftCTA() {
  return (
    <div className="relative grid md:grid-cols-2 rounded-3xl overflow-hidden sf-shadow-lg" style={{ border: '1px solid var(--sf-line-2)' }}>
      {/* left: text on cream */}
      <div className="relative p-10 md:p-16 flex flex-col justify-center" style={{ background: 'var(--sf-paper)' }}>
        <div className="absolute inset-0 paper-grain pointer-events-none" />
        <div className="relative">
          <p className="sf-eyebrow inline-flex items-center gap-2 mb-5"><Gift size={12} /> For Every Celebration</p>
          <h3 className="sf-display font-bold leading-[1.02]" style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', color: 'var(--sf-ink)' }}>
            Gift your<br /><span style={{ color: 'var(--sf-crimson)' }}>loved ones</span>
          </h3>
          <p className="sf-lead max-w-sm mt-4" style={{ color: 'var(--sf-ink-soft)' }}>
            Beautifully packed sweet gift boxes — perfect for Diwali, Holi, weddings &amp; birthdays.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link to="/category/all" className="sf-btn sf-btn-primary text-base px-8 py-4 sf-shadow-lg">Shop Gift Boxes</Link>
            <a href="tel:+919869313539" className="sf-tag flex items-center gap-1.5 hover:text-[var(--sf-crimson)] transition-colors" style={{ color: 'var(--sf-ink-soft)' }}>
              <Phone size={12} /> Custom orders
            </a>
          </div>
        </div>
      </div>
      {/* right: festive sweets photo that bleeds to the edge */}
      <div className="relative min-h-[260px] overflow-hidden flex items-center justify-center">
        <img src={WM('Motichoor_Laddu.jpg', 900)} alt="Assorted festive sweets" className="absolute inset-0 w-full h-full object-cover" />
        {/* crimson→ink wash for legibility of the mark */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(155,14,37,0.82), rgba(26,8,8,0.72))' }} />
        <div className="absolute inset-0 indian-pattern opacity-20" />
        <div className="relative text-center px-8">
          <Gift size={64} style={{ color: 'var(--sf-gold-light)' }} className="mx-auto mb-4 drop-shadow" />
          <p className="sf-deva text-2xl" style={{ color: 'var(--sf-cream)' }}>हर मौके के लिए मिठास</p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   CONTACT — 8/4 asymmetric
══════════════════════════════════════ */
function ContactSection() {
  return (
    <section>
      <SectionHead eyebrow="Visit the Shop" title="Find Us" titleHindi="हमारा पता"
        sub="Come visit our store in Goregaon West, Mumbai" />

      <div className="grid lg:grid-cols-12 gap-5">
        {/* big address panel */}
        <a href="https://maps.google.com/?q=Vyas+Sweets+Goregaon+West+Mumbai" target="_blank" rel="noreferrer"
          className="lg:col-span-8 relative rounded-3xl overflow-hidden sf-band-dark sf-brackets sf-shadow-lg group p-10 md:p-14 flex flex-col justify-end min-h-[280px]">
          <img src={WM('Bengali_sweets.jpg', 900)} alt="" aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-30 group-hover:scale-105 transition-all duration-[900ms]" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(120deg, rgba(26,8,8,0.88) 30%, rgba(26,8,8,0.55))' }} />
          <div className="absolute inset-0 dot-grid-light opacity-20" />
          <div className="relative">
            <span className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--sf-gold-light)' }}><MapPin size={22} /></span>
            <h4 className="sf-display font-bold text-white text-3xl md:text-4xl leading-tight">Station Road,<br />Goregaon West</h4>
            <p className="sf-lead mt-3" style={{ color: 'rgba(247,239,224,0.7)' }}>Mumbai — 400 104</p>
            <span className="inline-flex items-center gap-1.5 mt-6 font-bold text-sm group-hover:gap-2.5 transition-all" style={{ color: 'var(--sf-gold-light)' }}>
              Get directions <ArrowRight size={14} />
            </span>
          </div>
        </a>

        {/* stacked spec tickets */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <a href="tel:+919869313539" className="sf-glow bg-white rounded-3xl p-6 flex items-center gap-4 flex-1" style={{ border: '1px solid var(--sf-line)' }}>
            <span className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(196,18,48,0.09)', color: 'var(--sf-crimson)' }}><Phone size={20} /></span>
            <div>
              <h4 className="sf-display font-semibold" style={{ color: 'var(--sf-ink)' }}>Call us</h4>
              <p className="sf-num text-sm" style={{ color: 'var(--sf-ink-soft)' }}>+91 98693 13539</p>
            </div>
          </a>
          <div className="sf-glow bg-white rounded-3xl p-6 flex items-center gap-4 flex-1" style={{ border: '1px solid var(--sf-line)' }}>
            <span className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--sf-gold-dk)' }}><Clock size={20} /></span>
            <div>
              <h4 className="sf-display font-semibold" style={{ color: 'var(--sf-ink)' }}>Store hours</h4>
              <p className="sf-tag" style={{ color: 'var(--sf-ink-soft)' }}>Opens 8:15 AM daily</p>
            </div>
          </div>
        </div>
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
      <div className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-5 sf-shadow-lg animate-bounce-soft" style={{ background: 'var(--sf-crimson)' }}>
        <ShoppingBag size={32} className="text-white" />
      </div>
      <h2 className="sf-display font-bold text-2xl mb-2" style={{ color: 'var(--sf-ink)' }}>Coming soon</h2>
      <p className="mb-6" style={{ color: 'var(--sf-ink-soft)' }}>We're stocking up with fresh products.</p>
      <Link to="/admin/products" className="inline-flex items-center gap-2 text-sm font-bold hover:underline" style={{ color: 'var(--sf-crimson)' }}>
        Add products from admin <ArrowRight size={14} />
      </Link>
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════ */
function withTimeout<T>(p: Promise<T>, ms = 8000): Promise<T> {
  return Promise.race([p, new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);
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
    }).finally(() => { if (alive) setApiReady(true); });
    return () => { alive = false; };
  }, []);

  return (
    <>
      {/* 1 — asymmetric split hero */}
      <CinematicHero />

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 space-y-24 md:space-y-32">

        {/* client banner carousel — kept, contained frame */}
        <Reveal variant="up"><VyasHeroCarousel /></Reveal>

        {/* ribbon + overlapping stat strip */}
        <div>
          <div className="sf-bleed"><Reveal variant="fade"><CounterRibbon /></Reveal></div>
          <Reveal variant="up"><StatStrip /></Reveal>
        </div>

        {/* 2 — bento display case */}
        <Reveal variant="up"><FeaturedSweetsSection featured={featuredProducts.length ? featuredProducts : newArrivals} /></Reveal>

        <Reveal variant="fade"><OrnamentStrip variant="gold" /></Reveal>
      </div>

      {/* 3 — ink museum-plaque band, full-bleed */}
      <Reveal variant="fade" className="sf-bleed block"><AboutSection /></Reveal>

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 space-y-24 md:space-y-32">

        {/* promises ledger — clean spacing below the plaque, no overlap */}
        <Reveal variant="up"><PromisesRow /></Reveal>

        {/* wide client banner — full-bleed */}
        <div className="sf-bleed"><Reveal variant="fade"><VyasWideBanner bleed /></Reveal></div>

        {!apiReady ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 animate-spin" style={{ borderColor: 'rgba(196,18,48,0.15)', borderTopColor: 'var(--sf-crimson)' }} />
            </div>
            <p className="sf-tag" style={{ color: 'var(--sf-ink-soft)' }}>Loading fresh products…</p>
          </div>
        ) : (
          <>
            {/* 4 — staggered gold-glow categories */}
            {categories.length > 0 && (
              <Reveal as="section" variant="up">
                <SectionHead eyebrow="Browse the Counter" title="Shop by Category" titleHindi="श्रेणी के अनुसार"
                  sub={`${categories.length} categor${categories.length === 1 ? 'y' : 'ies'} available`} to="/category/all" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 md:gap-5">
                  {categories.slice(0, 12).map((cat, i) => <CatCard key={cat._id} cat={cat} index={i} />)}
                </div>
              </Reveal>
            )}

            {/* new arrivals — first promoted to wide feature */}
            {newArrivals.length > 0 && (
              <Reveal as="section" variant="up">
                <SectionHead eyebrow="Fresh This Week" title="New Arrivals" titleHindi="नए उत्पाद"
                  sub="Freshly added to our collection" to="/category/all" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 auto-rows-fr">
                  {newArrivals[0] && <FeatureProduct product={newArrivals[0]} />}
                  {newArrivals.slice(1).map((p, i) => (
                    <div key={p._id} className="animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>
              </Reveal>
            )}

            {categories.length === 0 && newArrivals.length === 0 && <EmptyState />}
          </>
        )}

        <DiamondRule />

        {/* reels showcase (recomposed in VideoShowcase) */}
        <Reveal variant="up"><ReelsShowcase /></Reveal>

        <DiamondRule />

        {/* 5 — pull-quote testimonials */}
        <Reveal variant="up"><TestimonialsSection /></Reveal>

        {/* split gift CTA */}
        <Reveal variant="scale"><GiftCTA /></Reveal>

        {/* contact */}
        <Reveal variant="up"><ContactSection /></Reveal>

        <div className="sf-tag flex items-center justify-center gap-2 pb-2" style={{ color: 'rgba(26,8,8,0.4)' }}>
          <MapPin size={11} style={{ color: 'var(--sf-crimson)' }} />
          Serving Mumbai since 1951 · Station Road, Goregaon West · Open 8:15 AM daily
        </div>
      </div>
    </>
  );
}
