'use client';

import { GITHUB_REPO_URL } from '@/demo';

export function DemoBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex h-9 items-center justify-between bg-primary/10 px-4 text-sm">
      <span className="text-muted-foreground">
        You are viewing a live demo. All data is simulated.
      </span>
      <a
        href={GITHUB_REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-primary hover:underline"
      >
        View Source on GitHub &rarr;
      </a>
    </div>
  );
}
