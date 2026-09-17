import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Film, ShoppingBag } from 'lucide-react';
import Tilt from './Tilt';

/* ══════════════════════════════════════
   VIDEO SHOWCASE
   Two curated blocks built around the store's
   own footage — a cinematic full-bleed film band
   (16:9) and a pair of vertical "reels" (9:16).
   All muted + autoplay-on-scroll, poster-first,
   and honouring prefers-reduced-motion.
══════════════════════════════════════ */

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduce;
}

/* Lazy, self-pausing video. The src is only attached once it scrolls into
   view, and it plays only while in view AND marked active — so several clips
   never decode at once. Under reduced-motion it degrades to its poster still. */
function AutoVideo({
  src,
  poster,
  active = true,
  className = '',
  style,
  label,
  force = false,
}: {
  src: string;
  poster: string;
  active?: boolean;
  className?: string;
  style?: React.CSSProperties;
  label: string;
  /** always autoplay muted video, even under prefers-reduced-motion (no poster fallback) */
  force?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '250px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active && inView && (force || !reduce)) void el.play().catch(() => {});
    else el.pause();
  }, [active, inView, reduce, force]);

  if (reduce && !force) {
    return (
      <img src={poster} alt={label} className={className} style={style} loading="lazy" />
    );
  }

  return (
    <video
      ref={ref}
      aria-label={label}
      className={className}
      style={style}
      src={inView ? src : undefined}
      poster={poster}
      muted
      loop
      playsInline
      autoPlay
      preload="none"
    />
  );
}

/* ══════════════════════════════════════
   KITCHEN FILM — cinematic full-bleed band
   Crossfades the two landscape clips behind an
   editorial headline; only the visible clip plays.
══════════════════════════════════════ */

const FILMS = [
  { src: '/videos/kitchen-01.mp4', poster: '/videos/kitchen-01.jpg', label: 'Sweets being prepared in the Vyas kitchen' },
  { src: '/videos/kitchen-02.mp4', poster: '/videos/kitchen-02.jpg', label: 'Fresh mithai at the Vyas counter' },
];

