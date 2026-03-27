import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background text-foreground overflow-hidden">
      {/* Radial gradient background blob */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(91,79,245,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
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
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="inline-flex h-11 items-center justify-center rounded-md px-8 text-sm font-medium text-white shadow-sm transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]"
            style={{ background: 'var(--gradient-primary)' }}
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-8 text-sm font-medium text-foreground shadow-sm transition-all hover:border-primary/40 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
