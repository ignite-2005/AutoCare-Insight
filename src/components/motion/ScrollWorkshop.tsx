'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import { ArrowDown, ArrowRight, CalendarDays, Wrench, ScanLine, Receipt, Check } from 'lucide-react';
import { motionTokens } from '@/lib/motion-tokens';
import { Reveal, useMotionAllowed } from './SiteMotion';

const chapters = [
  { title: 'A clear handover.', label: 'Intake', tone: 'blue', icon: CalendarDays, position: '48% 48%', description: 'Every great service starts before the first repair. Bring the appointment, the vehicle and the concern into one clear view.', details: ['Appointments & service requests', 'Vehicle condition & intake photos'], href: '/appointments', action: 'View appointments', caption: '01 / READY FOR THE WORKSHOP' },
  { title: 'Keep every bay moving.', label: 'Workshop', tone: 'orange', icon: Wrench, position: '65% 65%', description: 'From the handover to hands-on work. Connect technicians, job progress and replacement parts without losing the service history.', details: ['Technician assignments & job progress', 'Parts allocation & inventory'], href: '/jobs', action: 'View workshop jobs', caption: '02 / PRECISION IN PROGRESS' },
  { title: 'Look a little deeper.', label: 'Diagnostics', tone: 'violet', icon: ScanLine, position: '90% 70%', description: 'Give every finding a place in the bigger picture. Connect inspection results and trouble codes to the repair record.', details: ['Inspection findings & trouble codes', 'Searchable diagnostic history'], href: '/reports', action: 'View repair reports', caption: '03 / INSIGHT BEHIND THE REPAIR' },
  { title: 'Close the loop.', label: 'Settlement', tone: 'emerald', icon: Receipt, position: '74% 40%', description: 'The final handover should feel as considered as the first. Bring the work, the parts and the payment into one complete service record.', details: ['Itemised invoices & payment status', 'Completed work & service history'], href: '/invoices', action: 'View invoices', caption: '04 / READY FOR THE ROAD' },
];

function Chapter({ index }: { index: number }) {
  const chapter = chapters[index];
  const ref = useRef<HTMLElement>(null);
  const allowed = useMotionAllowed();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 0.35, 0.75, 1], [motionTokens.distance.lg, 0, 0, -motionTokens.distance.md]);
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.8, 1], [0.4, 1, 1, 0.4]);

  return <motion.article ref={ref} id={`journey-chapter-${index}`} className="scroll-chapter" data-tone={chapter.tone} style={{ y: allowed ? y : 0, opacity: allowed ? opacity : 1 }}>
    <span className="chapter-index">0{index + 1}<chapter.icon size={23} /></span>
    <p className="eyebrow">{chapter.label.toUpperCase()}</p>
    <h3>{chapter.title}</h3><p className="chapter-description">{chapter.description}</p>
    <ul>{chapter.details.map(detail => <li key={detail}><Check size={15} />{detail}</li>)}</ul>
    <Link href={chapter.href} className="chapter-link">{chapter.action}<ArrowRight size={17} /></Link>
  </motion.article>;
}

export function ScrollWorkshop() {
  const [selected, setSelected] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const allowed = useMotionAllowed(true);
  const parallaxAllowed = useMotionAllowed();
  const chapter = chapters[selected];
  const { scrollYProgress, scrollY } = useScroll({ target: ref, offset: ['start center', 'end center'] });
  const updateSelected = useCallback(() => {
    if (!ref.current) return;
    const narrow = window.matchMedia('(max-width: 800px)').matches;
    const readingLine = narrow ? (ref.current.querySelector('.story-sticky')?.getBoundingClientRect().height || 260) + 95 + motionTokens.distance.lg : window.innerHeight * 0.45;
    let active = 0;
    ref.current.querySelectorAll<HTMLElement>('.scroll-chapter').forEach((element, index) => {
      if (element.getBoundingClientRect().top <= readingLine) active = index;
    });
    setSelected(previous => previous === active ? previous : active);
  }, []);
  useMotionValueEvent(scrollY, 'change', updateSelected);
  useEffect(() => {
    updateSelected();
    window.addEventListener('resize', updateSelected);
    return () => window.removeEventListener('resize', updateSelected);
  }, [updateSelected]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1 + motionTokens.scale.pop - motionTokens.scale.subtle]);
  const choose = (index: number) => {
    setSelected(index);
    const target = document.getElementById(`journey-chapter-${index}`);
    const narrow = window.matchMedia('(max-width: 800px)').matches;
    const offset = narrow ? (ref.current?.querySelector('.story-sticky')?.getBoundingClientRect().height || 260) + 95 : window.innerHeight * 0.3;
    if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: allowed ? 'smooth' : 'instant' });
  };

  return <section ref={ref} id="service-journey" className="scroll-workshop page-container" aria-label="The connected service journey">
    <Reveal className="story-heading"><div><p className="eyebrow">THE SERVICE JOURNEY</p><h2>Every stage.<br /><span>In sync.</span></h2></div><p>From the first handover<br />to the road ahead.<ArrowDown size={19} /></p></Reveal>
    <div className="scroll-story-grid">
      <div className="story-sticky" data-tone={chapter.tone}>
        <div className="story-image-frame">
          <motion.div className="story-image-parallax" style={{ scale: parallaxAllowed ? imageScale : 1 }}>
            <AnimatePresence initial={false} mode="sync"><motion.div key={selected} className="story-image-layer" initial={{ opacity: 1, scale: 1 }} animate={{ opacity: [0, 1], scale: allowed ? [motionTokens.scale.pop, 1] : 1 }} exit={{ opacity: 0 }} transition={{ duration: allowed ? motionTokens.duration.slow : motionTokens.duration.fast, ease: motionTokens.easing.smooth }}><Image src="/branding/autocare-workshop.png" alt="Cinematic workshop view of a vehicle with a diagnostic cutaway" fill sizes="(max-width: 800px) 100vw, 52vw" style={{ objectPosition: chapter.position }} /></motion.div></AnimatePresence>
          </motion.div>
          <div className="story-image-shade" />
          <div className="story-frame-top"><span><i />WORKFLOW PREVIEW</span><chapter.icon size={21} /></div>
          <div className="story-image-caption"><span className="story-frame-number">0{selected + 1}</span><span>{chapter.caption}</span></div>
          <div className="story-colour-track"><motion.span style={{ scaleX: allowed ? scrollYProgress : 1 }} /></div>
        </div>
        <div className="story-chapter-controls" aria-label="Jump to a service stage">{chapters.map((item, index) => <button key={item.label} type="button" data-tone={item.tone} aria-pressed={selected === index} aria-controls={`journey-chapter-${index}`} onClick={() => choose(index)}><item.icon size={17} /><span>{item.label}</span><i /></button>)}</div>
      </div>
      <div className="scroll-chapters">{chapters.map((item, index) => <Chapter key={item.label} index={index} />)}</div>
    </div>
  </section>;
}
