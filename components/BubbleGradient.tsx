import { motion, useMotionValue, useTransform } from 'framer-motion';
import React from 'react';

interface BubbleGradientProps {
  onBubbleClick: () => void;
  isRecording: boolean;
  recordingDuration?: number;
  audioLevel?: number;
}

const BubbleGradient: React.FC<BubbleGradientProps> = ({ 
  onBubbleClick, 
  isRecording,
  recordingDuration = 0,
  audioLevel = 0,
}) => {
  const x = useMotionValue(225);
  const y = useMotionValue(225);

  const parallaxX1 = useTransform(x, [0, 450], [-15, 15]);
  const parallaxY1 = useTransform(y, [0, 450], [-15, 15]);

  const parallaxX2 = useTransform(x, [0, 450], [25, -25]);
  const parallaxY2 = useTransform(y, [0, 450], [25, -25]);

  const parallaxX3 = useTransform(x, [0, 450], [-20, 20]);
  const parallaxY3 = useTransform(y, [0, 450], [20, -20]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    x.set(225);
    y.set(225);
  };

  // Dynamic blur: increases with audio level (more abstract when listening)
  const dynamicBlur = isRecording 
    ? Math.max(12, 12 + audioLevel * 25) // 12-37px blur based on audio
    : 8;
  
  // Dynamic scale: bubble pulses with audio
  const bubbleScale = isRecording
    ? 1.08 + (audioLevel * 0.2) // Grows with audio
    : 1;

  // Each layer reacts differently to audio
  const layer1Scale = isRecording ? 1 + (audioLevel * 0.3) : 1;
  const layer2Scale = isRecording ? 1 + (audioLevel * 0.25) : 1;
  const layer3Scale = isRecording ? 1 + (audioLevel * 0.35) : 1;

  // Progress: 0 to 1 over 30 seconds
  const progress = Math.min(recordingDuration / 30, 1);

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        cursor: 'pointer',
      }}
      onClick={onBubbleClick}
    >
      <motion.div
        className="relative w-[450px] h-[450px]"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ scale: 1 }}
        whileHover={!isRecording ? { scale: 1.05 } : {}}
        animate={isRecording ? {
          scale: bubbleScale,
        } : {
          y: ['-2%', '2%', '-2%'],
          x: ['1%', '-1%', '1%'],
        }}
        transition={isRecording ? { 
          duration: 0.1 
        } : { 
          type: 'spring', 
          stiffness: 400, 
          damping: 20,
          y: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
          x: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        {/* The gradient layers WITH dynamic blur */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            filter: `blur(${dynamicBlur}px)`,
          }}
          transition={{ duration: 0.1 }}
        >
          {/* Layer 1: Pink - Reacts to audio */}
          <motion.div
            className="absolute w-full h-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #E8B4BC, transparent 40%)',
              x: parallaxX1,
              y: parallaxY1,
            }}
            animate={isRecording ? {
              scale: layer1Scale,
              transform: [
                'translateX(0%) translateY(0%)', 
                `translateX(${audioLevel * 30}%) translateY(${audioLevel * 20}%)`, 
                'translateX(0%) translateY(0%)'
              ],
            } : {
              transform: ['translateX(0%) translateY(0%)', 'translateX(20%) translateY(10%)', 'translateX(0%) translateY(0%)'],
            }}
            transition={isRecording ? {
              scale: { duration: 0.15 },
              transform: { duration: 0.8, ease: 'easeInOut' }
            } : {
              duration: 15, 
              repeat: Infinity, 
              ease: 'easeInOut'
            }}
          />

          {/* Layer 2: Brown - Reacts to audio */}
          <motion.div
            className="absolute w-full h-full"
            style={{
              background: 'radial-gradient(circle at 70% 70%, #D4A276, transparent 40%)',
              x: parallaxX2,
              y: parallaxY2,
            }}
            animate={isRecording ? {
              scale: layer2Scale,
              transform: [
                'translateX(0%) translateY(0%)', 
                `translateX(${-audioLevel * 25}%) translateY(${-audioLevel * 18}%)`, 
                'translateX(0%) translateY(0%)'
              ],
            } : {
              transform: ['translateX(0%) translateY(0%)', 'translateX(-20%) translateY(-15%)', 'translateX(0%) translateY(0%)'],
            }}
            transition={isRecording ? {
              scale: { duration: 0.15 },
              transform: { duration: 1, ease: 'easeInOut' }
            } : {
              duration: 18, 
              repeat: Infinity, 
              ease: 'easeInOut', 
              delay: 2
            }}
          />

          {/* Layer 3: Green - Reacts to audio (most reactive) */}
          <motion.div
            className="absolute w-full h-full"
            style={{
              background: 'radial-gradient(circle at 50% 50%, #4A5C50, transparent 35%)',
              x: parallaxX3,
              y: parallaxY3,
            }}
            animate={isRecording ? {
              scale: layer3Scale,
            } : {
              scale: [1, 1.1, 1],
            }}
            transition={isRecording ? {
              duration: 0.12,
            } : { 
              duration: 25, 
              repeat: Infinity, 
              ease: 'easeInOut', 
              delay: 1 
            }}
          />
        </motion.div>

        {/* LISTENING MODE ANIMATION */}
        {isRecording && (
          <>
            {/* Breathing outer glow - shows "I'm listening" */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
              }}
              animate={{ 
                opacity: [0.3, 0.6 + (audioLevel * 0.4), 0.3],
                scale: [0.98, 1.02, 0.98],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Subtle progress ring - fills over 30 seconds */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(
                  rgba(255, 255, 255, 0.3) ${progress * 360}deg,
                  transparent ${progress * 360}deg
                )`,
                WebkitMask: 'radial-gradient(circle, transparent 48%, black 48%, black 52%, transparent 52%)',
                mask: 'radial-gradient(circle, transparent 48%, black 48%, black 52%, transparent 52%)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
            />

            {/* Rhythmic pulse - indicates active listening state */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                filter: 'blur(2px)',
              }}
            />
          </>
        )}
      </motion.div>
    </div>
  );
};

export default BubbleGradient;
