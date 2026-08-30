import {
  useEffect, useLayoutEffect, useRef, useState,
  type CSSProperties, type ReactNode, type PointerEvent as ReactPointerEvent,
} from 'react';

/* ══════════════════════════════════════════════════════════════════════
   VYAS DESIGNED BANNERS — 1a–1f

   Faithful, high-fidelity recreation of the client's banner artwork from the
   design handoff. Each banner is authored in its own design-pixel coordinate
   space and scaled to the container with a single transform (guarantees the
   exact geometry from the exports). Motion — bowl entrance + idle float, tile
   cascade, wordmark reveal, arch draw, gold-strip shimmer, pointer parallax,
   tile hover — is all opt-out under prefers-reduced-motion. Below `sm` the
   composition reflows to a legible stacked layout instead of shrinking type.
   Companion CSS lives in index.css under "VYAS DESIGNED BANNERS".
══════════════════════════════════════════════════════════════════════ */

/* ── Design tokens (banner artwork palette) ── */
const CREAM = '#FCF1E2';
const CREAM_WARM = '#F4E3C8';
const CRIMSON = '#9E0F27';
const CRIMSON_L = '#A81029';
const CRIMSON_D = '#7C0A1E';
const CRIMSON_INK = '#8E0B22';
const MAROON = '#4A0710';
const MAROON_D = '#230409';
const GOLD = '#C9A227';
const GOLD_MID = '#B8912C';
const GOLD_DEEP = '#8C6B1E';
const SAFFRON = '#E8A33D';
const TAN = '#B08442';
const TAN_LIGHT = '#D9B98C';
const TAN_WARM = '#F0C48A';

const GOLD_STRIP = '/vyas/gold-strip.webp';
const BOWLS = [
  '/vyas/bowl-1-kachori.png',
  '/vyas/bowl-2-sev.png',
  '/vyas/bowl-3-puri.png',
  '/vyas/bowl-4-chivda.png',
  '/vyas/bowl-5-masala.png',
  '/vyas/bowl-6-mixture.png',
];
const TILES = [
  'tile-01-papdi', 'tile-02-bhel', 'tile-03-kachori-mini', 'tile-04-cornflake-chivda',
  'tile-05-sev-yellow', 'tile-06-fafda-mix', 'tile-07-boondi', 'tile-08-farsi-mix',
  'tile-09-poha-chivda', 'tile-10-sev-cashew', 'tile-11-wafer-chips', 'tile-12-cornflake-spicy',
  'tile-13-boondi-spicy', 'tile-14-sev-red', 'tile-15-ratlami-sev', 'tile-16-puri-plain',
  'tile-17-dryfruit-mix', 'tile-18-soan-cubes', 'tile-19-mixture-curry', 'tile-20-chana-spicy',
].map((n) => `/vyas/tiles/${n}.png`);

const CREAM_DOT: CSSProperties = {
  backgroundImage: 'radial-gradient(circle at 26px 26px, rgba(201,162,39,.15) 3.5px, transparent 4.5px)',
  backgroundSize: '74px 74px',
};
const CRIMSON_DOT: CSSProperties = {
  backgroundImage: 'radial-gradient(circle at 34px 34px, rgba(255,255,255,.06) 5px, transparent 6px)',
  backgroundSize: '96px 96px',
};
const MAROON_DOT: CSSProperties = {
  backgroundImage: 'radial-gradient(circle at 28px 28px, rgba(201,162,39,.1) 4px, transparent 5px)',
  backgroundSize: '84px 84px',
};

const COPY = { since: 'SINCE 1951', word: 'Vyas Sweets', sub: '& DRYFRUITS · MUMBAI' };

/* ══════════════════════════════════════
   HOOKS
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

function usePointerFine() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)');
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return fine;
}

/** width-driven scale = containerWidth / designWidth */
function useScale(designW: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setScale(el.clientWidth / designW);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [designW]);
  return { ref, scale };
}

/** latches true the first time the element is 25% on-screen */
function useEntered() {
  const ref = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || entered) return;
    const io = new IntersectionObserver(
      (entries, obs) => entries.forEach((e) => { if (e.isIntersecting) { setEntered(true); obs.disconnect(); } }),
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [entered]);
  return { ref, entered };
}

