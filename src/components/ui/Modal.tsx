'use client';

import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMotionAllowed } from '@/components/motion/SiteMotion';
import { motionTokens, springs } from '@/lib/motion-tokens';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-xl' }: ModalProps) {
  const allowed = useMotionAllowed(true);
  const dialog = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const focusable = () => Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]') || []).filter(element => element.getClientRects().length > 0);
    document.body.style.overflow = 'hidden';
    (focusable()[0] || dialog.current)?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onCloseRef.current(); }
      if (event.key !== 'Tab') return;
      const elements = focusable();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first) { event.preventDefault(); dialog.current?.focus(); return; }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [isOpen]);

  return (
    <AnimatePresence>{isOpen && <motion.div key="dialog" className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6 overflow-y-auto" initial={{ opacity: 1 }} animate={{ opacity: [0, 1] }} exit={{ opacity: 0 }} transition={{ duration: motionTokens.duration.fast }}>
      <div className="modal-backdrop" onClick={onClose} aria-hidden="true" />
      <motion.div ref={dialog} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} initial={{ opacity: 1, y: 0, scale: 1 }} animate={{ opacity: 1, y: allowed ? [motionTokens.distance.lg, 0] : 0, scale: allowed ? [motionTokens.scale.subtle, 1] : 1 }} exit={{ opacity: 0, scale: allowed ? motionTokens.scale.subtle : 1 }} transition={allowed ? springs.gentle : { duration: motionTokens.duration.fast }} className={`modal-card relative w-full ${maxWidth} z-10 overflow-hidden my-8`}>
        <header className="flex items-center justify-between px-6 py-4"><h2 id={titleId} className="text-lg font-semibold tracking-tight">{title}</h2><button type="button" onClick={onClose} className="icon-button" aria-label={`Close ${title}`}><X size={18} /></button></header>
        <div className="p-6 max-h-[75vh] overflow-y-auto">{children}</div>
      </motion.div>
    </motion.div>}</AnimatePresence>
  );
}
