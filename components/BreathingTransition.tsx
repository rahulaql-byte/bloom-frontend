import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface BreathingTransitionProps {
  onComplete?: () => void;
  duration?: number; // milliseconds
}

const BreathingTransition: React.FC<BreathingTransitionProps> = ({ 
  onComplete,
  duration = 2500 // 2.5 seconds default
}) => {
  
  useEffect(() => {
    // Auto-complete after duration
    if (onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [onComplete, duration]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(180deg, #b8c8d8 0%, #d8c4c8 40%, #e8d4c8 70%, #e8d0c4 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      {/* Breathing pulse circles */}
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: `radial-gradient(circle, 
              rgba(232, 212, 200, 0.4) 0%, 
              rgba(232, 196, 184, 0.2) 40%, 
              transparent 70%
            )`,
            filter: 'blur(40px)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.8, // Stagger each circle
          }}
        />
      ))}

      {/* Center glow (warmest color) */}
      <motion.div
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232, 208, 196, 0.6) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Optional subtle text */}
      <motion.div
        style={{
          position: 'absolute',
          color: 'rgba(140, 120, 110, 0.4)',
          fontSize: '1rem',
          letterSpacing: '0.3em',
          fontWeight: 300,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{
          duration: 2.5,
          ease: "easeInOut",
        }}
      >
        ...
      </motion.div>
    </div>
  );
};

export default BreathingTransition;
