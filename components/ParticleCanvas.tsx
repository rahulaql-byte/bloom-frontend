
import React, { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  baseOpacity: number;
  parallax: number;
  type: 'dot' | 'petal';
  rotation?: number;
  rotationSpeed?: number;
  color?: string;
}

interface ParticleCanvasProps {
  mousePosition: { x: number; y: number };
  isHoveringEntry: boolean;
  entryRef: React.RefObject<HTMLParagraphElement>;
  isTransitioning: boolean;
}

const ParticleCanvas: React.FC<ParticleCanvasProps> = ({ mousePosition, isHoveringEntry, entryRef, isTransitioning }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const isHoveringRef = useRef(false);
  const entryPositionRef = useRef({ x: 0, y: 0 });
  const isTransitioningRef = useRef(false);
  const transitionStartTimeRef = useRef(0);

  useEffect(() => {
    mouseRef.current = mousePosition;
    isHoveringRef.current = isHoveringEntry;
    
    // Track transition start
    if (isTransitioning && !isTransitioningRef.current) {
      isTransitioningRef.current = true;
      transitionStartTimeRef.current = Date.now();
    }
    
    // Update entry button position
    if (entryRef.current) {
      const rect = entryRef.current.getBoundingClientRect();
      entryPositionRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }
  }, [mousePosition, isHoveringEntry, entryRef, isTransitioning]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // High DPI canvas setup
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Create particles on initialization - mix of dots and petals
    // Reduce particle count on mobile for better performance
    const isMobile = width < 768;
    const dotCount = isMobile ? 80 : 156; // 50% fewer on mobile
    const petalCount = isMobile ? 10 : 20; // 50% fewer on mobile
    const totalParticles = dotCount + petalCount;
    
    particlesRef.current = [];
    
    // Create regular floating dots
    for (let i = 0; i < dotCount; i++) {
      const parallax = 0.2 + Math.random() * 0.8;
      particlesRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: parallax * (1 + Math.random() * 1.5),
        baseOpacity: 0.1 + Math.random() * 0.4,
        opacity: 0.1 + Math.random() * 0.4,
        parallax: parallax,
        type: 'dot',
      });
    }
    
    // Create cherry blossom petals - slower, calmer, smaller
    for (let i = 0; i < petalCount; i++) {
      const parallax = 0.3 + Math.random() * 0.7;
      const petalColors = [
        'rgba(255, 182, 193, ', // Light pink
        'rgba(255, 192, 203, ', // Pink
        'rgba(255, 218, 224, ', // Pale pink
        'rgba(252, 232, 230, ', // Very light pink
      ];
      particlesRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15, // Slower horizontal drift
        vy: Math.random() * 0.15 + 0.1, // Gentle slow downward drift
        radius: 2 + Math.random() * 2.5, // Smaller petal size
        baseOpacity: 0.5 + Math.random() * 0.3,
        opacity: 0.5 + Math.random() * 0.3,
        parallax: parallax,
        type: 'petal',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.01, // Slower rotation
        color: petalColors[Math.floor(Math.random() * petalColors.length)],
      });
    }

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach(p => {
        // Transition: Gather → Hold → Burst
        if (isTransitioningRef.current) {
          const elapsed = (Date.now() - transitionStartTimeRef.current) / 1000; // seconds
          const gatherDuration = 1.0; // 1 second gather
          const holdDuration = 0.5; // 0.5 second hold
          const burstDuration = 2.0; // 2 seconds burst
          const totalDuration = gatherDuration + holdDuration + burstDuration;
          
          if (elapsed < gatherDuration) {
            // PHASE 1: GATHER (0-1s) - Pull particles toward button
            const dx = entryPositionRef.current.x - p.x;
            const dy = entryPositionRef.current.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Strong attraction force
            const gatherForce = (elapsed / gatherDuration) * 8;
            
            if (dist > 0) {
              p.x += (dx / dist) * gatherForce * p.parallax;
              p.y += (dy / dist) * gatherForce * p.parallax;
            }
            
          } else if (elapsed < gatherDuration + holdDuration) {
            // PHASE 2: HOLD (1-1.5s) - Particles stay gathered, gentle breathing
            const holdProgress = (elapsed - gatherDuration) / holdDuration;
            const breathe = Math.sin(holdProgress * Math.PI * 4) * 2; // Gentle pulse
            
            const dx = entryPositionRef.current.x - p.x;
            const dy = entryPositionRef.current.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0) {
              p.x += (dx / dist) * breathe * p.parallax * 0.1;
              p.y += (dy / dist) * breathe * p.parallax * 0.1;
            }
            
          } else if (elapsed < totalDuration) {
            // PHASE 3: BURST (1.5-3.5s) - Release outward
            const burstProgress = (elapsed - gatherDuration - holdDuration) / burstDuration;
            
            const dx = p.x - entryPositionRef.current.x;
            const dy = p.y - entryPositionRef.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Burst force increases rapidly
            const burstForce = burstProgress * burstProgress * 20; // Quadratic easing
            
            if (dist > 0) {
              p.x += (dx / dist) * burstForce * p.parallax;
              p.y += (dy / dist) * burstForce * p.parallax;
            }
            
            // Fade out particles during burst
            p.opacity = p.baseOpacity * (1 - burstProgress);
          }
        } else {
          // Normal behavior: Basic drift movement
          p.x += p.vx;
          p.y += p.vy;

          // Special attraction when hovering over "enter the garden"
          if (isHoveringRef.current) {
            const dx = entryPositionRef.current.x - p.x;
            const dy = entryPositionRef.current.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Gentle attraction force (stronger for closer particles)
            const attractionForce = Math.min(dist / 200, 1) * 0.5;
            p.x += (dx / dist) * attractionForce * p.parallax;
            p.y += (dy / dist) * attractionForce * p.parallax;
          } else {
            // Normal mouse repulsion when not hovering entry
            const dx = p.x - mouseRef.current.x;
            const dy = p.y - mouseRef.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            const force = Math.max(0, 100 - dist) / 100;
            if (dist < 100) {
              p.x += (dx / dist) * force * p.parallax;
              p.y += (dy / dist) * force * p.parallax;
            }
          }

          // Screen edge wrapping
          if (p.x > width + 10) p.x = -10;
          if (p.x < -10) p.x = width + 10;
          if (p.y > height + 10) p.y = -10;
          if (p.y < -10) p.y = height + 10;
          
          // Subtle opacity flicker
          p.opacity = p.baseOpacity + Math.sin(Date.now() * 0.001 + p.x) * 0.1;
        }

        // Draw based on particle type
        if (p.type === 'dot') {
          // Draw regular particle dot
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2, false);
          ctx.fillStyle = `rgba(176, 135, 23, ${p.opacity})`;
          ctx.fill();
        } else if (p.type === 'petal') {
          // Draw cherry blossom petal
          ctx.save();
          ctx.translate(p.x, p.y);
          
          // Update and apply rotation
          if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
            p.rotation += p.rotationSpeed;
            ctx.rotate(p.rotation);
          }
          
          // Draw petal shape (simple oval/ellipse for cherry blossom)
          ctx.beginPath();
          ctx.ellipse(0, 0, p.radius, p.radius * 1.5, 0, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.opacity})`;
          ctx.fill();
          
          // Add subtle darker edge for depth
          ctx.strokeStyle = `rgba(255, 150, 170, ${p.opacity * 0.3})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
          
          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    
    // Resize handler
    const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-30" />;
};

export default ParticleCanvas;