export function KitchenFilm() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % FILMS.length), 7000);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      className="relative overflow-hidden rounded-3xl"
      style={{ background: '#1A0808', minHeight: 460 }}
    >
      {/* crossfading footage */}
      {FILMS.map((f, i) => (
        <div
          key={f.src}
          className="absolute inset-0 transition-opacity duration-[1200ms] ease-out"
          style={{ opacity: i === idx ? 1 : 0 }}
        >
          <AutoVideo
            src={f.src}
            poster={f.poster}
            active={i === idx}
            label={f.label}
            className="w-full h-full object-cover"
            style={{ minHeight: 460 }}
          />
        </div>
      ))}

      {/* legibility washes — dark from the left + a lift from the base */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, rgba(26,8,8,0.92) 0%, rgba(26,8,8,0.62) 38%, rgba(26,8,8,0.18) 68%, rgba(26,8,8,0.05) 100%)' }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(0deg, rgba(26,8,8,0.55), transparent 45%)' }}
      />
      <div className="absolute inset-0 dot-grid-light opacity-30 pointer-events-none" />

      {/* content */}
      <div className="relative z-10 flex flex-col justify-center px-7 md:px-14 py-14 md:py-20 max-w-2xl">
        <p className="sf-eyebrow mb-5 flex items-center gap-2.5" style={{ color: 'rgba(255,248,240,0.7)' }}>
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full" style={{ background: 'rgba(196,18,48,0.22)', color: '#F0CE6A' }}>
            <Film size={12} />
          </span>
          Inside the kitchen
        </p>

        <h2 className="sf-display text-white leading-[0.98] mb-5">
          <span className="block text-4xl md:text-6xl font-light tracking-[-0.02em]">Made by hand,</span>
          <span className="block text-4xl md:text-6xl font-semibold tracking-[-0.02em]">
            fresh <span style={{ color: '#F0CE6A' }}>every morning</span>.
          </span>
        </h2>

        <div className="sf-rule w-40 mb-6" />

        <p className="text-base md:text-lg leading-relaxed mb-8 max-w-md" style={{ color: 'rgba(255,248,240,0.78)' }}>
          Ghee-roasted, slow-set and cut to order on Station Road — the way
          three generations of Vyas have made mithai since 1951.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/category/all"
            className="sf-btn sf-btn-primary text-base px-8 py-4 shadow-lg"
          >
            <ShoppingBag size={17} /> Browse the counter
          </Link>
        </div>
      </div>

      {/* clip indicator, bottom-right */}
      <div className="absolute bottom-5 right-6 z-10 hidden md:flex items-center gap-2">
        {FILMS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Show clip ${i + 1}`}
            className="rounded-full transition-all duration-300"
            style={{
              background: i === idx ? '#F0CE6A' : 'rgba(255,255,255,0.4)',
              width: i === idx ? '1.75rem' : '0.5rem',
              height: '0.5rem',
            }}
          />
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════
   REELS — two vertical 9:16 clips, side by side
══════════════════════════════════════ */

const REELS = [
  {
    src: '/videos/reel-01.mp4',
    poster: '/videos/reel-01.jpg',
    title: 'Straight off the kadhai',
    sub: 'ताज़ा · गरमा गरम',
  },
  {
    src: '/videos/reel-02.mp4',
    poster: '/videos/reel-02.jpg',
    title: 'Boxed with care',
    sub: 'हर मौके के लिए',
  },
];

function ReelCard({ reel, index }: { reel: (typeof REELS)[number]; index: number }) {
  return (
    <div className="animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
      <Tilt max={6} lift={14} className="rounded-3xl h-full">
        <div
          className="group relative overflow-hidden rounded-3xl"
          style={{
            aspectRatio: '9 / 16',
            border: '1px solid rgba(212,175,55,0.35)',
            boxShadow: '0 20px 50px -18px rgba(126,10,29,0.5)',
          }}
        >
          {/* always-autoplay, no controls */}
          <AutoVideo
            force
            src={reel.src}
            poster={reel.poster}
            label={reel.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
          />

          {/* readability wash rising from the base */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(0deg, rgba(26,8,8,0.9) 0%, rgba(26,8,8,0.18) 46%, transparent 72%)' }}
          />
          {/* inner gold hairline for a framed, premium feel */}
          <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10)' }} />

          {/* caption */}
          <div className="absolute inset-x-0 bottom-0 p-5">
            <span
              className="sf-deva inline-block text-xs px-2.5 py-1 rounded-full mb-2 text-white"
              style={{ background: 'var(--sf-crimson)' }}
            >
              {reel.sub}
            </span>
            <h3 className="sf-display font-semibold text-white text-xl md:text-2xl leading-tight">
              {reel.title}
            </h3>
          </div>
        </div>
      </Tilt>
    </div>
  );
}

export function ReelsShowcase() {
  return (
    <section className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
      {/* left — editorial heading column */}
      <div className="lg:col-span-4">
        <p className="sf-eyebrow mb-4 flex items-center gap-2.5">
          <span className="inline-block w-6 h-px" style={{ background: 'var(--sf-crimson)' }} />
          A Peek Behind the Counter
        </p>
        <h2 className="sf-display sf-h2" style={{ color: 'var(--sf-ink)' }}>
          Little films from the floor
        </h2>
        <p className="sf-deva mt-2 text-xl" style={{ color: 'rgba(196,18,48,0.7)' }}>एक झलक</p>
        <div className="sf-rule w-16 mt-4 mb-4" />
        <p className="sf-lead max-w-xs" style={{ color: 'var(--sf-ink-soft)' }}>
          Fresh off the kadhai, straight to your screen — a glimpse of the shop
          floor on Station Road.
        </p>
        <Link
          to="/category/all"
          className="sf-btn sf-btn-ghost mt-7 px-6 py-3 text-sm"
        >
          Shop now <ArrowRight size={14} />
        </Link>
      </div>

      {/* right — staggered reels */}
      <div className="lg:col-span-8 grid grid-cols-2 gap-5 sm:gap-6">
        {REELS.map((reel, i) => (
          <div key={reel.src} className={i % 2 === 1 ? 'lg:mt-16' : ''}>
            <ReelCard reel={reel} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
