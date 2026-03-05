import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import React from 'react';

interface BubbleGradientProps {
onBubbleClick: () => void;
@@ -16,7 +16,6 @@ const BubbleGradient: React.FC<BubbleGradientProps> = ({
}) => {
const x = useMotionValue(225);
const y = useMotionValue(225);
  const controls = useAnimation();

const parallaxX1 = useTransform(x, [0, 450], [-15, 15]);
const parallaxY1 = useTransform(y, [0, 450], [-15, 15]);
@@ -27,16 +26,6 @@ const BubbleGradient: React.FC<BubbleGradientProps> = ({
const parallaxX3 = useTransform(x, [0, 450], [-20, 20]);
const parallaxY3 = useTransform(y, [0, 450], [20, -20]);

  // Pulse animation based on audio level
  useEffect(() => {
    if (isRecording && audioLevel > 0) {
      controls.start({
        scale: 1.08 + audioLevel * 0.05,
        transition: { duration: 0.1 }
      });
    }
  }, [audioLevel, isRecording, controls]);

const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
const rect = event.currentTarget.getBoundingClientRect();
x.set(event.clientX - rect.left);
@@ -48,17 +37,20 @@ const BubbleGradient: React.FC<BubbleGradientProps> = ({
y.set(225);
};

  const containerVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    recording: { scale: 1.08 },
  };
  // Dynamic blur: increases with audio level (more abstract when listening)
  const dynamicBlur = isRecording 
    ? Math.max(12, 12 + audioLevel * 25) // 12-37px blur based on audio
    : 8;
  
  // Dynamic scale: bubble pulses with audio
  const bubbleScale = isRecording
    ? 1.08 + (audioLevel * 0.2) // Grows with audio
    : 1;

  const blurVariants = {
    initial: { filter: 'blur(8px)' },
    hover: { filter: 'blur(4px)' },
    recording: { filter: 'blur(6px)' },
  };
  // Each layer reacts differently to audio
  const layer1Scale = isRecording ? 1 + (audioLevel * 0.3) : 1;
  const layer2Scale = isRecording ? 1 + (audioLevel * 0.25) : 1;
  const layer3Scale = isRecording ? 1 + (audioLevel * 0.35) : 1;

return (
<div
@@ -76,144 +68,131 @@ const BubbleGradient: React.FC<BubbleGradientProps> = ({
className="relative w-[450px] h-[450px]"
onMouseMove={handleMouseMove}
onMouseLeave={handleMouseLeave}
        variants={containerVariants}
        initial="initial"
        whileHover="hover"
        animate={isRecording ? 'recording' : {
        initial={{ scale: 1 }}
        whileHover={!isRecording ? { scale: 1.05 } : {}}
        animate={isRecording ? {
          scale: bubbleScale,
        } : {
y: ['-2%', '2%', '-2%'],
x: ['1%', '-1%', '1%'],
}}
        transition={{ 
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
          variants={blurVariants}
          transition={{ duration: 0.3 }}
          animate={isRecording ? 'recording' : 'initial'}
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
            animate={{
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
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
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
            animate={{
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
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
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
            animate={{
              scale: isRecording ? [1, 1.15, 1] : [1, 1.1, 1],
            animate={isRecording ? {
              scale: layer3Scale,
            } : {
              scale: [1, 1.1, 1],
}}
            transition={{ 
              duration: isRecording ? 1.5 : 25, 
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
        

        {/* Subtle outer glow during recording - no UI, just atmosphere */}
{isRecording && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Recording timer */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              {/* Microphone icon */}
              <motion.div
                animate={{ 
                  scale: audioLevel > 0.1 ? 1 + audioLevel * 0.3 : 1 
                }}
                transition={{ duration: 0.1 }}
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))' }}
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="22"></line>
                </svg>
              </motion.div>
              
              {/* Timer display */}
              <div className="text-white text-2xl font-light tracking-widest" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                {Math.floor(recordingDuration / 60)}:{String(recordingDuration % 60).padStart(2, '0')}
              </div>
              
              {/* Max duration indicator */}
              <div className="text-white text-xs font-light opacity-60">
                {30 - recordingDuration}s remaining
              </div>
              
              {/* Audio level bars */}
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-white rounded-full"
                    style={{ 
                      height: '20px',
                      opacity: audioLevel * 5 > i ? 0.8 : 0.2,
                    }}
                    animate={{
                      scaleY: audioLevel * 5 > i ? [0.5, 1, 0.5] : 0.5,
                    }}
                    transition={{
                      duration: 0.3,
                      repeat: Infinity,
                      delay: i * 0.05,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </>
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.2, 0.4 + (audioLevel * 0.3), 0.2],
              scale: [1, 1.02, 1],
            }}
            transition={{ 
              duration: 0.6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
)}
</motion.div>
</div>
