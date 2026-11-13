'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, CalendarDays, Wrench, ScanLine, Receipt, ChevronLeft, ChevronRight } from 'lucide-react';
import { motionTokens } from '@/lib/motion-tokens';
import { useMotionAllowed } from '@/components/motion/SiteMotion';

const stages = [
  { title: 'A considered arrival.', label: 'Vehicle intake', icon: CalendarDays, tone: 'blue', position: '65% 48%', text: 'Start with the vehicle, the concern and the condition it arrived in. Keep appointments and intake photos together.', href: '/appointments', action: 'View appointments', detail: 'Appointment / condition record' },
  { title: 'Precision in every repair.', label: 'Workshop operations', icon: Wrench, tone: 'orange', position: '52% 64%', text: 'Move from the handover to the service bay. Follow assigned work, technician progress and replacement parts.', href: '/jobs', action: 'View workshop jobs', detail: 'Technician / job / parts usage' },
  { title: 'Findings with a history.', label: 'Vehicle diagnostics', icon: ScanLine, tone: 'violet', position: '88% 68%', text: 'Connect inspection findings and diagnostic codes to the service record. Give the next repair a better starting point.', href: '/reports', action: 'View repair reports', detail: 'Inspection / trouble codes / history' },
  { title: 'A confident handover.', label: 'Billing & settlement', icon: Receipt, tone: 'emerald', position: '78% 42%', text: 'Bring the work, the parts and the invoice together. Track payment status and return the vehicle with a clear record.', href: '/invoices', action: 'View invoices', detail: 'Invoice / payment / service record' },
];

export function ServiceJourney() {
  const [selected, setSelected] = useState(0);
  const allowed = useMotionAllowed();
  const id = useId();
  const stage = stages[selected];
  const move = (direction: number) => setSelected(current => (current + direction + stages.length) % stages.length);

  return (
    <section className="service-journey" aria-label="Interactive service journey" data-tone={stage.tone}>
      <div className="journey-stage-list" aria-label="Choose a service stage">
        <p className="eyebrow">THE SERVICE, IN MOTION</p>
        <h2>One vehicle.<br />A connected journey.</h2>
        <div>{stages.map((item, index) => <button type="button" key={item.label} className={`journey-stage-button ${selected === index ? 'is-selected' : ''}`} data-tone={item.tone} aria-pressed={selected === index} aria-controls={id} onClick={() => setSelected(index)}><span className="journey-number">0{index + 1}</span><item.icon size={18} /><span>{item.label}</span><ArrowRight size={15} /></button>)}</div>
      </div>
      <div className="journey-scene" id={id}>
        <AnimatePresence initial={false} mode="wait">
          <motion.div key={stage.label} className="journey-scene-content" initial={{ opacity: 1, y: 0 }} animate={allowed ? { opacity: [0, 1], y: [motionTokens.distance.sm, 0] } : { opacity: 1, y: 0 }} exit={{ opacity: 0, y: 0 }} transition={{ duration: allowed ? motionTokens.duration.normal : motionTokens.duration.fast, ease: motionTokens.easing.smooth }}>
            <motion.div className="journey-scene-image" initial={false} animate={{ scale: allowed ? [motionTokens.scale.pop, 1] : 1 }} transition={{ duration: motionTokens.duration.slow, ease: motionTokens.easing.smooth }} aria-hidden="true"><Image src="/branding/autocare-workshop.png" alt="" fill sizes="(max-width: 800px) 100vw, 65vw" style={{ objectPosition: stage.position }} /></motion.div>
            <div className="journey-image-shade" />
            <div className="journey-scene-copy" aria-live="polite"><span className="journey-detail"><stage.icon size={13} />{stage.detail}</span><p className="eyebrow">0{selected + 1} / {stage.label}</p><h3>{stage.title}</h3><p>{stage.text}</p><Link href={stage.href}>{stage.action}<ArrowRight size={15} /></Link></div>
          </motion.div>
        </AnimatePresence>
        <div className="journey-controls"><span>0{selected + 1} <span>/ 04</span></span><div><button type="button" className="icon-button" onClick={() => move(-1)} aria-label="Previous service stage"><ChevronLeft size={18} /></button><button type="button" className="icon-button" onClick={() => move(1)} aria-label="Next service stage"><ChevronRight size={18} /></button></div></div>
      </div>
    </section>
  );
}
