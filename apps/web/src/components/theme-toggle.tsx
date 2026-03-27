'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const themeConfig = {
  light: { icon: Sun, label: 'Light mode', next: 'dark' as const },
  dark: { icon: Moon, label: 'Dark mode', next: 'system' as const },
  system: { icon: Monitor, label: 'System theme', next: 'light' as const },
} as const;

type ThemeKey = keyof typeof themeConfig;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn('h-9 w-9', className)}
        disabled
      >
        <Monitor className="h-4 w-4" />
      </Button>
    );
  }

  const currentTheme = (theme as ThemeKey) || 'system';
  const config = themeConfig[currentTheme] || themeConfig.system;
  const Icon = config.icon;

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('h-9 w-9 relative group', className)}
      onClick={() => setTheme(config.next)}
      title={config.label}
    >
      <span className="sr-only">{config.label}</span>
      <Icon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
      <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-1 text-xs text-background opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none z-50">
        {config.label}
      </span>
    </Button>
  );
}
