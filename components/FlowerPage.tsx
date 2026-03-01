import React from 'react';
import { motion } from 'framer-motion';

interface FlowerPageProps {
  emotion: 'tenderness' | 'contentment' | 'growth' | 'warmth' | 'tranquility';
  poem: string;
  transcript?: string;
  onClose: () => void;
}

const FlowerPage: React.FC<FlowerPageProps> = ({ emotion, poem, transcript, onClose }) => {
  // Emotion configurations
  const emotionConfig = {
    tenderness: {
      name: 'Tenderness',
      color: { primary: '#E8B4BC', secondary: '#F5C8D2' },
      description: 'Love, care, and gentle feelings',
    },
    contentment: {
      name: 'Contentment',
      color: { primary: '#D4A276', secondary: '#E6BE96' },
      description: 'Satisfaction, peace, and gratitude',
    },
    growth: {
      name: 'Growth',
      color: { primary: '#8CA091', secondary: '#AABEAF' },
      description: 'Hope, transformation, and learning',
    },
    warmth: {
      name: 'Warmth',
      color: { primary: '#F5C8AA', secondary: '#FFDCBE' },
      description: 'Joy, connection, and comfort',
    },
    tranquility: {
      name: 'Tranquility',
      color: { primary: '#B4BED2', secondary: '#C8D2E6' },
      description: 'Stillness, serenity, and quiet',
    },
  };

  const config = emotionConfig[emotion];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-50 bg-[#F5E6D3] overflow-hidden"
    >
      {/* Background gradient based on emotion */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at center, ${config.color.primary} 0%, transparent 70%)`,
        }}
      />

      {/* Decorative flower SVG - will be replaced with actual SVG */}
      <motion.div
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 0.15 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: '600px',
          height: '600px',
          filter: 'blur(40px)',
        }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background: `radial-gradient(circle, ${config.color.primary} 0%, ${config.color.secondary} 50%, transparent 70%)`,
          }}
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        {/* Emotion badge */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-8"
        >
          <div
            className="px-6 py-3 rounded-full text-sm font-light tracking-widest uppercase"
            style={{
              background: `linear-gradient(135deg, ${config.color.primary}20, ${config.color.secondary}20)`,
              color: config.color.primary,
              border: `1px solid ${config.color.primary}40`,
            }}
          >
            {config.name}
          </div>
        </motion.div>

        {/* Poem */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="max-w-2xl text-center mb-12"
        >
          <p
            className="text-2xl md:text-3xl font-light leading-relaxed whitespace-pre-line"
            style={{ color: '#5a524c' }}
          >
            {poem}
          </p>
        </motion.div>

        {/* Optional: Show transcript */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="max-w-xl text-center mb-8 opacity-50"
          >
            <p className="text-sm font-light italic" style={{ color: '#5a524c' }}>
              "{transcript}"
            </p>
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex gap-4 mt-8"
        >
          {/* Save button (future feature) */}
          <button
            className="px-8 py-3 rounded-full font-light tracking-wider transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${config.color.primary}30, ${config.color.secondary}30)`,
              color: config.color.primary,
              border: `1px solid ${config.color.primary}60`,
            }}
            onClick={() => {
              // TODO: Save functionality
              console.log('Save clicked');
            }}
          >
            Save
          </button>

          {/* Return to garden */}
          <button
            className="px-8 py-3 rounded-full font-light tracking-wider transition-all duration-300 hover:bg-[#d9d4cc]/30"
            style={{
              color: '#5a524c',
              border: '1px solid #5a524c40',
            }}
            onClick={onClose}
          >
            Return to Garden
          </button>
        </motion.div>

        {/* Subtle instruction */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="mt-12 text-xs font-light tracking-wider opacity-30"
          style={{ color: '#5a524c' }}
        >
          Your feelings have bloomed into words
        </motion.p>
      </div>

      {/* Close button (top right) */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-20 text-[#5a524c] p-3 rounded-full hover:bg-[#d9d4cc]/30 transition-colors duration-300 opacity-50 hover:opacity-100"
        aria-label="Close"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </motion.div>
  );
};

export default FlowerPage;