/** damped pointer parallax — sets --vx / --vy (-1..1) on the returned ref */
function useParallax(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const cur = useRef({ x: 0, y: 0 });
  const raf = useRef(0);

  const tick = () => {
    cur.current.x += (target.current.x - cur.current.x) * 0.08;
    cur.current.y += (target.current.y - cur.current.y) * 0.08;
    const el = ref.current;
    if (el) {
      el.style.setProperty('--vx', cur.current.x.toFixed(3));
      el.style.setProperty('--vy', cur.current.y.toFixed(3));
    }
    if (Math.abs(target.current.x - cur.current.x) > 0.001 || Math.abs(target.current.y - cur.current.y) > 0.001) {
      raf.current = requestAnimationFrame(tick);
    } else {
      raf.current = 0;
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    target.current = {
      x: ((e.clientX - r.left) / r.width) * 2 - 1,
      y: ((e.clientY - r.top) / r.height) * 2 - 1,
    };
    if (!raf.current) raf.current = requestAnimationFrame(tick);
  };
  const onPointerLeave = () => {
    target.current = { x: 0, y: 0 };
    if (!raf.current) raf.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);
  return { ref, onPointerMove, onPointerLeave };
}

/* ══════════════════════════════════════
   PRIMITIVES
══════════════════════════════════════ */

type StageProps = {
  designW: number;
  designH: number;
  entered: boolean;
  fill?: boolean;
  className?: string;
  style?: CSSProperties;
  innerRef?: React.Ref<HTMLDivElement>;
  onPointerMove?: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerLeave?: () => void;
  children: ReactNode;
};

/** Renders children at native design px, scaled to fit the container width. */
function Stage({
  designW, designH, entered, fill = false, className = '', style,
  innerRef, onPointerMove, onPointerLeave, children,
}: StageProps) {
  const { ref, scale } = useScale(designW);
  const outerStyle: CSSProperties = fill
    ? { position: 'absolute', inset: 0, ...style }
    : { aspectRatio: `${designW} / ${designH}`, ...style };
  return (
    <div
      ref={ref}
      className={`vyas-stage ${className}`}
      style={outerStyle}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div
        ref={innerRef}
        className={`vyas-scale ${entered ? 'vyas-in' : ''}`}
        style={{ width: designW, height: designH, transform: `scale(${scale || 0.0001})` }}
      >
        {children}
      </div>
    </div>
  );
}

/** Scalloped cartouche photo frame. `sm` uses a shallower bite for small tiles. */
function Cartouche({ src, style, sm = false }: { src: string; style?: CSSProperties; sm?: boolean }) {
  return (
    <div className={sm ? 'vyas-cartouche-sm' : 'vyas-cartouche'} style={style}>
      <div className={sm ? 'vyas-cartouche-inner-sm' : 'vyas-cartouche-inner'}><img src={src} alt="" /></div>
    </div>
  );
}

/** A gold ornament band (72 design-px tall) with a slow shimmer sweep. */
function OrnamentBand({ pos }: { pos: 'top' | 'bottom' }) {
  return (
    <div
      className="absolute left-0 right-0"
      style={{
        height: 72,
        ...(pos === 'top' ? { top: 0 } : { bottom: 0 }),
        zIndex: 40,
        background: `${CREAM} url(${GOLD_STRIP}) repeat-x center / 2000px 50px`,
        overflow: 'hidden',
      }}
    >
      <div
        className="vyas-shimmer-el"
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(100deg, transparent 40%, rgba(255,255,255,.55) 50%, transparent 60%)',
          WebkitMaskImage: `url(${GOLD_STRIP})`, maskImage: `url(${GOLD_STRIP})`,
          WebkitMaskSize: '2000px 50px', maskSize: '2000px 50px',
          WebkitMaskRepeat: 'repeat-x', maskRepeat: 'repeat-x',
          WebkitMaskPosition: 'center', maskPosition: 'center',
        }}
      />
    </div>
  );
}

