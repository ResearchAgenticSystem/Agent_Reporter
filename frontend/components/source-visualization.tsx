"use client";

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Source } from '@/lib/api';
import { useTheme } from 'next-themes';

interface SourceVisualizationProps {
  sources: Source[];
  activeSourceId?: string;
  onSourceClick?: (sourceId: string) => void;
}

export function SourceVisualization({ 
  sources, 
  activeSourceId,
  onSourceClick 
}: SourceVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  
  // Calculate positions for sources in a circular layout
  const getSourcePositions = () => {
    if (!containerRef.current) return [];
    
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;
    
    return sources.map((source, index) => {
      const angle = (index / sources.length) * Math.PI * 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      return {
        ...source,
        x,
        y,
        size: 10 + source.relevance * 20 // Size based on relevance
      };
    });
  };
  
  // Draw connections between sources
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || sources.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = containerRef.current.clientWidth;
    canvas.height = containerRef.current.clientHeight;
    
    const sourcePositions = getSourcePositions();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections to center
    sourcePositions.forEach(source => {
      const isDark = theme === 'dark';
      const isActive = source.id === activeSourceId;
      
      // Draw line from center to source
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(source.x, source.y);
      ctx.strokeStyle = isActive 
        ? isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'
        : isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.stroke();
    });
    
    // Draw connections between related sources
    for (let i = 0; i < sourcePositions.length; i++) {
      for (let j = i + 1; j < sourcePositions.length; j++) {
        const sourceA = sourcePositions[i];
        const sourceB = sourcePositions[j];
        
        // Only connect some sources (based on some criteria)
        if ((i + j) % 2 === 0) {
          ctx.beginPath();
          ctx.moveTo(sourceA.x, sourceA.y);
          ctx.lineTo(sourceB.x, sourceB.y);
          ctx.strokeStyle = theme === 'dark' 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(0, 0, 0, 0.05)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }, [sources, activeSourceId, theme]);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      
      canvasRef.current.width = containerRef.current.clientWidth;
      canvasRef.current.height = containerRef.current.clientHeight;
      
      // Redraw connections
      const sourcePositions = getSourcePositions();
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sources]);
  
  const sourcePositions = getSourcePositions();
  
  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-64 md:h-80"
    >
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none"
      />
      
      {/* Center node representing the query */}
      <motion.div 
        className="absolute bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-medium"
        style={{ 
          left: '50%', 
          top: '50%', 
          width: 40, 
          height: 40,
          marginLeft: -20,
          marginTop: -20,
          zIndex: 10
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        Query
      </motion.div>
      
      {/* Source nodes */}
      {sourcePositions.map((source) => (
        <motion.div
          key={source.id}
          className={`absolute rounded-full cursor-pointer flex items-center justify-center text-xs font-medium transition-all duration-300 ${
            source.id === activeSourceId 
              ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background' 
              : 'bg-muted text-muted-foreground hover:bg-primary/50'
          }`}
          style={{ 
            left: source.x, 
            top: source.y, 
            width: source.size, 
            height: source.size,
            marginLeft: -source.size/2,
            marginTop: -source.size/2,
            zIndex: source.id === activeSourceId ? 20 : 5
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            width: source.id === activeSourceId ? source.size * 1.2 : source.size,
            height: source.id === activeSourceId ? source.size * 1.2 : source.size,
          }}
          transition={{ delay: 0.2 + parseInt(source.id) * 0.1, type: 'spring' }}
          onClick={() => onSourceClick?.(source.id)}
          whileHover={{ scale: 1.1 }}
        >
          {source.size > 25 && parseInt(source.id)}
        </motion.div>
      ))}
    </div>
  );
}