"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function SearchInput() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      await router.push(`/research?topic=${encodeURIComponent(query.trim())}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && e.target !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full max-w-3xl transition-all duration-300 ease-in-out"
    >
      <div
        className={cn(
          "relative flex items-center rounded-full border border-border bg-background transition-all duration-300 p-2"
        )}
      >
        <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Ask any research question... (Press '/' to focus)"
          className="flex-1 h-14 w-full bg-transparent pl-12 pr-20 text-foreground placeholder:text-muted-foreground focus:outline-none truncate"
        />

        {/* Button (Higher Z-Index) */}
        <Button
          type="submit"
          className={cn(
            "absolute right-2 rounded-full transition-all duration-300 z-10 px-4 py-2 bg-primary text-white shadow-md",
            query.trim() ? "opacity-100" : "opacity-0"
          )}
          disabled={!query.trim() || isLoading}
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            "Research"
          )}
        </Button>
      </div>
    </form>
  );
}
