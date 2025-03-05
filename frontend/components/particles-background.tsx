"use client";
import { motion } from 'framer-motion';

const generateParticles = (count = 30) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 6 + 3, // 3px to 9px
    delay: Math.random() * 5, // random stagger for each particle
  }));
};

const particles = generateParticles(50);

export const ParticlesBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            opacity: 0,
            scale: 0.5,
            x: `${particle.x}vw`,
            y: `${particle.y}vh`,
          }}
          animate={{
            opacity: [0, 1, 0], // fade in and out
            scale: [0.5, 1.5, 0.5], // grow and shrink
            x: `${Math.random() * 100}vw`,
            y: `${Math.random() * 100}vh`,
          }}
          transition={{
            duration: 10 + Math.random() * 5,
            repeat: Infinity,
            delay: particle.delay,
          }}
          className="absolute bg-blue-500 rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
          }}
        />
      ))}
    </div>
  );
};
