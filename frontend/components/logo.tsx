"use client";

import React from 'react';
import { Brain } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';

export function Logo() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
      <div className="relative">
        <Brain 
          size={32} 
          className="text-primary" 
        />
        <div 
          className="absolute inset-0 blur-sm opacity-50 animate-pulse"
          style={{ 
            background: `radial-gradient(circle, ${isDark ? 'rgba(120, 120, 255, 0.3)' : 'rgba(0, 0, 255, 0.2)'} 0%, transparent 70%)`,
          }}
        />
      </div>
      <span className="font-bold text-xl tracking-tight">Nexus</span>
    </Link>
  );
}