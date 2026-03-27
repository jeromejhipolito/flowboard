'use client';

import { AuthProvider } from '@/hooks/use-auth';
import { DemoAuthProvider } from '@/demo/providers/demo-auth-provider';
import { isDemoMode } from '@/demo';

export function AuthProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  if (isDemoMode) {
    return <DemoAuthProvider>{children}</DemoAuthProvider>;
  }
  return <AuthProvider>{children}</AuthProvider>;
}
