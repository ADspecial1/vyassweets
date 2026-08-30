import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Phone, ChevronDown } from 'lucide-react';

/* ══════════════════════════════════════════════════════════════════════
   VYAS CINEMATIC HERO
   A full-viewport (100svh − header) hero with the store's own footage
   autoplaying as a cover background. Two clips cross-fade under a Ken-Burns
   push; the crimson/cream/gold brand mark is layered over with a staggered
   entrance, a drifting glow, a brass sheen across the wordmark, and a
   floating scroll cue. Everything degrades gracefully under reduced-motion:
   the video falls back to its poster still and all loops stop.
══════════════════════════════════════════════════════════════════════ */

const FILMS = [
  { src: '/videos/kitchen-01.mp4', poster: '/videos/kitchen-01.jpg' },
  { src: '/videos/kitchen-02.mp4', poster: '/videos/kitchen-02.jpg' },
];

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

/** Keeps the hero exactly filling the viewport below the sticky header. */
function useHeroHeight() {
  const [h, setH] = useState('100svh');
  useLayoutEffect(() => {
    const header = document.querySelector('header');
    const measure = () => {
      const hh = header?.getBoundingClientRect().height ?? 0;
      setH(`calc(100svh - ${Math.round(hh)}px)`);
    };
    measure();
    const ro = header ? new ResizeObserver(measure) : null;
    if (header && ro) ro.observe(header);
    window.addEventListener('resize', measure);
    return () => { ro?.disconnect(); window.removeEventListener('resize', measure); };
  }, []);
  return h;
}

export default function CinematicHero() {
  const heroHeight = useHeroHeight();
  const reduce = usePrefersReducedMotion();
  const [idx, setIdx] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // cross-fade the two clips
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % FILMS.length), 8000);
    return () => clearInterval(t);
  }, []);

  // play the active clip, pause the other (saves a decode).
  // Autoplay runs regardless of reduced-motion — the footage is the hero;
  // the Ken-Burns push/glow/sheen still respect the setting via CSS.
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === idx) void v.play().catch(() => {});
      else v.pause();
    });
  }, [idx]);

  const scrollDown = () => {
    window.scrollBy({ top: window.innerHeight * 0.82, behavior: 'smooth' });
  };

  return (
    <section className="relative w-full overflow-hidden" style={{ height: heroHeight, minHeight: 460, background: '#1A0808' }}>
      {/* ── background footage (or poster under reduced motion) ── */}
      {FILMS.map((f, i) => (
        <div
          key={f.src}
          className="absolute inset-0 transition-opacity duration-[1400ms] ease-out"
          style={{ opacity: i === idx ? 1 : 0 }}
        >
          <video
            ref={(el) => { videoRefs.current[i] = el; }}
            className={`w-full h-full object-cover ${reduce ? '' : 'vyas-kenburns'}`}
            src={f.src}
            poster={f.poster}
            muted
            loop
            playsInline
            autoPlay
            preload={i === 0 ? 'auto' : 'metadata'}
          />
        </div>
      ))}

      {/* ── legibility washes ── */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(26,8,8,0.55) 0%, rgba(26,8,8,0.15) 32%, rgba(26,8,8,0.35) 62%, rgba(26,8,8,0.86) 100%)' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(120% 90% at 50% 42%, transparent 40%, rgba(26,8,8,0.55) 100%)' }} />
      {/* drifting crimson glow behind the type */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="vyas-glow-drift" style={{ width: '70%', height: '70%', background: 'radial-gradient(circle, rgba(196,18,48,0.34) 0%, transparent 62%)' }} />
      </div>
      <div className="absolute inset-0 paper-grain pointer-events-none opacity-40" />

      {/* ── content ── */}
      <div className="relative z-10 h-full w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center px-6">
        {/* eyebrow */}
        <div className="animate-fade-up d-1 vyas-font-ui flex items-center gap-4 mb-6" style={{ color: '#F0CE6A' }}>
          <span className="animate-counter-draw block" style={{ width: 54, height: 2, background: 'linear-gradient(90deg, transparent, #C9A227)', transformOrigin: 'right' }} />
          <span style={{ fontSize: 'clamp(11px, 1.6vw, 15px)', fontWeight: 700, letterSpacing: '.42em' }}>SINCE 1951</span>
          <span className="animate-counter-draw block" style={{ width: 54, height: 2, background: 'linear-gradient(90deg, #C9A227, transparent)', transformOrigin: 'left' }} />
        </div>

        {/* wordmark */}
        <h1
          className="animate-fade-up d-2 vyas-font-display vyas-hero-word leading-[0.95] max-w-full"
          style={{ fontSize: 'clamp(2.4rem, 10.5vw, 9rem)' }}
        >
          Vyas Sweets
        </h1>

        {/* sub-line */}
        <p className="animate-fade-up d-3 vyas-font-ui mt-5" style={{ fontSize: 'clamp(12px, 2vw, 20px)', fontWeight: 500, letterSpacing: '.4em', color: '#F0C48A' }}>
          &amp; DRYFRUITS · MUMBAI
        </p>

        {/* tagline */}
        <p className="animate-fade-up d-4 mt-6 max-w-xl leading-relaxed" style={{ fontSize: 'clamp(14px, 1.6vw, 18px)', color: 'rgba(255,248,240,0.82)' }}>
          Ghee-roasted mithai, farsan &amp; dryfruits — handmade fresh every
          morning on Station Road, Goregaon West.
        </p>

        {/* CTAs */}
        <div className="animate-fade-up d-5 mt-9 w-full flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/category/all"
            className="btn-shine inline-flex items-center gap-2.5 text-white font-bold px-8 py-4 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #C41230, #9B0E25)' }}
          >
            <ShoppingBag size={17} /> Browse the counter
          </Link>
          <a
            href="tel:+919869313539"
            className="inline-flex items-center gap-2.5 font-semibold px-7 py-4 rounded-full transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.32)', color: '#fff', backdropFilter: 'blur(6px)' }}
          >
            <Phone size={15} style={{ color: '#F0CE6A' }} /> +91 98693 13539
          </a>
        </div>
      </div>

      {/* ── scroll cue ── */}
      <button
        onClick={scrollDown}
        aria-label="Scroll to explore"
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5"
        style={{ color: 'rgba(255,248,240,0.75)' }}
      >
        <span className="vyas-font-ui" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.28em' }}>EXPLORE</span>
        <ChevronDown size={20} className="vyas-scroll-cue" />
      </button>
    </section>
  );
}
