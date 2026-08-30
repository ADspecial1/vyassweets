import { useRef, type ReactNode } from 'react';

type TiltProps = {
  children: ReactNode;
  className?: string;
  /** styles applied to the tilting surface */
  style?: React.CSSProperties;
  /** max rotation in degrees */
  max?: number;
  /** lift toward viewer on hover, px */
  lift?: number;
};

/**
 * Pointer-reactive 3D tilt. Wraps a card; on hover the card leans in 3D
 * toward the cursor and lifts, with a specular sheen following the pointer.
 * Pure CSS transforms (compositor) — no re-render per move. Disabled for
 * touch/coarse pointers and prefers-reduced-motion via CSS.
 */
export default function Tilt({ children, className = '', style, max = 10, lift = 14 }: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;   // 0..1
    const py = (e.clientY - r.top) / r.height;   // 0..1
    const rx = (0.5 - py) * max * 2;
    const ry = (px - 0.5) * max * 2;
    el.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
    el.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
    el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  return (
    <div
      ref={ref}
      className="tilt"
      style={{ '--lift': `${lift}px` } as React.CSSProperties}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      <div className={`tilt-inner ${className}`} style={style}>
        {children}
        <span className="tilt-sheen" aria-hidden="true" />
      </div>
    </div>
  );
}
