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

  // Warm vibrant color palette
  const flowerColors = [
    '#FF6B3D', // Vibrant orange
    '#FF8F5C', // Soft peach
    '#5DFFEB', // Bright cyan
    '#D4A276', // Warm tan
    '#6BA8A0', // Muted teal
    '#FFB088', // Light peach
    '#4DD8C8', // Turquoise
  ];

  // Organic noise for wobble
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

    // Create hand-drawn style grain texture (irregular, clustered)
    const grainCanvas = document.createElement('canvas');
    grainCanvas.width = canvas.width;
    grainCanvas.height = canvas.height;
    const grainCtx = grainCanvas.getContext('2d');
    
    if (grainCtx) {
      grainCtx.fillStyle = 'transparent';
      grainCtx.fillRect(0, 0, grainCanvas.width, grainCanvas.height);
      
      // Hand-drawn grain: varying sizes, clusters, irregular spacing
      const grainCount = (grainCanvas.width * grainCanvas.height) / 150; // More sparse
      
      for (let i = 0; i < grainCount; i++) {
        const x = Math.random() * grainCanvas.width;
        const y = Math.random() * grainCanvas.height;
        
        // Varying particle sizes (hand-drawn feel)
        const size = Math.random() < 0.7 ? 1 : (Math.random() < 0.9 ? 2 : 3);
        
        // Varying opacity (not uniform)
        const opacity = 0.1 + Math.random() * 0.3;
        
        // Warm tinted grain (not pure white)
        const warmth = Math.random() * 30;
        grainCtx.fillStyle = `rgba(${255 - warmth}, ${245 - warmth}, ${230 - warmth}, ${opacity})`;
        
        // Irregular shapes (not perfect squares)
        if (Math.random() < 0.7) {
          // Small dots
          grainCtx.fillRect(x, y, size, size);
        } else {
          // Elongated marks (hand-drawn strokes)
          grainCtx.fillRect(x, y, size, size + Math.random() * 2);
        }
        
        // Create clusters (organic feel)
        if (Math.random() < 0.3) {
          const clusterSize = 2 + Math.floor(Math.random() * 3);
          for (let j = 0; j < clusterSize; j++) {
            const offsetX = x + (Math.random() - 0.5) * 5;
            const offsetY = y + (Math.random() - 0.5) * 5;
            const clusterOpacity = opacity * 0.6;
            grainCtx.fillStyle = `rgba(255, 245, 230, ${clusterOpacity})`;
            grainCtx.fillRect(offsetX, offsetY, 1, 1);
          }
        }
      }
    }

    let animationFrame: number;

    const render = (time: number) => {
      // BRIGHTER warm gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, 
        canvas.height / 2, 
        0,
        canvas.width / 2, 
        canvas.height / 2, 
        canvas.width * 0.7
      );
      
      // Much lighter, warmer colors!
      gradient.addColorStop(0, '#4a3528');   // Warm brown center (lighter!)
      gradient.addColorStop(0.4, '#352820'); // Medium warm
      gradient.addColorStop(0.7, '#251d18'); // Darker brown
      gradient.addColorStop(1, '#1a1510');   // Darkest edges
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply hand-drawn grain texture
      if (grainCanvas) {
        ctx.globalAlpha = 0.4; // More visible grain
        ctx.drawImage(grainCanvas, 0, 0);
        ctx.globalAlpha = 1.0;
      }

      // Draw grainy glowing flowers
      hoveredFlowers.forEach((flower, index) => {
        const age = time - flower.timestamp;
        const maxAge = 5000;
        
        if (age > maxAge) return;

        const fadeProgress = age / maxAge;
        const currentOpacity = flower.opacity * (1 - fadeProgress);

        // Organic wobble
        const wobbleX = organicNoise(flower.x, flower.y, time + index * 100);
        const wobbleY = organicNoise(flower.y, flower.x, time + index * 150);
        
        const x = flower.x + wobbleX;
        const y = flower.y + wobbleY;

        // Multi-layer soft glow (more intense)
        const layers = 10; // More layers = softer glow
        for (let layer = 0; layer < layers; layer++) {
          const layerSize = flower.size * (1 + layer * 0.18);
          const layerOpacity = currentOpacity * (1 - layer / layers) * 0.4; // More intense

          const gradient = ctx.createRadialGradient(x, y, 0, x, y, layerSize);
          
          const opacity = Math.max(0, layerOpacity);
          const opacityHex = Math.floor(opacity * 255).toString(16).padStart(2, '0');
          const halfOpacityHex = Math.floor(opacity * 0.6 * 255).toString(16).padStart(2, '0');
          
          gradient.addColorStop(0, `${flower.color}${opacityHex}`);
          gradient.addColorStop(0.4, `${flower.color}${halfOpacityHex}`);
          gradient.addColorStop(1, `${flower.color}00`);

          ctx.fillStyle = gradient;
          ctx.fillRect(
            x - layerSize,
            y - layerSize,
            layerSize * 2,
            layerSize * 2
          );
        }

        // Hand-drawn grain particles within flower
        const particleCount = 60;
        for (let i = 0; i < particleCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * flower.size;
          const grainX = x + Math.cos(angle) * distance;
          const grainY = y + Math.sin(angle) * distance;
          
          // Varying particle sizes
          const particleSize = Math.random() < 0.8 ? 1 : 2;
          
          const grainOpacity = (1 - distance / flower.size) * currentOpacity * 0.2;
          ctx.fillStyle = `rgba(255, 255, 255, ${grainOpacity})`;
          ctx.fillRect(grainX, grainY, particleSize, particleSize);
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
      const interval = 150 + Math.random() * 100; // Irregular timing
      
      if (now - lastFlowerTime.current > interval) {
        const colorIndex = Math.floor(Math.random() * flowerColors.length);
        
        setHoveredFlowers(prev => [
          ...prev.slice(-20),
          {
            x: e.clientX + (Math.random() - 0.5) * 30,
            y: e.clientY + (Math.random() - 0.5) * 30,
            color: flowerColors[colorIndex],
            size: 90 + Math.random() * 70, // Larger orbs
            opacity: 0.7 + Math.random() * 0.3, // More visible
            timestamp: now,
          }
        ]);
        
        lastFlowerTime.current = now;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
      background: 'radial-gradient(circle at 50% 50%, #4a3528, #1a1510)',
      cursor: 'crosshair',
    }}>
      {/* Canvas with hand-drawn grain */}
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

      {/* Navigation hint (bottom center) */}
      <motion.a
        href="/garden"
        style={{
          position: 'fixed',
          bottom: '3rem',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '0.8rem 2.5rem',
          border: '1px solid #D4A276',
          borderRadius: '50px',
          color: '#D4A276',
          textDecoration: 'none',
          fontSize: '0.9rem',
          letterSpacing: '0.15em',
          transition: 'none',
          WebkitFontSmoothing: 'antialiased',
          zIndex: 10,
          backgroundColor: 'rgba(26, 21, 16, 0.6)',
          backdropFilter: 'blur(10px)',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 1,
          duration: 1.5,
          ease: [0.33, 0.1, 0.33, 1],
        }}
        whileHover={{
          backgroundColor: 'rgba(212, 162, 118, 0.2)',
          scale: 1.05,
          transition: { duration: 0.1, ease: "linear" }
        }}
        whileTap={{
          scale: 0.98,
          transition: { duration: 0.05 }
        }}
      >
        enter the garden
      </motion.a>
    </div>
  );
};

export default FogReveal;
