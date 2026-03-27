import { Metadata } from 'next';
import { FolderKanban } from 'lucide-react';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Radial gradient background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(91,79,245,0.15) 0%, transparent 70%)',
        }}
      />

      <div className="relative mb-8 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
          <FolderKanban className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          <span className="bg-gradient-to-br from-[#5b4ff5] via-[#8b5cf6] to-[#c4b5fd] bg-clip-text text-transparent">
            Flow
          </span>
          Board
        </h1>
      </div>
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
