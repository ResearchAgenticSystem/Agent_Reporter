"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { typingContainer, typingCharacter } from '@/lib/framer-animations';

interface TypingAnimationProps {
  text: string;
  className?: string;
  speed?: number;
  onComplete?: () => void;
}

export function TypingAnimation({ 
  text, 
  className = "", 
  speed = 30,
  onComplete
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    setDisplayedText("");
    setIsComplete(false);
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(prev => prev + text[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);
    
    return () => clearInterval(interval);
  }, [text, speed, onComplete]);
  
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={typingContainer}
    >
      {displayedText.split('').map((char, index) => (
        <motion.span
          key={`${index}-${char}`}
          variants={typingCharacter}
          className="inline-block"
        >
          {char}
        </motion.span>
      ))}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="inline-block w-2 h-4 bg-primary ml-0.5"
        />
      )}
    </motion.div>
  );
}