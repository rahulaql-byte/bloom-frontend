import React from 'react';
import { motion } from 'framer-motion';

interface FlowerPageProps {
  emotion: 'tenderness' | 'contentment' | 'growth' | 'warmth' | 'tranquility';
  poem: string;
  transcript?: string;
  flowerImage?: string;  // AI-generated flower image (base64 data URL)
  onSave?: () => void;
  onReturn: () => void;
}

const FlowerPage: React.FC<FlowerPageProps> = ({
  emotion,
  poem,
  transcript,
  flowerImage,
  onSave,
  onReturn,
}) => {
  const emotionConfig = {
    tenderness: {
      color: '#E8B4BC',
      label: 'TENDERNESS',
      description: 'gentle · loving · soft',
    },
    contentment: {
      color: '#D4A276',
      label: 'CONTENTMENT',
      description: 'peaceful · satisfied · calm',
    },
    growth: {
      color: '#4A5C50',
      label: 'GROWTH',
      description: 'evolving · learning · expanding',
    },
    warmth: {
      color: '#E8C4A8',
      label: 'WARMTH',
      description: 'joyful · connected · radiant',
    },
    tranquility: {
      color: '#A8B8C8',
      label: 'TRANQUILITY',
      description: 'serene · still · meditative',
    },
  };

  const config = emotionConfig[emotion];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: `radial-gradient(circle at 50% 50%, ${config.color}20, ${config.color}05)`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* AI-Generated Flower Background */}
      {flowerImage && (
        <motion.div
          className="absolute inset-0 flex items-end justify-center overflow-hidden"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          <motion.img
            src={flowerImage}
            alt={`${emotion} flower`}
            className="h-[85vh] w-auto object-contain"
            style={{
              filter: 'blur(8px) opacity(0.4)',
              transform: 'translateY(5%)',
            }}
            animate={{
              filter: ['blur(8px) opacity(0.4)', 'blur(6px) opacity(0.5)', 'blur(8px) opacity(0.4)'],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      )}

      {/* Content Container */}
      <motion.div
        className="relative z-10 max-w-2xl mx-auto px-8 text-center"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        {/* Emotion Badge */}
        <motion.div
          className="inline-block px-8 py-3 rounded-full border mb-8"
          style={{
            borderColor: config.color,
            color: config.color,
            backgroundColor: `${config.color}15`,
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="text-sm font-light tracking-[0.3em] uppercase">
            {config.label}
          </div>
        </motion.div>

        {/* Poem */}
        <motion.div
          className="text-3xl md:text-4xl font-serif leading-relaxed mb-8"
          style={{ color: config.color }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          {poem.split('\n').map((line, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.15, duration: 0.5 }}
            >
              {line}
            </motion.div>
          ))}
        </motion.div>

        {/* Transcript (if available) */}
        {transcript && (
          <motion.div
            className="text-sm font-light italic mb-12 opacity-60"
            style={{ color: config.color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            "{transcript}"
          </motion.div>
        )}

        {/* Buttons */}
        <motion.div
          className="flex gap-4 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7, duration: 0.5 }}
        >
          {onSave && (
            <button
              onClick={onSave}
              className="px-8 py-3 rounded-full border transition-all"
              style={{
                borderColor: config.color,
                color: config.color,
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${config.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Save
            </button>
          )}
          <button
            onClick={onReturn}
            className="px-8 py-3 rounded-full border transition-all"
            style={{
              borderColor: config.color,
              color: config.color,
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${config.color}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Return to Garden
          </button>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          className="text-xs font-light tracking-widest mt-12 opacity-40"
          style={{ color: config.color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          Your feelings have bloomed into words
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default FlowerPage;
