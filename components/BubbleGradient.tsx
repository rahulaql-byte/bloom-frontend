import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface BubbleGradientProps {
  onBubbleClick: () => void;
  isRecording: boolean;
  recordingDuration: number;
  audioLevel: number;
}

const BubbleGradient: React.FC<BubbleGradientProps> = ({
  onBubbleClick,
  isRecording,
  recordingDuration,
  audioLevel,
}) => {
  const maxDuration = 30000; // 30 seconds
  const progress = Math.min((recordingDuration / maxDuration) * 100, 100);

  // Smooth audio level for less jittery animation
  const [smoothAudioLevel, setSmoothAudioLevel] = useState(0);

  useEffect(() => {
    // Smooth the audio level with exponential moving average
    setSmoothAudioLevel(prev => prev * 0.7 + audioLevel * 0.3);
  }, [audioLevel]);

  // Voice-reactive values
  const voiceScale = 1 + smoothAudioLevel * 0.15; // Scale ring 0-15% based on voice
  const voiceGlow = 5 + smoothAudioLevel * 20; // Glow intensity
  const ringThickness = 3 + smoothAudioLevel * 4; // Ring gets thicker when speaking (3-7px)
  const ringOpacity = 0.6 + smoothAudioLevel * 0.3; // Ring gets brighter when speaking

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 100,
        cursor: 'pointer',
      }}
      onClick={onBubbleClick}
    >
      {!isRecording ? (
        // Bubble before recording
        <motion.div
          style={{
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 40%, #E8B4BC 0%, #D4A276 40%, #8C9091 100%)',
            filter: 'blur(40px)',
            opacity: 0.8,
          }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.8, 0.9, 0.8],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ) : (
        // Recording state - Voice reactive
        <div
          style={{
            position: 'relative',
            width: '250px',
            height: '250px',
          }}
        >
          {/* Outer glow - pulses with voice */}
          <motion.div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
              filter: `blur(${voiceGlow}px)`,
            }}
            animate={{
              scale: voiceScale,
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              scale: { duration: 0.1 }, // Quick response to voice
              opacity: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
            }}
          />

          {/* Gradient bubble layers - react to audio */}
          <motion.div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '200px',
              height: '200px',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 40%, #E8B4BC 0%, #D4A276 40%, #8C9091 100%)',
              filter: `blur(${12 + smoothAudioLevel * 25}px)`,
            }}
            animate={{
              scale: 1 + smoothAudioLevel * 0.1,
              x: smoothAudioLevel * 5,
            }}
            transition={{
              duration: 0.15,
            }}
          />

          <motion.div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '180px',
              height: '180px',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 60% 50%, #D4A276 0%, #A8B4BC 60%)',
              filter: `blur(${15 + smoothAudioLevel * 20}px)`,
            }}
            animate={{
              scale: 1 + smoothAudioLevel * 0.08,
              x: -smoothAudioLevel * 5,
            }}
            transition={{
              duration: 0.15,
            }}
          />

          <motion.div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '160px',
              height: '160px',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 40% 60%, #8C9091 0%, #E8B4BC 50%)',
              filter: `blur(${20 + smoothAudioLevel * 15}px)`,
            }}
            animate={{
              scale: 1 + smoothAudioLevel * 0.12,
              y: smoothAudioLevel * 3,
            }}
            transition={{
              duration: 0.15,
            }}
          />

          {/* Voice-reactive progress ring - THE KEY FEATURE! */}
          <svg
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-90deg)',
              width: '260px',
              height: '260px',
            }}
          >
            <defs>
              {/* Glow filter for progress ring */}
              <filter id="progressGlow">
                <feGaussianBlur stdDeviation={voiceGlow * 0.5} result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background ring */}
            <circle
              cx="130"
              cy="130"
              r="120"
              fill="none"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="2"
            />

            {/* Animated progress ring - reacts to voice! */}
            <motion.circle
              cx="130"
              cy="130"
              r="120"
              fill="none"
              stroke="rgba(255, 255, 255, 1)"
              strokeWidth={ringThickness}
              strokeDasharray={`${2 * Math.PI * 120}`}
              strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
              strokeLinecap="round"
              filter="url(#progressGlow)"
              opacity={ringOpacity}
              animate={{
                scale: voiceScale,
                strokeWidth: ringThickness,
              }}
              transition={{
                scale: { duration: 0.1 },
                strokeWidth: { duration: 0.1 },
              }}
              style={{
                transformOrigin: 'center',
              }}
            />
          </svg>

          {/* Center pulse dot - reacts to voice */}
          <motion.div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '12px',
              height: '12px',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.9)',
              boxShadow: `0 0 ${10 + smoothAudioLevel * 20}px rgba(255, 255, 255, 0.8)`,
            }}
            animate={{
              scale: [1, 1 + smoothAudioLevel * 0.5, 1],
            }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Time remaining indicator */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              marginTop: '90px',
              color: 'rgba(212, 162, 118, 0.8)',
              fontSize: '0.75rem',
              fontWeight: 300,
              letterSpacing: '0.1em',
              pointerEvents: 'none',
            }}
          >
            {Math.ceil((maxDuration - recordingDuration) / 1000)}s
          </div>
        </div>
      )}
    </div>
  );
};

export default BubbleGradient;
