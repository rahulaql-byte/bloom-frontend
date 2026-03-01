
import { useState, useEffect } from 'react';

// Helper for linear interpolation
const lerp = (start: number, end: number, amount: number): number => {
  return (1 - amount) * start + amount * end;
};

/**
 * Custom hook to track mouse position and provide a smoothed version.
 * The smoothed position "lags" behind the actual cursor, creating a gentle trailing effect.
 * @param {number} smoothing - The smoothing factor (0 to 1). Lower values mean more smoothing.
 * @returns {object} An object containing the smoothed mouse position { x, y }.
 */
const useSmoothMouse = (smoothing = 0.1) => {
  // State for the actual, real-time mouse position
  const [targetMousePosition, setTargetMousePosition] = useState({ x: 0, y: 0 });
  
  // State for the smoothed/animated mouse position
  const [smoothMousePosition, setSmoothMousePosition] = useState({ x: 0, y: 0 });

  // Effect to set up the mouse move event listener
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setTargetMousePosition({ x: event.clientX, y: event.clientY });
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        setTargetMousePosition({ x: touch.clientX, y: touch.clientY });
      }
    };

    const handleTouchEnd = () => {
      // On touch end, move position off-screen to hide reveal
      setTargetMousePosition({ x: -1000, y: -1000 });
    };
    
    // Set initial position off-screen so video is completely hidden until mouse moves
    const initialX = -1000;
    const initialY = -1000;
    setTargetMousePosition({ x: initialX, y: initialY });
    setSmoothMousePosition({ x: initialX, y: initialY });

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []); // Empty dependency array means this runs once on mount

  // Effect to run the animation loop for smoothing
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      setSmoothMousePosition(currentSmoothPos => {
        // Linearly interpolate the smooth position towards the target position
        const newX = lerp(currentSmoothPos.x, targetMousePosition.x, smoothing);
        const newY = lerp(currentSmoothPos.y, targetMousePosition.y, smoothing);
        return { x: newX, y: newY };
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [targetMousePosition, smoothing]); // Rerun if target or smoothing changes

  return { smoothMousePosition };
};

export default useSmoothMouse;
