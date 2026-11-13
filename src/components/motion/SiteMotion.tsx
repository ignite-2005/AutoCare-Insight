'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion, useInView, useReducedMotion } from 'motion/react';
import { motionTokens } from '@/lib/motion-tokens';

const MotionPreference = createContext({ reduced: false, toggle: () => {} });

export function useMotionAllowed(essential = false) {
  const reduced = useReducedMotion();
  const manual = useContext(MotionPreference);
  const [capable, setCapable] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    setCapable(!navigator.hardwareConcurrency || navigator.hardwareConcurrency > 4);
  }, []);
  return mounted && (essential || capable) && !reduced && !manual.reduced;
}

export function SiteMotion({ children }: { children: React.ReactNode }) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    document.body.dataset.motion = reduced ? 'reduced' : 'normal';
    return () => { delete document.body.dataset.motion; };
  }, [reduced]);
  return <MotionPreference.Provider value={{ reduced, toggle: () => setReduced(value => !value) }}><MotionConfig reducedMotion={reduced ? 'always' : 'user'}>{children}</MotionConfig></MotionPreference.Provider>;
}

export function MotionToggle() {
  const preference = useContext(MotionPreference);
  const systemReduced = useReducedMotion();
  return <button type="button" className="button-outline motion-toggle" aria-pressed={preference.reduced || !!systemReduced} disabled={!!systemReduced} onClick={preference.toggle} title={systemReduced ? 'Reduced motion is enabled by your system settings.' : 'Compare the website with movement reduced.'}>{systemReduced ? 'System reduced motion' : preference.reduced ? 'Motion reduced' : 'Reduce motion'}</button>;
}

export function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const allowed = useMotionAllowed();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.12 });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={allowed ? inView ? { opacity: [0, 1], y: [motionTokens.distance.lg, 0] } : { opacity: 0, y: motionTokens.distance.lg } : { opacity: 1, y: 0 }}
      transition={{ duration: allowed ? motionTokens.duration.slow : motionTokens.duration.fast, delay: allowed && inView ? delay : 0, ease: motionTokens.easing.smooth }}
    >{children}</motion.div>
  );
}

export function PageTransition({ route, children }: { route: string; children: React.ReactNode }) {
  const allowed = useMotionAllowed();
  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key={route}
        className="page-transition"
        initial={{ opacity: 1, y: 0 }}
        animate={allowed ? { opacity: [0.4, 1], y: [motionTokens.distance.sm, 0] } : { opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: allowed ? -motionTokens.distance.xs : 0 }}
        transition={{ duration: allowed ? motionTokens.duration.normal : motionTokens.duration.fast, ease: motionTokens.easing.smooth }}
      >{children}</motion.div>
    </AnimatePresence>
  );
}
