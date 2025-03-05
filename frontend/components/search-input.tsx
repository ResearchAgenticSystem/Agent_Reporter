"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function SearchInput() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/research?q=${encodeURIComponent(query.trim())}`);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && e.target !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <form 
      onSubmit={handleSubmit}
      className={cn(
        "relative w-full max-w-3xl transition-all duration-300 ease-in-out",
        isFocused ? "scale-105" : "scale-100"
      )}
    >
      <div 
        className={cn(
          "relative flex items-center rounded-full border border-border bg-background/50 backdrop-blur-md transition-all duration-300",
          isFocused ? "shadow-[0_0_20px_rgba(120,120,255,0.3)] border-primary/50" : ""
        )}
      >
        <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Ask any research question... (Press '/' to focus)"
          className="flex-1 h-14 w-full bg-transparent pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <Button 
          type="submit" 
          className={cn(
            "absolute right-2 rounded-full transition-all duration-300",
            query.trim() ? "opacity-100" : "opacity-0"
          )}
          disabled={!query.trim()}
        >
          Research
        </Button>
      </div>
      <div 
        className={cn(
          "absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 blur-md transition-opacity duration-300",
          isFocused ? "opacity-20" : "opacity-0"
        )}
        style={{ zIndex: -1 }}
      />
    </form>
  );
}