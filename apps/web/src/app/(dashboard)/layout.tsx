import { Sidebar } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/top-bar';
import { LazyCommandPalette } from '@/components/command-palette/lazy-command-palette';
import { ErrorBoundary } from '@/components/error-boundary';
import { DemoBanner } from '@/components/demo/demo-banner';
import { isDemoMode } from '@/demo';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {isDemoMode && <DemoBanner />}
      <div className={`flex h-screen ${isDemoMode ? 'pt-9' : ''}`}>
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-auto p-6">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
        <LazyCommandPalette />
      </div>
    </>
  );
}
