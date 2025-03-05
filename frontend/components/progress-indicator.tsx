"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ResearchProgress } from '@/lib/api';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  progress: ResearchProgress;
  className?: string;
}

export function ProgressIndicator({ progress, className }: ProgressIndicatorProps) {
  const stages = [
    { key: 'initializing', label: 'Initializing' },
    { key: 'searching', label: 'Searching' },
    { key: 'analyzing', label: 'Analyzing' },
    { key: 'synthesizing', label: 'Synthesizing' },
    { key: 'complete', label: 'Complete' }
  ];
  
  const currentStageIndex = stages.findIndex(stage => stage.key === progress.stage);
  
  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2 flex justify-between items-center">
        <h3 className="text-sm font-medium">Research Progress</h3>
        <span className="text-sm text-muted-foreground">{progress.progress}%</span>
      </div>
      
      <Progress value={progress.progress} className="h-2 mb-4" />
      
      <div className="relative flex justify-between mb-2">
        {stages.map((stage, index) => {
          const isActive = index <= currentStageIndex;
          const isCurrent = index === currentStageIndex;
          
          return (
            <div key={stage.key} className="flex flex-col items-center relative">
              <div className={cn(
                "w-3 h-3 rounded-full mb-1 transition-colors duration-300",
                isActive ? "bg-primary" : "bg-muted",
                isCurrent && "ring-2 ring-primary ring-offset-2 ring-offset-background"
              )}>
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary/50"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>
              <span className={cn(
                "text-xs whitespace-nowrap transition-colors duration-300",
                isActive ? "text-primary font-medium" : "text-muted-foreground"
              )}>
                {stage.label}
              </span>
            </div>
          );
        })}
        
        {/* Connecting lines */}
        <div className="absolute top-1.5 left-0 right-0 h-px bg-muted -z-10" />
        <motion.div 
          className="absolute top-1.5 left-0 h-px bg-primary -z-10" 
          initial={{ width: "0%" }}
          animate={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      {progress.currentAction && (
        <motion.p 
          className="text-sm text-muted-foreground mt-4 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          key={progress.currentAction}
        >
          {progress.currentAction}
        </motion.p>
      )}
    </div>
  );
}