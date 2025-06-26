'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { Box, Text } from '@radix-ui/themes';

export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';

  return (
    <SidebarMenuButton
      className="cursor-pointer flex items-center gap-2"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Alternar tema"
    >
      <Box className="relative w-4 h-4">
        <Sun
          className={`
            absolute top-0 left-0 w-4 h-4
            transition duration-800 ease-in-out
            ${isDark ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}
          `}
          strokeWidth={2}
        />
        <Moon
          className={`
            absolute top-0 left-0 w-4 h-4
            transition duration-800 ease-in-out
            ${isDark ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'}
          `}
          strokeWidth={2}
        />
      </Box>

      <Text>Tema</Text>
    </SidebarMenuButton>
  );
}
