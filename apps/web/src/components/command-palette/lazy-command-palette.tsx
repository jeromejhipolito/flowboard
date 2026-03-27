'use client';

import dynamic from 'next/dynamic';

const CommandPalette = dynamic(
  () => import('@/components/command-palette/command-palette').then(m => ({ default: m.CommandPalette })),
  { ssr: false }
);

export function LazyCommandPalette() {
  return <CommandPalette />;
}
