import React from 'react';

interface BadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export function Badge({ status, size = 'sm' }: BadgeProps) {
  const normalized = (status || '').toLowerCase().trim();
  let tone = 'neutral';
  if (['completed', 'paid', 'good', 'active'].includes(normalized)) tone = 'positive';
  else if (['in_progress', 'confirmed', 'fair', 'assigned', 'draft'].includes(normalized)) tone = 'accent';
  else if (['pending', 'issued', 'worn', 'low'].includes(normalized)) tone = 'warning';
  else if (['cancelled', 'overdue', 'damaged', 'critical', 'danger'].includes(normalized)) tone = 'danger';
  return <span className={`status-badge ${size === 'md' ? 'is-medium' : ''}`} data-tone={tone}>{(status || 'Unknown').replace(/_/g, ' ')}</span>;
}
