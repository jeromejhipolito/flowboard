import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { createElement, type ReactNode } from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Wraps matching substrings in <mark> elements for search highlighting.
 * Case-insensitive. Returns the original text if no match or empty query.
 */
export function highlightMatch(text: string, query: string | null | undefined): ReactNode {
  if (!query || !text) return text;

  const lower = text.toLowerCase();
  const qLower = query.toLowerCase();
  const idx = lower.indexOf(qLower);

  if (idx === -1) return text;

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);

  return createElement(
    'span',
    null,
    before,
    createElement('mark', { className: 'bg-primary/20 rounded' }, match),
    after,
  );
}
