import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const FogReveal: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredFlowers, setHoveredFlowers] = useState<Array<{
    x: number;
    y: number;
    color: string;
    size: number;
    opacity: number;
    timestamp: number;
  }>>([]);
  const lastFlowerTime = useRef(0);

  // Warm grainy color palette from reference image
  const flowerColors = [
    '#FF6B3D', // Vibrant orange
    '#FF8F5C', // Soft peach
    '#5DFFEB', // Bright cyan
    '#D4A276', // Warm tan
    '#6BA8A0', // Muted teal
    '#FFB088', // Light peach
    '#4DD8C8', // Soft turquoise
  ];

  // Organic noise for irregular, hand-drawn movement
  const organicNoise = (x: number, y: number, time: number) => {
    return Math.sin(x * 0.01 + time * 0.001) * 
           Math.cos(y * 0.01 + time * 0.0015) * 20;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let animationFrame: number;
    let lastGrainUpdate = 0;
    const grainFPS = 30; // Update grain at 30fps for performance
    const grainInterval = 1000 / grainFPS;

    const render = (time: number) => {
      // Fill with dark warm background
      ctx.fillStyle = '#1a1510';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add heavy grain texture (throttled for performance)
      if (time - lastGrainUpdate > grainInterval) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        
        for (let i = 0; i < pixels.length; i += 4) {
          const noise = (Math.random() - 0.5) * 25; // Heavy grain!
          pixels[i] += noise;     // R
          pixels[i + 1] += noise; // G
          pixels[i + 2] += noise; // B
        }
        
        ctx.putImageData(imageData, 0, 0);
        lastGrainUpdate = time;
      }

      // Draw grainy glowing flowers
      hoveredFlowers.forEach((flower, index) => {
        const age = time - flower.timestamp;
        const maxAge = 5000;
        
        if (age > maxAge) return;

        // Fade out over time
        const fadeProgress = age / maxAge;
        const currentOpacity = flower.opacity * (1 - fadeProgress);

        // Organic irregular movement (hand-drawn wobble)
        const wobbleX = organicNoise(flower.x, flower.y, time + index * 100);
        const wobbleY = organicNoise(flower.y, flower.x, time + index * 150);
        
        const x = flower.x + wobbleX;
        const y = flower.y + wobbleY;

        // Draw multiple layers for grainy glow effect
        const layers = 8;
        for (let layer = 0; layer < layers; layer++) {
          const layerSize = flower.size * (1 + layer * 0.15);
          const layerOpacity = currentOpacity * (1 - layer / layers) * 0.3;

          // Create soft radial gradient
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, layerSize);
          
          const opacity = Math.max(0, layerOpacity);
          const opacityHex = Math.floor(opacity * 255).toString(16).padStart(2, '0');
          const halfOpacityHex = Math.floor(opacity * 0.5 * 255).toString(16).padStart(2, '0');
          
          gradient.addColorStop(0, `${flower.color}${opacityHex}`);
          gradient.addColorStop(0.5, `${flower.color}${halfOpacityHex}`);
          gradient.addColorStop(1, `${flower.color}00`);

          ctx.fillStyle = gradient;
          ctx.fillRect(
            x - layerSize,
            y - layerSize,
            layerSize * 2,
            layerSize * 2
          );
        }

        // Add grain particles within flower area
        for (let i = 0; i < 80; i++) {
          const grainX = x + (Math.random() - 0.5) * flower.size * 2;
          const grainY = y + (Math.random() - 0.5) * flower.size * 2;
          const dist = Math.sqrt(Math.pow(grainX - x, 2) + Math.pow(grainY - y, 2));
          
          if (dist < flower.size) {
            const grainOpacity = (1 - dist / flower.size) * currentOpacity * 0.25;
            ctx.fillStyle = `rgba(255, 255, 255, ${grainOpacity})`;
            ctx.fillRect(grainX, grainY, 2, 2);
          }
        }
      });

      animationFrame = requestAnimationFrame(render);
    };

    animationFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
    };
  }, [hoveredFlowers]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      
      // Irregular timing - not perfectly spaced (hand-drawn feel)
      const interval = 150 + Math.random() * 100; // 150-250ms
      
      if (now - lastFlowerTime.current > interval) {
        const colorIndex = Math.floor(Math.random() * flowerColors.length);
        
        setHoveredFlowers(prev => [
          ...prev.slice(-20), // Keep last 20 flowers
          {
            x: e.clientX + (Math.random() - 0.5) * 30, // Slight random offset
            y: e.clientY + (Math.random() - 0.5) * 30,
            color: flowerColors[colorIndex],
            size: 80 + Math.random() * 60, // Varying sizes (80-140px)
            opacity: 0.6 + Math.random() * 0.3, // Varying opacity
            timestamp: now,
          }
        ]);
        
        lastFlowerTime.current = now;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Clean up old flowers periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setHoveredFlowers(prev => 
        prev.filter(flower => now - flower.timestamp < 5000)
      );
    }, 1000);

    return () => clearInterval(cleanup);
  }, []);

  return (
    <div style={{ 
      position: 'relative', 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden',
      backgroundColor: '#1a1510',
    }}>
      {/* Grainy canvas layer */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />

      {/* Content with jagged animations */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 10,
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ 
          opacity: 1, 
          y: 0,
        }}
        transition={{
          duration: 1.2,
          ease: [0.25, 0.1, 0.25, 1], // Irregular easing (not smooth)
        }}
      >
        {/* Title with hand-drawn irregular breathing */}
        <motion.h1
          style={{
            fontSize: 'clamp(3rem, 10vw, 6rem)',
            fontWeight: 300,
            letterSpacing: '0.1em',
            color: '#E8C4A8',
            margin: 0,
            filter: 'url(#grain)',
            textShadow: '0 0 60px rgba(232, 196, 168, 0.3)',
            WebkitFontSmoothing: 'antialiased',
          }}
          animate={{
            // Irregular breathing (not perfect sine wave)
            opacity: [1, 0.95, 1, 0.97, 1],
            scale: [1, 1.01, 1, 1.005, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear", // No easing = more mechanical/organic
            times: [0, 0.3, 0.5, 0.8, 1], // Irregular keyframes
          }}
        >
          Bloom
        </motion.h1>

        {/* Subtitle with offset irregular timing */}
        <motion.p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            fontWeight: 300,
            letterSpacing: '0.2em',
            color: '#D4A276',
            marginTop: '2rem',
            filter: 'url(#grain)',
            WebkitFontSmoothing: 'antialiased',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 0.6,
            duration: 1.5,
            ease: [0.33, 0.1, 0.33, 1], // Irregular easing
          }}
        >
          your feelings, blooming into words
        </motion.p>

        {/* Enter link with jagged hover (no smooth transition) */}
        <motion.a
          href="/garden"
          style={{
            display: 'inline-block',
            marginTop: '4rem',
            padding: '1rem 3rem',
            border: '1px solid #D4A276',
            borderRadius: '50px',
            color: '#D4A276',
            textDecoration: 'none',
            fontSize: '1rem',
            letterSpacing: '0.15em',
            transition: 'none', // Remove smooth transitions
            filter: 'url(#grain)',
            WebkitFontSmoothing: 'antialiased',
          }}
          whileHover={{
            backgroundColor: '#D4A27620',
            scale: 1.05,
            transition: { 
              duration: 0.1, // Quick, not smooth
              ease: "linear"
            }
          }}
          whileTap={{
            scale: 0.98,
            transition: { duration: 0.05 }
          }}
        >
          enter the garden
        </motion.a>
      </motion.div>

      {/* SVG filter for grain texture on text */}
      <svg style={{ position: 'fixed', width: 0, height: 0 }}>
        <defs>
          <filter id="grain">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.8" 
              numOctaves="4" 
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="discrete" tableValues="0 0 0 0 1 1 1" />
            </feComponentTransfer>
            <feBlend in="SourceGraphic" mode="soft-light" />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default FogReveal;
