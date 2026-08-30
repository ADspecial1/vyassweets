import { useEffect, useRef, useState, type ReactNode } from 'react';

type RevealProps = {
  children: ReactNode;
  /** entrance style */
  variant?: 'up' | 'scale' | 'fade' | 'left' | 'right';
  /** seconds of delay before the element eases in */
  delay?: number;
  /** extra classes on the wrapper */
  className?: string;
  /** wrapper element tag, defaults to div */
  as?: 'div' | 'section';
};

/**
 * Reveals its children once, the moment they scroll into view.
 * Uses IntersectionObserver + a CSS class swap so the motion runs on the
 * compositor (opacity/transform only). Honours prefers-reduced-motion via the
 * global media query in index.css, which zeroes the transition.
 */
export default function Reveal({
  children,
  variant = 'up',
  delay = 0,
  className = '',
  as = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || shown) return;

    // No observer support (or SSR) — just show it.
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            obs.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    io.observe(node);
    return () => io.disconnect();
  }, [shown]);

  const Tag = as;
  return (
    <Tag
      ref={ref as never}
      className={`reveal reveal-${variant} ${shown ? 'is-visible' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </Tag>
  );
}
