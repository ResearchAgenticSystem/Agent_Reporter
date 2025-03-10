"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Source } from '@/lib/api';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SourceCardProps {
  source: Source;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function SourceCard({ 
  source, 
  isActive = false,
  onClick,
  className
}: SourceCardProps) {
  return (
    <motion.div
      className={cn(
        "p-4 rounded-lg backdrop-blur-sm cursor-pointer transition-all duration-300",
        isActive 
          ? "bg-card/80 border-primary border shadow-md" 
          : "bg-card/50 border-border border hover:bg-card/70",
        className
      )}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-foreground line-clamp-1">{source.title}</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {Math.round(source.relevance * 100)}%
          </span>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {source.snippet}
      </p>
      
      <a 
        href={source.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-xs text-primary flex items-center gap-1 hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        <ExternalLink className="h-3 w-3" />
        View Source
      </a>
    </motion.div>
  );
}