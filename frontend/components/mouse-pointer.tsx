'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function MousePointer() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringInputOrButton, setIsHoveringInputOrButton] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Add springs with momentum settings
  const springConfig = { 
    damping: 15,      // Lower damping = more momentum
    stiffness: 150,   // Lower stiffness = more floating feeling
    mass: 0.5         // Mass affects the momentum
  };
  
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Hide the system cursor
    document.body.style.cursor = 'none';

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handlePointerChange = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const computedStyle = window.getComputedStyle(target);

      // Check for text fields or buttons
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        computedStyle.cursor === 'text' ||
        computedStyle.cursor === 'pointer' ||
        target.getAttribute('contenteditable') === 'true'
      ) {
        setIsHoveringInputOrButton(true);
      } else {
        setIsHoveringInputOrButton(false);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handlePointerChange);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      // Restore the system cursor
      document.body.style.cursor = 'auto';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handlePointerChange);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cursorX, cursorY, isVisible]);

  return (
    <>
      {/* Custom Cursor */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999]"
        style={{
          x: springX,
          y: springY,
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          opacity: isVisible && !isHoveringInputOrButton ? 1 : 0
        }}
        transition={{
          opacity: { duration: 0.3, ease: "easeInOut" }
        }}
      >
        {/* Trailing dots */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: '8px',
              height: '8px',
              background: 'rgba(100, 149, 237, 0.3)',
              left: 0,
              top: 0,
            }}
            animate={{
              scale: [1, 0.5],
              opacity: [0.4, 0],
            }}
            transition={{
              duration: 0.8,
              delay: i * 0.15,
              repeat: Infinity,
              ease: [0.4, 0, 0.2, 1], // Custom ease for smoother fade
              opacity: {
                duration: 0.8,
                ease: "easeInOut"
              }
            }}
          />
        ))}

        {/* Main blob */}
        <motion.div
          className="absolute rounded-full backdrop-blur-[1px]"
          style={{
            width: '20px',
            height: '20px',
            background:
              'radial-gradient(circle, rgba(100, 149, 237, 0.8) 0%, rgba(70, 130, 180, 0.8) 100%)',
            boxShadow: '0 0 10px rgba(100, 149, 237, 0.3)',
            left: 0,
            top: 0,
            transform: 'none',
          }}
        />
      </motion.div>
    </>
  );
}