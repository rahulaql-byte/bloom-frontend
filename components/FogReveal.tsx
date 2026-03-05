import React, { useRef, useEffect, useState } from 'react';

interface FogRevealProps {
  mousePosition: { x: number; y: number };
}

interface WipePoint {
  x: number;
  y: number;
  timestamp: number;
  radius: number;
}

const FogReveal: React.FC<FogRevealProps> = ({ mousePosition }) => {
  const fogCanvasRef = useRef<HTMLCanvasElement>(null);
  const [wipePoints, setWipePoints] = useState<WipePoint[]>([]);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();

  // Pre-placed flowers that exist underneath fog
  const staticFlowers = [
    { x: 20, y: 30, type: 0, rotation: 45, scale: 0.9 },
    { x: 40, y: 60, type: 1, rotation: 120, scale: 1.1 },
    { x: 70, y: 40, type: 2, rotation: 280, scale: 0.8 },
    { x: 30, y: 80, type: 3, rotation: 15, scale: 1.0 },
    { x: 80, y: 70, type: 4, rotation: 200, scale: 0.95 },
    { x: 50, y: 50, type: 0, rotation: 90, scale: 1.05 },
    { x: 15, y: 50, type: 1, rotation: 310, scale: 0.85 },
    { x: 60, y: 20, type: 2, rotation: 170, scale: 0.9 },
    { x: 85, y: 35, type: 3, rotation: 240, scale: 1.0 },
    { x: 45, y: 75, type: 4, rotation: 60, scale: 0.95 },
  ];

  const flowerColors = [
    { primary: 'rgba(232, 180, 188, 1.0)', secondary: 'rgba(245, 200, 210, 0.95)' },
    { primary: 'rgba(212, 162, 118, 1.0)', secondary: 'rgba(230, 190, 150, 0.95)' },
    { primary: 'rgba(140, 160, 145, 1.0)', secondary: 'rgba(170, 190, 175, 0.95)' },
    { primary: 'rgba(245, 200, 170, 1.0)', secondary: 'rgba(255, 220, 190, 0.95)' },
    { primary: 'rgba(180, 190, 210, 1.0)', secondary: 'rgba(200, 210, 230, 0.95)' },
  ];

  // Track mouse movement for wiping effect
  useEffect(() => {
    const handleMove = () => {
      const distance = Math.sqrt(
        Math.pow(mousePosition.x - lastMousePos.current.x, 2) +
        Math.pow(mousePosition.y - lastMousePos.current.y, 2)
      );

      // Create wipe point every 20px of movement
      if (distance > 20) {
        const newWipe: WipePoint = {
          x: mousePosition.x,
          y: mousePosition.y,
          timestamp: Date.now(),
          radius: 80 + Math.random() * 40, // Varying wipe sizes
        };

        setWipePoints(prev => [...prev, newWipe].slice(-50)); // Keep last 50 wipes
        lastMousePos.current = { ...mousePosition };
      }
    };

    handleMove();
  }, [mousePosition.x, mousePosition.y]);

  // Fade wipes over time (fog returns)
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setWipePoints(prev =>
        prev.filter(wipe => now - wipe.timestamp < 8000) // Wipes fade after 8 seconds
      );
    }, 100);

    return () => clearInterval(cleanup);
  }, []);

  // Render fog canvas with wipe holes
  useEffect(() => {
    const canvas = fogCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear and fill with fog
      ctx.clearRect(0, 0, width, height);

      // Create fog layer with grain texture
      const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.7);
      gradient.addColorStop(0, 'rgba(220, 230, 240, 0.95)'); // Light blue-white fog
      gradient.addColorStop(0.5, 'rgba(230, 235, 245, 0.92)');
      gradient.addColorStop(1, 'rgba(210, 220, 235, 0.98)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Add subtle grain to fog
      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels = imageData.data;

      for (let i = 0; i < pixels.length; i += 4) {
        const noise = (Math.random() - 0.5) * 15;
        pixels[i] += noise;
        pixels[i + 1] += noise;
        pixels[i + 2] += noise;
      }

      ctx.putImageData(imageData, 0, 0);

      // Use destination-out to create holes (wipe away fog)
      ctx.globalCompositeOperation = 'destination-out';

      const now = Date.now();
      wipePoints.forEach(wipe => {
        const age = now - wipe.timestamp;
        const maxAge = 8000;
        const ageProgress = age / maxAge;

        // Wipe starts strong, then fog returns (alpha decreases)
        const alpha = 1 - ageProgress;

        const gradient = ctx.createRadialGradient(wipe.x, wipe.y, 0, wipe.x, wipe.y, wipe.radius);
        gradient.addColorStop(0, `rgba(0, 0, 0, ${alpha})`);
        gradient.addColorStop(0.6, `rgba(0, 0, 0, ${alpha * 0.7})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(
          wipe.x - wipe.radius,
          wipe.y - wipe.radius,
          wipe.radius * 2,
          wipe.radius * 2
        );
      });

      ctx.globalCompositeOperation = 'source-over';

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [wipePoints]);

  // Resize canvas
  useEffect(() => {
    const canvas = fogCanvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Render flower SVG
  const renderFlower = (flower: typeof staticFlowers[0], index: number) => {
    const colors = flowerColors[flower.type];
    const size = 300 * flower.scale;
    const x = (flower.x / 100) * (typeof window !== 'undefined' ? window.innerWidth : 1000);
    const y = (flower.y / 100) * (typeof window !== 'undefined' ? window.innerHeight : 1000);

    const flowerShapes = [
      <svg key={index} viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id={`grad-${index}`}>
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="40%" stopColor={colors.secondary} />
            <stop offset="70%" stopColor={colors.secondary} stopOpacity="0.5" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="40" fill={`url(#grad-${index})`} filter="blur(8px)" />
        <ellipse cx="50" cy="80" rx="8" ry="30" fill={colors.primary} opacity="0.9" filter="blur(3px)" />
      </svg>,

      <svg key={index} viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id={`grad-${index}`}>
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="35%" stopColor={colors.secondary} />
            <stop offset="65%" stopColor={colors.secondary} stopOpacity="0.5" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="40" rx="35" ry="30" fill={`url(#grad-${index})`} filter="blur(8px)" />
        <ellipse cx="50" cy="75" rx="6" ry="25" fill={colors.primary} opacity="0.9" filter="blur(3px)" />
      </svg>,

      <svg key={index} viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id={`grad-${index}`}>
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="35%" stopColor={colors.secondary} />
            <stop offset="65%" stopColor={colors.secondary} stopOpacity="0.5" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="45" rx="42" ry="28" fill={`url(#grad-${index})`} filter="blur(8px)" />
        <ellipse cx="50" cy="78" rx="7" ry="28" fill={colors.primary} opacity="0.9" filter="blur(3px)" />
      </svg>,

      <svg key={index} viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id={`grad-${index}`}>
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="35%" stopColor={colors.secondary} />
            <stop offset="65%" stopColor={colors.secondary} stopOpacity="0.5" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="38" rx="30" ry="35" fill={`url(#grad-${index})`} filter="blur(8px)" />
        <ellipse cx="50" cy="75" rx="6" ry="30" fill={colors.primary} opacity="0.9" filter="blur(3px)" />
      </svg>,

      <svg key={index} viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id={`grad-${index}`}>
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="40%" stopColor={colors.secondary} />
            <stop offset="70%" stopColor={colors.secondary} stopOpacity="0.5" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="42" r="32" fill={`url(#grad-${index})`} filter="blur(8px)" />
        <ellipse cx="50" cy="78" rx="5" ry="28" fill={colors.primary} opacity="0.9" filter="blur(3px)" />
      </svg>,
    ];

    return (
      <div
        key={index}
        className="absolute pointer-events-none"
        style={{
          left: x - size / 2,
          top: y - size / 2,
          width: `${size}px`,
          height: `${size}px`,
          transform: `rotate(${flower.rotation}deg)`,
        }}
      >
        {flowerShapes[flower.type]}
      </div>
    );
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Flowers layer (underneath fog) */}
      <div className="absolute inset-0">
        {staticFlowers.map((flower, index) => renderFlower(flower, index))}
      </div>

      {/* Fog layer (on top, with wipe holes) */}
      <canvas
        ref={fogCanvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ mixBlendMode: 'normal' }}
      />
    </div>
  );
};

export default FogReveal;
