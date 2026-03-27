import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/providers/theme-provider';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProviderWrapper } from '@/providers/auth-provider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'FlowBoard — Real-Time Collaborative Task Management',
  description:
    'Full-stack SaaS platform built with Next.js 15, NestJS, WebSockets, PostgreSQL, and Redis. Features drag-and-drop Kanban boards, real-time sync, RBAC, analytics, and AI-powered task parsing.',
  openGraph: {
    title: 'FlowBoard — Real-Time Collaborative Task Management',
    description:
      'Full-stack SaaS platform built with Next.js 15, NestJS, WebSockets, PostgreSQL, and Redis. Features drag-and-drop Kanban boards, real-time sync, RBAC, analytics, and AI-powered task parsing.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlowBoard',
    description: 'Real-time collaborative task management with AI',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProviderWrapper>
              {children}
            </AuthProviderWrapper>
            <Toaster richColors position="bottom-right" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
