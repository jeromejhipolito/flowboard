import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background text-foreground overflow-hidden">
      {/* Radial gradient background blob */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(91,79,245,0.18) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        {/* Status chip */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          Real-time collaboration &mdash; built for teams
        </div>

        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          <span className="bg-gradient-to-br from-[#5b4ff5] via-[#8b5cf6] to-[#c4b5fd] bg-clip-text text-transparent">
            Flow
          </span>
          Board
        </h1>
        <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
          Real-Time Collaborative Task Management
        </p>

        {/* Feature chips */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs">Real-Time Sync</span>
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs">Sprint Planning</span>
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs">AI Task Parsing</span>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="inline-flex h-12 items-center justify-center rounded-md px-10 text-base font-medium text-white shadow-sm transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]"
            style={{ background: 'var(--gradient-primary)' }}
          >
            Get Started
          </Link>
          <Link
            href="/workspaces"
            className="inline-flex h-11 items-center justify-center rounded-md border border-primary/50 bg-background px-8 text-sm font-medium text-primary shadow-sm transition-all hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]"
          >
            Try Demo
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-8 text-sm font-medium text-foreground shadow-sm transition-all hover:border-primary/40 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]"
          >
            Sign In
          </Link>
        </div>

        {/* Product screenshot placeholder */}
        <div className="mt-16 w-full max-w-4xl mx-auto">
          <div className="rounded-xl border border-border bg-card/50 shadow-2xl overflow-hidden">
            <div className="flex h-64 items-center justify-center bg-gradient-to-br from-muted/50 to-muted">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-muted-foreground">Board Preview</p>
                <p className="mt-1 text-xs text-muted-foreground/60">Screenshot coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
