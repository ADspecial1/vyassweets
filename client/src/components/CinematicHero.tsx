import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Phone, Star, ArrowRight } from 'lucide-react';

/* ══════════════════════════════════════════════════════════════════════
   VYAS HERO — "The Counter" premium redesign
   An asymmetric 7/5 editorial split on cream: an oversized Fraunces headline,
   a thin gold rule and one supporting line on the left; the store's own
   footage in a tall, bracket-framed panel with a floating rating ticket on
   the right. Two clips cross-fade under a Ken-Burns push. Degrades gracefully
   under prefers-reduced-motion (poster still + loops stopped).
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

export default function CinematicHero() {
  const reduce = usePrefersReducedMotion();
  const [idx, setIdx] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % FILMS.length), 8000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === idx) void v.play().catch(() => {});
      else v.pause();
    });
  }, [idx]);

  return (
    <section className="relative overflow-hidden" style={{ background: 'var(--sf-paper)' }}>
      {/* faint counter texture + warm corner glows */}
      <div className="absolute inset-0 indian-pattern opacity-[0.5] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(196,18,48,0.08), transparent 70%)' }} />
      <div className="absolute -bottom-32 -left-24 w-[360px] h-[360px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.12), transparent 70%)' }} />

      {/* rotated edge rail */}
      <div className="hidden lg:block absolute left-4 top-1/2 -translate-y-1/2 sf-rail sf-mono text-[11px] tracking-[0.4em] z-10" style={{ color: 'rgba(196,18,48,0.55)' }}>
        EST. 1951 · GOREGAON WEST
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-14 sm:py-20 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* LEFT — headline (centered on mobile, left on desktop) */}
          <div className="lg:col-span-7 lg:pr-6 text-center lg:text-left">
            <p className="sf-mono mb-6 flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1" style={{ fontSize: 12, letterSpacing: '0.28em', color: 'var(--sf-crimson)' }}>
              VYAS SWEETS
              <span className="sf-deva" style={{ letterSpacing: 0, color: 'rgba(196,18,48,0.6)' }}>· अस्सी साल की मिठास</span>
            </p>

            <h1 className="sf-display sf-h1 sf-wipe" style={{ color: 'var(--sf-ink)' }}>
              Mithai made<br />the <span style={{ color: 'var(--sf-crimson)' }}>1951</span> way.
            </h1>

            {/* thin gold rule under the headline */}
            <div className="mt-7 mb-6 h-[2px] w-28 rounded-full mx-auto lg:mx-0" style={{ background: 'linear-gradient(90deg, var(--sf-gold), rgba(212,175,55,0))' }} />

            <p className="sf-lead max-w-md mx-auto lg:mx-0" style={{ color: 'var(--sf-ink-soft)' }}>
              Ghee-roasted sweets, farsan &amp; dryfruits — handmade fresh every
              morning on Station Road, Goregaon West.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center lg:justify-start gap-3">
              <Link to="/category/all" className="sf-btn sf-btn-primary text-base px-8 py-4 sf-shadow-lg justify-center">
                <ShoppingBag size={17} /> Browse the counter
              </Link>
              <a href="tel:+919869313539" className="sf-btn sf-btn-ghost text-base px-7 py-4 justify-center">
                <Phone size={15} style={{ color: 'var(--sf-crimson)' }} /> <span className="sf-num">+91 98693 13539</span>
              </a>
            </div>
          </div>

          {/* RIGHT — footage in a bracket-framed panel.
              Contained + centered on mobile; the rating ticket only overlaps on
              lg so nothing clips off-screen on phones. */}
          <div className="lg:col-span-5 relative w-full max-w-sm sm:max-w-md mx-auto lg:max-w-none">
            <div className="sf-brackets relative">
              <div className="relative overflow-hidden rounded-[28px] sf-shadow-xl aspect-[16/11] sm:aspect-[4/5]" style={{ border: '1px solid rgba(212,175,55,0.35)' }}>
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
                      muted loop playsInline autoPlay
                      preload={i === 0 ? 'auto' : 'metadata'}
                    />
                  </div>
                ))}
                {/* base wash for the seal legibility */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(0deg, rgba(26,8,8,0.35), transparent 45%)' }} />
                {/* corner seal */}
                <div className="absolute top-4 right-4 sf-mono text-[10px] tracking-[0.2em] px-2.5 py-1 rounded-full text-white" style={{ background: 'rgba(26,8,8,0.55)', backdropFilter: 'blur(4px)' }}>
                  SINCE 1951
                </div>
              </div>

              {/* rating ticket — inset on mobile, overlapping only on lg */}
              <div className="absolute left-3 bottom-3 lg:-left-6 lg:-bottom-6 bg-white rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 sf-shadow-lg sf-ring-gold flex items-center gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4].map((s) => <Star key={s} size={13} style={{ fill: 'var(--sf-gold)', color: 'var(--sf-gold)' }} />)}
                    <Star size={13} style={{ fill: 'rgba(212,175,55,0.35)', color: 'rgba(212,175,55,0.35)' }} />
                  </div>
                  <span className="sf-tag mt-1" style={{ color: 'var(--sf-ink-soft)' }}>1,172 reviews</span>
                </div>
                <div className="sf-num text-2xl font-medium pl-3" style={{ color: 'var(--sf-ink)', borderLeft: '1px solid var(--sf-line)' }}>4.3</div>
              </div>
            </div>

            {/* scroll cue — desktop only */}
            <button
              onClick={() => window.scrollBy({ top: window.innerHeight * 0.82, behavior: 'smooth' })}
              aria-label="Scroll to explore"
              className="hidden lg:flex absolute -right-2 -bottom-2 items-center gap-1.5 sf-mono text-[10px] tracking-[0.25em] group"
              style={{ color: 'var(--sf-ink-soft)' }}
            >
              EXPLORE <ArrowRight size={13} className="rotate-90 vyas-scroll-cue" style={{ color: 'var(--sf-crimson)' }} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
