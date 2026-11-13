'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowDown, ArrowRight, ShieldCheck, Layers3 } from 'lucide-react';
import { motionTokens } from '@/lib/motion-tokens';
import { Reveal, useMotionAllowed } from './SiteMotion';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const allowed = useMotionAllowed(true);
  return allowed ? <motion.div className="site-scroll-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" /> : null;
}

export function CinematicHero() {
  const ref = useRef<HTMLElement>(null);
  const allowed = useMotionAllowed();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, motionTokens.distance.parallax]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, motionTokens.scale.pop]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -motionTokens.distance.lg]);

  return (
    <section ref={ref} id="platform" className="product-hero">
      <motion.div className="hero-art" style={{ y: allowed ? imageY : 0, scale: allowed ? imageScale : 1 }} aria-hidden="true"><Image src="/branding/autocare-workshop.png" alt="" fill priority sizes="100vw" /></motion.div>
      <div className="hero-shade" />
      <motion.div className="page-container hero-content" style={{ y: allowed ? copyY : 0 }}>
        <Reveal><p className="eyebrow"><span className="status-dot" /> THE CONNECTED WORKSHOP</p></Reveal>
        <Reveal delay={motionTokens.stagger}><h1>Vehicle service.<br /><span>Connected.</span></h1></Reveal>
        <Reveal delay={motionTokens.stagger * 2}><p className="hero-description">Appointments, diagnostics, parts and billing.<br className="desktop-break" /> One workspace for the whole service journey.</p></Reveal>
        <Reveal delay={motionTokens.stagger * 3}><div className="hero-actions"><Link href="/login" className="button-primary">Open workspace <ArrowRight size={18} /></Link><a href="#workflow" className="button-outline">Explore the workflow <ArrowDown size={16} /></a></div></Reveal>
        <Reveal delay={motionTokens.stagger * 4}><div className="hero-assurance"><ShieldCheck size={15} /> Role-based access <span /> <Layers3 size={15} /> MySQL + MongoDB</div></Reveal>
      </motion.div>
      <a href="#workflow" className="hero-scroll-cue"><span className="scroll-cue-track" aria-hidden="true" />Scroll to explore<ArrowDown size={15} /></a>
      <div className="hero-colour-key" aria-hidden="true"><i /><i /><i /><i /></div>
    </section>
  );
}
