import { useEffect, useRef, useState, type ReactNode } from 'react';

interface RevealOptions {
  delay?: number;
  threshold?: number;
  once?: boolean;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(options: RevealOptions = {}) {
  const { delay = 0, threshold = 0.15, once = true } = options;
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => setVisible(true), delay);
            if (once) obs.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay, threshold, once]);

  return { ref, visible };
}

export function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'article';
}) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>({ delay });
  return (
    <Tag
      ref={ref as never}
      className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`}
    >
      {children}
    </Tag>
  );
}

export function useCountUp(target: number, duration = 1500, startOn = true) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!startOn) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - startTime) / duration, 1);
            setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration, startOn]);

  return { val, ref };
}
