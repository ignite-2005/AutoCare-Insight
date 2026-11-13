import type { CSSProperties } from 'react';

export const motionTokens = {
  duration: { instant: 0.08, fast: 0.18, normal: 0.35, slow: 0.6, story: 0.85 },
  easing: { smooth: [0.22, 1, 0.36, 1] as const },
  distance: { xs: 4, sm: 8, md: 16, lg: 24, xl: 48, parallax: 96 },
  scale: { subtle: 0.98, press: 0.95, pop: 1.04 },
  stagger: 0.06,
};

export const springs = {
  snappy: { type: 'spring' as const, stiffness: 300, damping: 30 },
  gentle: { type: 'spring' as const, stiffness: 120, damping: 22 },
};

export const motionCSS = {
  '--motion-fast': `${motionTokens.duration.fast}s`,
  '--motion-normal': `${motionTokens.duration.normal}s`,
  '--motion-slow': `${motionTokens.duration.slow}s`,
  '--motion-press': String(motionTokens.scale.subtle),
  '--motion-ease': `cubic-bezier(${motionTokens.easing.smooth.join(',')})`,
} as CSSProperties;
