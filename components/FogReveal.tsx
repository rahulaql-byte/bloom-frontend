import React, { useState, useEffect, useRef } from 'react';

interface FogRevealProps {
  mousePosition: { x: number; y: number };
}

interface Flower {
  x: number;
  y: number;
  opacity: number;
  id: number;
  rotation: number;
  type: number; // 0-4 for 5 flower types
  scale: number;
}

const FogReveal: React.FC<FogRevealProps> = ({ mousePosition }) => {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const mouseStillTimeRef = useRef(0);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();

  // 5 emotion-based flower colors (matching garden bubble palette)
  const flowerColors = [
    // Tenderness (pink from bubble) - MORE VIBRANT
    { primary: 'rgba(232, 180, 188, 0.95)', secondary: 'rgba(245, 200, 210, 0.85)' },
    // Contentment (brown/tan from bubble) - MORE VIBRANT
    { primary: 'rgba(212, 162, 118, 0.95)', secondary: 'rgba(230, 190, 150, 0.85)' },
    // Growth (green from bubble) - MORE VIBRANT
    { primary: 'rgba(140, 160, 145, 0.95)', secondary: 'rgba(170, 190, 175, 0.85)' },
    // Warmth (peachy orange) - MORE VIBRANT
    { primary: 'rgba(245, 200, 170, 0.95)', secondary: 'rgba(255, 220, 190, 0.85)' },
    // Tranquility (soft blue-grey) - MORE VIBRANT
    { primary: 'rgba(180, 190, 210, 0.95)', secondary: 'rgba(200, 210, 230, 0.85)' },
  ];

  useEffect(() => {
    let lastUpdateTime = Date.now();
    let lastFlowerPosition = { x: -1000, y: -1000 }; // Track last flower location

    const checkMouseStill = () => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastUpdateTime;
      lastUpdateTime = currentTime;

      // Check if mouse moved
      const distance = Math.sqrt(
        Math.pow(mousePosition.x - lastMousePosRef.current.x, 2) + 
        Math.pow(mousePosition.y - lastMousePosRef.current.y, 2)
      );

      // Check distance from last flower position
      const distanceFromLastFlower = Math.sqrt(
        Math.pow(mousePosition.x - lastFlowerPosition.x, 2) + 
        Math.pow(mousePosition.y - lastFlowerPosition.y, 2)
      );

      if (distance < 5) {
        // Mouse is still
        mouseStillTimeRef.current += deltaTime;
      } else {
        // Mouse is moving - increment a different counter
        mouseStillTimeRef.current += deltaTime * 0.5; // Slower accumulation while moving
        lastMousePosRef.current = { ...mousePosition };
      }

      // Create flower when: (1) enough time passed AND (2) far enough from last flower
      if (mouseStillTimeRef.current > 400 && distanceFromLastFlower > 150) {
        console.log('🌸 Creating flower at:', mousePosition);
        const newFlower: Flower = {
          x: mousePosition.x,
          y: mousePosition.y,
          opacity: 0,
          id: Date.now(),
          rotation: Math.random() * 360,
          type: Math.floor(Math.random() * 5),
          scale: 0.8 + Math.random() * 0.4,
        };
        setFlowers(prev => {
          const updated = [...prev, newFlower].slice(-5);
          console.log('🌸 Total flowers:', updated.length);
          return updated;
        });
        lastFlowerPosition = { ...mousePosition }; // Update last flower position
        mouseStillTimeRef.current = 0;
      }

      animationFrameRef.current = requestAnimationFrame(checkMouseStill);
    };

    animationFrameRef.current = requestAnimationFrame(checkMouseStill);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mousePosition.x, mousePosition.y]);

  // Separate effect for fading flowers
  useEffect(() => {
    const interval = setInterval(() => {
      setFlowers(prev =>
        prev
          .map(f => ({
            ...f,
            // Slightly more visible: 0 → 0.7 (70% opacity!)
            opacity: f.opacity < 0.7 ? f.opacity + 0.025 : f.opacity - 0.006,
          }))
          .filter(f => f.opacity > 0)
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Render flower based on type
  const renderFlower = (flower: Flower) => {
    const colors = flowerColors[flower.type];
    const size = 300 * flower.scale; // Bigger! Was 200

    // Different flower shapes for each emotion
    const flowerShapes = [
      // Type 0: Round bloom (like image 2) - WITH FEATHER
      <svg key={flower.id} viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id={`grad-${flower.id}`}>
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="40%" stopColor={colors.secondary} />
            <stop offset="70%" stopColor={colors.secondary} stopOpacity="0.5" />
            <stop offset="85%" stopColor={colors.secondary} stopOpacity="0.2" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="40" fill={`url(#grad-${flower.id})`} filter="blur(8px)" />
        <ellipse cx="50" cy="80" rx="8" ry="30" fill={colors.primary} opacity="0.9" filter="blur(3px)" />
      </svg>,

      // Type 1: Tulip-like - WITH FEATHER
      <svg key={flower.id} viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id={`grad-${flower.id}`}>
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="35%" stopColor={colors.secondary} />
            <stop offset="65%" stopColor={colors.secondary} stopOpacity="0.5" />
            <stop offset="85%" stopColor={colors.secondary} stopOpacity="0.2" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="40" rx="35" ry="30" fill={`url(#grad-${flower.id})`} filter="blur(8px)" />
        <ellipse cx="50" cy="75" rx="6" ry="25" fill={colors.primary} opacity="0.9" filter="blur(3px)" />
      </svg>,

      // Type 2: Wide bloom - WITH FEATHER
      <svg key={flower.id} viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id={`grad-${flower.id}`}>
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="35%" stopColor={colors.secondary} />
            <stop offset="65%" stopColor={colors.secondary} stopOpacity="0.5" />
            <stop offset="85%" stopColor={colors.secondary} stopOpacity="0.2" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="45" rx="42" ry="28" fill={`url(#grad-${flower.id})`} filter="blur(8px)" />
        <ellipse cx="50" cy="78" rx="7" ry="28" fill={colors.primary} opacity="0.9" filter="blur(3px)" />
      </svg>,

      // Type 3: Tall bloom - WITH FEATHER
      <svg key={flower.id} viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id={`grad-${flower.id}`}>
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="35%" stopColor={colors.secondary} />
            <stop offset="65%" stopColor={colors.secondary} stopOpacity="0.5" />
            <stop offset="85%" stopColor={colors.secondary} stopOpacity="0.2" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="38" rx="30" ry="35" fill={`url(#grad-${flower.id})`} filter="blur(8px)" />
        <ellipse cx="50" cy="75" rx="6" ry="30" fill={colors.primary} opacity="0.9" filter="blur(3px)" />
      </svg>,

      // Type 4: Small delicate - WITH FEATHER
      <svg key={flower.id} viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id={`grad-${flower.id}`}>
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="40%" stopColor={colors.secondary} />
            <stop offset="70%" stopColor={colors.secondary} stopOpacity="0.5" />
            <stop offset="85%" stopColor={colors.secondary} stopOpacity="0.2" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="42" r="32" fill={`url(#grad-${flower.id})`} filter="blur(8px)" />
        <ellipse cx="50" cy="78" rx="5" ry="28" fill={colors.primary} opacity="0.9" filter="blur(3px)" />
      </svg>,
    ];

    return (
      <div
        key={flower.id}
        className="absolute"
        style={{
          left: flower.x - size / 2,
          top: flower.y - size / 2,
          width: `${size}px`,
          height: `${size}px`,
          opacity: flower.opacity,
          transform: `rotate(${flower.rotation}deg)`,
          transition: 'opacity 1s ease-in-out',
          pointerEvents: 'none',
        }}
      >
        {flowerShapes[flower.type]}
      </div>
    );
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Debug indicator */}
      <div className="absolute top-2 left-2 text-xs text-red-500 bg-white px-2 py-1 rounded z-50 pointer-events-auto">
        FogReveal Active: {flowers.length} flowers
      </div>
      
      {flowers.map(flower => renderFlower(flower))}
    </div>
  );
};

export default FogReveal;
