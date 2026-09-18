import React, { useEffect, useRef } from 'react';

/**
 * Magnetic tilt card — card tilts towards the cursor (3D perspective effect).
 * Inspired by 21st.dev premium card interactions.
 */
export function TiltCard({ children, className = '', intensity = 10 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotateX = ((y - cy) / cy) * -intensity;
      const rotateY = ((x - cx) / cx) * intensity;
      el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`;
    };

    const onMouseLeave = () => {
      el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    };

    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);
    return () => {
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [intensity]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ transition: 'transform 0.1s ease-out', willChange: 'transform' }}
    >
      {children}
    </div>
  );
}

/**
 * Infinite scrolling marquee strip.
 * Inspired by 21st.dev marquee components.
 */
export function Marquee({ items = [], speed = 40, className = '' }) {
  return (
    <div className={`overflow-hidden flex ${className}`} aria-hidden>
      {[0, 1].map((n) => (
        <div
          key={n}
          className="flex shrink-0 items-center gap-12"
          style={{
            animation: `marquee ${speed}s linear infinite`,
            willChange: 'transform',
          }}
        >
          {items.map((item, i) => (
            <span key={i} className="text-xs uppercase tracking-[0.2em] text-white/20 whitespace-nowrap">
              {item}
            </span>
          ))}
          <span className="text-white/10 text-lg">✦</span>
        </div>
      ))}

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

/**
 * Spotlight hero background — glowing radial gradient that follows the mouse.
 * Inspired by 21st.dev hero spotlight effect.
 */
export function SpotlightHero({ children, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--x', `${x}%`);
      el.style.setProperty('--y', `${y}%`);
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      style={{
        '--x': '50%',
        '--y': '50%',
      }}
    >
      {/* Spotlight glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(400px circle at var(--x) var(--y), rgba(255,255,255,0.04), transparent 60%)',
        }}
      />
      {children}
    </div>
  );
}

/**
 * Skeleton loader — pulse shimmer for loading states.
 */
export function Skeleton({ className = '' }) {
  return (
    <div
      className={`rounded-sm bg-white/5 ${className}`}
      style={{
        backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.5s infinite',
      }}
    />
  );
}

export function ProductSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="aspect-square w-full" style={{ animation: 'skeleton-shimmer 1.5s infinite' }} />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-1/4" />
      <style>{`
        @keyframes skeleton-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

/**
 * Animated number counter.
 */
export function Counter({ value, prefix = '', suffix = '', duration = 1500 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let start = 0;
    const end = parseFloat(value) || 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      el.textContent = prefix + (Number.isInteger(end) ? Math.floor(start) : start.toFixed(2)) + suffix;
      if (start >= end) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [value, prefix, suffix, duration]);
  return <span ref={ref}>{prefix}0{suffix}</span>;
}
