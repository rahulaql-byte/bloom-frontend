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

  // Warm color palette
  const flowerColors = [
    '#FF6B3D', // Vibrant orange
    '#FF8F5C', // Soft peach
    '#5DFFEB', // Bright cyan
    '#D4A276', // Warm tan
    '#6BA8A0', // Muted teal
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

    // Create static grain texture once (not every frame!)
    const grainCanvas = document.createElement('canvas');
    grainCanvas.width = canvas.width;
    grainCanvas.height = canvas.height;
    const grainCtx = grainCanvas.getContext('2d');
    
    if (grainCtx) {
      const grainData = grainCtx.createImageData(grainCanvas.width, grainCanvas.height);
      const pixels = grainData.data;
      
      for (let i = 0; i < pixels.length; i += 4) {
        const noise = (Math.random() - 0.5) * 12; // SUBTLE grain (was 25!)
        pixels[i] = noise + 30;     // R - add base brightness
        pixels[i + 1] = noise + 25; // G
        pixels[i + 2] = noise + 20; // B
        pixels[i + 3] = 15;         // Very low opacity
      }
      
      grainCtx.putImageData(grainData, 0, 0);
    }

    let animationFrame: number;

    const render = (time: number) => {
      // Warm gradient background (morning fog feel)
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, 
        canvas.height / 2, 
        0,
        canvas.width / 2, 
        canvas.height / 2, 
        canvas.width * 0.7
      );
      
      gradient.addColorStop(0, '#2a2010'); // Warm dark center
      gradient.addColorStop(0.5, '#1a1510'); // Medium
      gradient.addColorStop(1, '#120e0a'); // Darker edges (not pure black)
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply SUBTLE static grain texture
      if (grainCanvas) {
        ctx.globalAlpha = 0.15; // Very subtle
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

        // Multi-layer soft glow
        const layers = 8;
        for (let layer = 0; layer < layers; layer++) {
          const layerSize = flower.size * (1 + layer * 0.15);
          const layerOpacity = currentOpacity * (1 - layer / layers) * 0.3;

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

        // Add subtle grain particles within flower
        for (let i = 0; i < 50; i++) { // Reduced from 80
          const grainX = x + (Math.random() - 0.5) * flower.size * 2;
          const grainY = y + (Math.random() - 0.5) * flower.size * 2;
          const dist = Math.sqrt(Math.pow(grainX - x, 2) + Math.pow(grainY - y, 2));
          
          if (dist < flower.size) {
            const grainOpacity = (1 - dist / flower.size) * currentOpacity * 0.15; // More subtle
            ctx.fillStyle = `rgba(255, 255, 255, ${grainOpacity})`;
            ctx.fillRect(grainX, grainY, 1.5, 1.5); // Smaller particles
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
      const interval = 150 + Math.random() * 100;
      
      if (now - lastFlowerTime.current > interval) {
        const colorIndex = Math.floor(Math.random() * flowerColors.length);
        
        setHoveredFlowers(prev => [
          ...prev.slice(-20),
          {
            x: e.clientX + (Math.random() - 0.5) * 30,
            y: e.clientY + (Math.random() - 0.5) * 30,
            color: flowerColors[colorIndex],
            size: 80 + Math.random() * 60,
            opacity: 0.6 + Math.random() * 0.3,
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
      background: 'radial-gradient(circle at 50% 50%, #2a2010, #120e0a)',
    }}>
      {/* Canvas with subtle grain */}
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

      {/* Content */}
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
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 1.2,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        {/* Title */}
        <motion.h1
          style={{
            fontSize: 'clamp(3rem, 10vw, 6rem)',
            fontWeight: 300,
            letterSpacing: '0.1em',
            color: '#E8C4A8',
            margin: 0,
            textShadow: '0 0 60px rgba(232, 196, 168, 0.3)',
            WebkitFontSmoothing: 'antialiased',
          }}
          animate={{
            opacity: [1, 0.95, 1, 0.97, 1],
            scale: [1, 1.01, 1, 1.005, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.3, 0.5, 0.8, 1],
          }}
        >
          Bloom
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            fontWeight: 300,
            letterSpacing: '0.2em',
            color: '#D4A276',
            marginTop: '2rem',
            WebkitFontSmoothing: 'antialiased',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 0.6,
            duration: 1.5,
            ease: [0.33, 0.1, 0.33, 1],
          }}
        >
          your feelings, blooming into words
        </motion.p>

        {/* Enter link */}
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
            transition: 'none',
            WebkitFontSmoothing: 'antialiased',
          }}
          whileHover={{
            backgroundColor: '#D4A27620',
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
      </motion.div>
    </div>
  );
};

export default FogReveal;
