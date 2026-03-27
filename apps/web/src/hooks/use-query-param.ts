'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Simple replacement for nuqs useQueryState.
 * Reads/writes a single URL search param.
 */
export function useQueryParam(
  key: string,
  options?: { defaultValue?: string },
): [string | null, (value: string | null) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const value = searchParams.get(key) ?? options?.defaultValue ?? null;

  const setValue = useCallback(
    (newValue: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newValue === null || newValue === '') {
        params.delete(key);
      } else {
        params.set(key, newValue);
      }
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
    },
    [key, searchParams, router, pathname],
  );

  return [value, setValue];
}
