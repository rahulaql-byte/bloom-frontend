import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LoadingAnimationProps {
  message?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ 
  message = 'Listening to your feelings...' 
}) => {
  const [phase, setPhase] = useState<'transcribing' | 'analyzing' | 'creating'>('transcribing');

  // Cycle through phases
  useEffect(() => {
    const phases: Array<'transcribing' | 'analyzing' | 'creating'> = [
      'transcribing',
      'analyzing', 
      'creating'
    ];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % phases.length;
      setPhase(phases[currentIndex]);
    }, 3000); // Change phase every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const messages = {
    transcribing: 'Listening to your feelings...',
    analyzing: 'Understanding your emotion...',
    creating: 'Crafting your poem...',
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F5E6D3] flex flex-col items-center justify-center">
      {/* Fractal flower growing animation */}
      <div className="relative w-96 h-96">
        {/* Center core */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <div
            className="w-16 h-16 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(232, 180, 188, 0.8) 0%, rgba(232, 180, 188, 0.3) 70%, transparent 100%)',
              filter: 'blur(8px)',
            }}
          />
        </motion.div>

        {/* Petal layer 1 (inner) */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={`petal-1-${i}`}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0, rotate: i * 72, opacity: 0 }}
            animate={{ 
              scale: [0, 1.2, 1], 
              rotate: i * 72,
              opacity: [0, 0.6, 0.5],
            }}
            transition={{ 
              duration: 2, 
              delay: 0.3 + i * 0.1,
              ease: 'easeOut',
            }}
          >
            <div
              className="w-24 h-32"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(212, 162, 118, 0.6) 0%, transparent 70%)',
                filter: 'blur(10px)',
                transformOrigin: 'center',
              }}
            />
          </motion.div>
        ))}

        {/* Petal layer 2 (middle) */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <motion.div
            key={`petal-2-${i}`}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0, rotate: i * 45, opacity: 0 }}
            animate={{ 
              scale: [0, 1.3, 1.1], 
              rotate: i * 45,
              opacity: [0, 0.4, 0.3],
            }}
            transition={{ 
              duration: 2.5, 
              delay: 0.6 + i * 0.08,
              ease: 'easeOut',
            }}
          >
            <div
              className="w-32 h-40"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(140, 160, 145, 0.5) 0%, transparent 70%)',
                filter: 'blur(12px)',
                transformOrigin: 'center',
              }}
            />
          </motion.div>
        ))}

        {/* Petal layer 3 (outer) */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
          <motion.div
            key={`petal-3-${i}`}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0, rotate: i * 30, opacity: 0 }}
            animate={{ 
              scale: [0, 1.4, 1.2], 
              rotate: i * 30,
              opacity: [0, 0.3, 0.2],
            }}
            transition={{ 
              duration: 3, 
              delay: 1 + i * 0.06,
              ease: 'easeOut',
            }}
          >
            <div
              className="w-40 h-48"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(245, 200, 170, 0.4) 0%, transparent 70%)',
                filter: 'blur(14px)',
                transformOrigin: 'center',
              }}
            />
          </motion.div>
        ))}

        {/* Continuous rotation/pulse effect */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          animate={{ 
            rotate: 360,
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
            scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <div
            className="w-80 h-80 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(180, 190, 210, 0.2) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }}
          />
        </motion.div>
      </div>

      {/* Loading message */}
      <motion.div
        key={phase} // Re-trigger animation on phase change
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
        className="mt-12 text-center"
      >
        <p className="text-xl font-light tracking-wider text-[#5a524c]">
          {messages[phase]}
        </p>
      </motion.div>

      {/* Animated dots */}
      <div className="flex gap-2 mt-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-[#5a524c]"
            animate={{ 
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingAnimation;