type BowlProps = {
  src: string; left: number; top: number; size: number;
  shadowTop: number; shadowH?: number; drop: string;
  enterDelay: number; floatDelay: number;
};
function Bowl({ src, left, top, size, shadowTop, shadowH = 84, drop, enterDelay, floatDelay }: BowlProps) {
  return (
    <>
      <div
        className="vyas-shadow-anim"
        style={{
          position: 'absolute', left, top: shadowTop, width: size, height: shadowH,
          background: 'radial-gradient(ellipse at center, rgba(60,2,10,.5), rgba(60,2,10,0) 70%)',
          animationDelay: `${floatDelay}s`,
        }}
      />
      <div className="vyas-bowl-anim" style={{ position: 'absolute', left, top, width: size, height: size, animationDelay: `${enterDelay}s` }}>
        <div className="vyas-float" style={{ width: '100%', height: '100%', animationDelay: `${floatDelay}s` }}>
          <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: drop }} />
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════
   1a — ARCH & TRIO · 2700 × 1648
══════════════════════════════════════ */

function Banner1a({ entered, fill }: { entered: boolean; fill?: boolean }) {
  const reduce = usePrefersReducedMotion();
  const fine = usePointerFine();
  const px = useParallax(!reduce && fine);

  return (
    <Stage
      designW={2700} designH={1648} entered={entered} fill={fill}
      className="rounded-3xl" style={{ background: CREAM }}
      innerRef={px.ref} onPointerMove={px.onPointerMove} onPointerLeave={px.onPointerLeave}
    >
      {/* cream dot motif (parallax) */}
      <div style={{ position: 'absolute', inset: -16, ...CREAM_DOT, transform: 'translate(calc(var(--vx,0)*5px), calc(var(--vy,0)*5px))' }} />

      {/* crimson arch (draws up), parallax + inner crimson dots */}
      <div style={{ position: 'absolute', left: '-16%', right: '-16%', top: 860, bottom: 0, transform: 'translate(calc(var(--vx,0)*2px), 0)' }}>
        <div
          className="vyas-arch-el"
          style={{ position: 'absolute', inset: 0, background: CRIMSON, borderRadius: '50% 50% 0 0 / 260px 260px 0 0', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', inset: 0, ...CRIMSON_DOT }} />
        </div>
      </div>

      {/* copy stack */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, zIndex: 30 }}>
        <div className="vyas-word-anim vyas-font-ui" style={{ display: 'flex', alignItems: 'center', gap: 26, animationDelay: '0s' }}>
          <span className="vyas-rule-anim" style={{ width: 96, height: 2, background: GOLD }} />
          <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: '.44em', color: GOLD }}>{COPY.since}</span>
          <span className="vyas-rule-anim" style={{ width: 96, height: 2, background: GOLD }} />
        </div>
        <div className="vyas-word-anim vyas-font-display" style={{ fontSize: 196, lineHeight: 0.98, color: CRIMSON_INK, animationDelay: '0.1s' }}>{COPY.word}</div>
        <div className="vyas-word-anim vyas-font-ui" style={{ fontSize: 37, fontWeight: 500, letterSpacing: '.36em', color: TAN, animationDelay: '0.2s' }}>{COPY.sub}</div>
      </div>

      {/* bowls + contact shadows (parallax, opposite the cursor) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 20, transform: 'translate(calc(var(--vx,0)*-14px), calc(var(--vy,0)*-14px))' }}>
        <Bowl src={BOWLS[0]} left={350} top={770} size={700} shadowTop={1290} drop="drop-shadow(0 18px 26px rgba(40,0,6,.35))" enterDelay={0.12} floatDelay={0.9} />
        <Bowl src={BOWLS[1]} left={980} top={640} size={740} shadowTop={1200} shadowH={90} drop="drop-shadow(0 18px 26px rgba(40,0,6,.35))" enterDelay={0} floatDelay={0.8} />
        <Bowl src={BOWLS[2]} left={1650} top={770} size={700} shadowTop={1290} drop="drop-shadow(0 18px 26px rgba(40,0,6,.35))" enterDelay={0.24} floatDelay={1.4} />
      </div>

      <OrnamentBand pos="top" />
      <OrnamentBand pos="bottom" />
    </Stage>
  );
}

/* ══════════════════════════════════════
   1b — SPLIT PANEL & MOSAIC · 2700 × 1648
══════════════════════════════════════ */

function Banner1b({ entered, fill }: { entered: boolean; fill?: boolean }) {
  return (
    <Stage designW={2700} designH={1648} entered={entered} fill={fill} className="rounded-3xl" style={{ background: CREAM_WARM }}>
      {/* left maroon panel */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 1180, background: `linear-gradient(160deg, ${MAROON}, ${MAROON_D} 70%)`, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, ...MAROON_DOT }} />
        <div style={{ position: 'absolute', inset: 64, border: '2px solid rgba(201,162,39,.5)' }} />
        <div style={{ position: 'absolute', inset: 78, border: '1px solid rgba(201,162,39,.25)' }} />
        <div style={{ position: 'absolute', left: 150, right: 150, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 34, zIndex: 10 }}>
          <div className="vyas-word-anim vyas-font-ui" style={{ fontSize: 30, fontWeight: 700, letterSpacing: '.44em', color: GOLD, animationDelay: '0s' }}>{COPY.since}</div>
          <div className="vyas-word-anim vyas-font-display" style={{ fontSize: 158, lineHeight: 0.98, color: CREAM, animationDelay: '0.1s' }}>Vyas<br />Sweets</div>
          <div className="vyas-rule-anim" style={{ width: 220, height: 2, background: GOLD, transformOrigin: 'left' }} />
          <div className="vyas-word-anim vyas-font-ui" style={{ fontSize: 31, fontWeight: 500, letterSpacing: '.32em', color: TAN_LIGHT, lineHeight: 1.5, animationDelay: '0.2s' }}>&amp; DRYFRUITS<br />MUMBAI</div>
        </div>
      </div>

      {/* right mosaic panel */}
      <div className="vyas-mosaic" style={{ position: 'absolute', left: 1180, top: 0, right: 0, bottom: 0, background: CREAM_WARM, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', gap: 44, padding: 52 }}>
        {TILES.slice(0, 9).map((src, i) => (
          <div key={src} className="vyas-tile vyas-tile-anim" style={{ animationDelay: `${i * 0.045}s` }}>
            <Cartouche src={src} style={{ width: '100%', height: '100%' }} />
          </div>
        ))}
      </div>

      {/* seam bowl */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 20 }}>
        <Bowl src={BOWLS[4]} left={900} top={790} size={620} shadowTop={1240} drop="drop-shadow(0 22px 30px rgba(20,0,4,.5))" enterDelay={0} floatDelay={0.8} />
      </div>
    </Stage>
  );
}

/* ══════════════════════════════════════
   1c — DOUBLE RIBBON · 6000 × 2188
══════════════════════════════════════ */

function Ribbon({ items, offset }: { items: string[]; offset: number }) {
  return (
    <div className="vyas-ribbon" style={{ height: 494, display: 'flex', gap: 26, padding: '48px 72px' }}>
      {items.map((src, i) => (
        <div key={src} className="vyas-tile vyas-tile-anim" style={{ flex: 1, animationDelay: `${(offset + i) * 0.045}s` }}>
          <Cartouche src={src} style={{ width: '100%', height: '100%' }} />
        </div>
      ))}
    </div>
  );
}

function Banner1c({ entered, fill, rounded = true }: { entered: boolean; fill?: boolean; rounded?: boolean }) {
  return (
    <Stage designW={6000} designH={2188} entered={entered} fill={fill} className={rounded ? 'rounded-3xl' : ''} style={{ background: CRIMSON }}>
      <div style={{ position: 'absolute', inset: 0, ...CRIMSON_DOT }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', zIndex: 10 }}>
        <div style={{ height: 72 }} />
        <Ribbon items={TILES.slice(0, 10)} offset={0} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 38 }}>
          <div className="vyas-word-anim vyas-font-ui" style={{ display: 'flex', alignItems: 'center', gap: 34, animationDelay: '0s' }}>
            <span className="vyas-rule-anim" style={{ width: 150, height: 2, background: SAFFRON }} />
            <span style={{ fontSize: 42, fontWeight: 700, letterSpacing: '.5em', color: SAFFRON }}>{COPY.since}</span>
            <span className="vyas-rule-anim" style={{ width: 150, height: 2, background: SAFFRON }} />
          </div>
          <div className="vyas-word-anim vyas-font-display" style={{ fontSize: 300, lineHeight: 1, color: CREAM, animationDelay: '0.1s' }}>{COPY.word}</div>
          <div className="vyas-word-anim vyas-font-ui" style={{ fontSize: 48, fontWeight: 500, letterSpacing: '.42em', color: TAN_WARM, animationDelay: '0.2s' }}>{COPY.sub}</div>
        </div>
        <Ribbon items={TILES.slice(10, 20)} offset={10} />
        <div style={{ height: 72 }} />
      </div>
      <OrnamentBand pos="top" />
      <OrnamentBand pos="bottom" />
    </Stage>
  );
}

/* ══════════════════════════════════════
   1d — PANEL & SIX BOWLS · 6000 × 2188
══════════════════════════════════════ */

function Banner1d({ entered, fill, rounded = true }: { entered: boolean; fill?: boolean; rounded?: boolean }) {
  const reduce = usePrefersReducedMotion();
  const fine = usePointerFine();
  const px = useParallax(!reduce && fine);

  const bowlPos = [
    { left: 2610, top: 202 }, { left: 3790, top: 202 }, { left: 4970, top: 202 },
    { left: 2610, top: 1072 }, { left: 3790, top: 1072 }, { left: 4970, top: 1072 },
  ];

  return (
    <Stage
      designW={6000} designH={2188} entered={entered} fill={fill}
      className={rounded ? 'rounded-3xl' : ''} style={{ background: CREAM }}
      innerRef={px.ref} onPointerMove={px.onPointerMove} onPointerLeave={px.onPointerLeave}
    >
      <div style={{ position: 'absolute', inset: -16, ...CREAM_DOT, transform: 'translate(calc(var(--vx,0)*5px), calc(var(--vy,0)*5px))' }} />

      {/* crimson panel */}
      <div style={{ position: 'absolute', left: 0, top: 72, bottom: 72, width: 2450, transform: 'translate(calc(var(--vx,0)*2px), 0)' }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(155deg, ${CRIMSON_L}, ${CRIMSON_D})`, borderRadius: '0 300px 300px 0', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, ...CRIMSON_DOT }} />
        </div>
        <div style={{ position: 'absolute', left: 250, top: 0, bottom: 0, width: 1800, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 40, zIndex: 10 }}>
          <div className="vyas-word-anim vyas-font-ui" style={{ fontSize: 40, fontWeight: 700, letterSpacing: '.48em', color: SAFFRON, animationDelay: '0s' }}>{COPY.since}</div>
          <div className="vyas-word-anim vyas-font-display" style={{ fontSize: 262, lineHeight: 0.98, color: CREAM, animationDelay: '0.1s' }}>Vyas<br />Sweets</div>
          <div className="vyas-rule-anim" style={{ width: 300, height: 3, background: SAFFRON, transformOrigin: 'left' }} />
          <div className="vyas-word-anim vyas-font-ui" style={{ fontSize: 44, fontWeight: 500, letterSpacing: '.36em', color: TAN_WARM, animationDelay: '0.2s' }}>{COPY.sub}</div>
        </div>
      </div>

      {/* six bowls (parallax) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 20, transform: 'translate(calc(var(--vx,0)*-14px), calc(var(--vy,0)*-14px))' }}>
        {bowlPos.map((p, i) => (
          <Bowl
            key={BOWLS[i]} src={BOWLS[i]} left={p.left} top={p.top} size={760}
            shadowTop={p.top + 700} shadowH={86}
            drop="drop-shadow(0 20px 28px rgba(90,40,10,.28))"
            enterDelay={i * 0.1} floatDelay={0.9 + (i % 3) * 0.35}
          />
        ))}
      </div>

      <OrnamentBand pos="top" />
      <OrnamentBand pos="bottom" />
    </Stage>
  );
}

/* ══════════════════════════════════════
   1e / 1f — ORNAMENT STRIPS · 2000 × 50
══════════════════════════════════════ */

function Diamond({ size, color }: { size: number; color: string }) {
  return <span style={{ width: size, height: size, background: color, transform: 'rotate(45deg)', display: 'block' }} />;
}

export function OrnamentStrip({ variant = 'gold', className = '' }: { variant?: 'gold' | 'crimson'; className?: string }) {
  if (variant === 'crimson') {
    return (
      <Stage designW={2000} designH={50} entered className={className}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 4, height: 2, background: CRIMSON }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 9, height: 1, background: 'rgba(158,15,39,.45)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 20, display: 'flex', justifyContent: 'center', gap: 20 }}>
          {Array.from({ length: 27 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: CRIMSON, display: 'block' }} />
              <Diamond size={16} color={GOLD} />
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: CRIMSON, display: 'block' }} />
            </div>
          ))}
        </div>
      </Stage>
    );
  }
  return (
    <Stage designW={2000} designH={50} entered className={className}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 12, display: 'flex', justifyContent: 'center', gap: 16 }}>
        {Array.from({ length: 29 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <Diamond size={16} color={GOLD_MID} />
            <Diamond size={7} color={GOLD} />
            <Diamond size={16} color={GOLD_DEEP} />
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 8, height: 2, background: GOLD_MID }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 3, height: 1, background: 'rgba(184,145,44,.5)' }} />
    </Stage>
  );
}

/* ══════════════════════════════════════
   MOBILE REFLOW (below `sm`)
══════════════════════════════════════ */

function MobileBanner({
  fieldStyle, dot, ink, eyebrowColor, subColor, ruleColor, wordLines, children,
}: {
  fieldStyle: CSSProperties; dot: CSSProperties;
  ink: string; eyebrowColor: string; subColor: string; ruleColor: string;
  wordLines: string; children: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl animate-fade-up" style={fieldStyle}>
      <div className="absolute inset-0 pointer-events-none" style={dot} />
      <OrnamentStrip variant="gold" />
      <div className="relative z-10 px-6 pt-9 pb-5 flex flex-col items-center text-center">
        <div className="vyas-font-ui" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.36em', color: eyebrowColor }}>{COPY.since}</div>
        <div className="vyas-font-display" style={{ fontSize: 'clamp(2.1rem, 12vw, 3.2rem)', lineHeight: 1, color: ink, marginTop: 10 }} dangerouslySetInnerHTML={{ __html: wordLines }} />
        <div style={{ width: 90, height: 2, background: ruleColor, margin: '14px 0 12px' }} />
        <div className="vyas-font-ui" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '.28em', color: subColor }}>{COPY.sub}</div>
      </div>
      <div className="relative z-10 px-5 pb-9">{children}</div>
      <OrnamentStrip variant="gold" />
    </div>
  );
}

function bowlImg(src: string, drop: string) {
  return <img src={src} alt="" style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'contain', filter: drop }} />;
}

function MobileHero1a() {
  return (
    <MobileBanner
      fieldStyle={{ background: CREAM }} dot={{ ...CREAM_DOT }}
      ink={CRIMSON_INK} eyebrowColor={GOLD} subColor={TAN} ruleColor={GOLD}
      wordLines="Vyas Sweets"
    >
      <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
        {BOWLS.slice(0, 3).map((s) => <div key={s}>{bowlImg(s, 'drop-shadow(0 10px 16px rgba(40,0,6,.35))')}</div>)}
      </div>
    </MobileBanner>
  );
}

function MobileHero1b() {
  return (
    <MobileBanner
      fieldStyle={{ background: `linear-gradient(160deg, ${MAROON}, ${MAROON_D} 80%)` }} dot={{ ...MAROON_DOT }}
      ink={CREAM} eyebrowColor={GOLD} subColor={TAN_LIGHT} ruleColor={GOLD}
      wordLines="Vyas<br/>Sweets"
    >
      <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
        {TILES.slice(0, 4).map((src) => (
          <div key={src} className="vyas-tile"><Cartouche src={src} sm style={{ width: '100%', aspectRatio: '1 / 1' }} /></div>
        ))}
      </div>
    </MobileBanner>
  );
}

function MobileWide1d() {
  return (
    <MobileBanner
      fieldStyle={{ background: CREAM }} dot={{ ...CREAM_DOT }}
      ink={CRIMSON_INK} eyebrowColor={SAFFRON} subColor={TAN} ruleColor={SAFFRON}
      wordLines="Vyas Sweets"
    >
      <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
        {BOWLS.map((s) => <div key={s}>{bowlImg(s, 'drop-shadow(0 10px 16px rgba(90,40,10,.28))')}</div>)}
      </div>
    </MobileBanner>
  );
}

function MobileRibbon() {
  return (
    <MobileBanner
      fieldStyle={{ background: CRIMSON }} dot={{ ...CRIMSON_DOT }}
      ink={CREAM} eyebrowColor={SAFFRON} subColor={TAN_WARM} ruleColor={SAFFRON}
      wordLines="Vyas Sweets"
    >
      <div className="grid grid-cols-3 gap-2.5 max-w-sm mx-auto">
        {TILES.slice(0, 9).map((src) => (
          <div key={src} className="vyas-tile"><Cartouche src={src} sm style={{ width: '100%', aspectRatio: '1 / 1' }} /></div>
        ))}
      </div>
    </MobileBanner>
  );
}

/* ══════════════════════════════════════
   PUBLIC: HERO CAROUSEL (1a ⇄ 1b)
══════════════════════════════════════ */

const HERO_SLIDES = [Banner1a, Banner1b] as const;

export function VyasHeroCarousel() {
  const [idx, setIdx] = useState(0);
  const [entered, setEntered] = useState<boolean[]>([true, false]);
  const [paused, setPaused] = useState(false);

  // advance; pause on hover and when the tab is hidden
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setIdx((i) => {
        const next = (i + 1) % HERO_SLIDES.length;
        setEntered((e) => (e[next] ? e : e.map((v, k) => (k === next ? true : v))));
        return next;
      });
    }, 6000);
    return () => clearInterval(t);
  }, [paused]);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const go = (i: number) => {
    setIdx(i);
    setEntered((e) => (e[i] ? e : e.map((v, k) => (k === i ? true : v))));
  };

  return (
    <div>
      {/* desktop / tablet: full designed composition, cross-fading */}
      <div
        className="relative hidden sm:block rounded-3xl overflow-hidden"
        style={{ aspectRatio: '2700 / 1648' }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {HERO_SLIDES.map((Slide, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === idx ? 1 : 0, zIndex: i === idx ? 2 : 1, pointerEvents: i === idx ? 'auto' : 'none' }}
          >
            <Slide entered={entered[i]} fill />
          </div>
        ))}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Show banner ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{ background: i === idx ? GOLD : 'rgba(255,255,255,0.55)', width: i === idx ? '2rem' : '0.625rem', height: '0.625rem' }}
            />
          ))}
        </div>
      </div>

      {/* mobile: reflowed, legible stack */}
      <div className="sm:hidden">
        {idx === 0 ? <MobileHero1a /> : <MobileHero1b />}
        <div className="mt-4 flex justify-center gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Show banner ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{ background: i === idx ? CRIMSON : 'rgba(158,15,39,0.3)', width: i === idx ? '2rem' : '0.625rem', height: '0.625rem' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   PUBLIC: WIDE BAND (1d), full-bleed
══════════════════════════════════════ */

export function VyasWideBanner({ bleed = false }: { bleed?: boolean } = {}) {
  const { ref, entered } = useEntered();
  return (
    <div ref={ref}>
      <div className="hidden sm:block">
        <Banner1d entered={entered} rounded={!bleed} />
      </div>
      <div className="sm:hidden">
        <MobileWide1d />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   PUBLIC: FULL-CATALOGUE RIBBON (1c), full-bleed
══════════════════════════════════════ */

export function VyasRibbonBanner({ bleed = false }: { bleed?: boolean } = {}) {
  const { ref, entered } = useEntered();
  return (
    <div ref={ref}>
      <div className="hidden sm:block">
        <Banner1c entered={entered} rounded={!bleed} />
      </div>
      <div className="sm:hidden">
        <MobileRibbon />
      </div>
    </div>
  );
}
