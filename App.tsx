import React, { useState, useEffect, useRef } from 'react';
import ParticleCanvas from './components/ParticleCanvas';
import Garden from './components/Garden';
import FogReveal from './components/FogReveal';
import BreathingTransition from './components/BreathingTransition';  // ← ADDED
import useSmoothMouse from './hooks/useSmoothMouse';

// Helper for linear interpolation to create the smooth trailing effect
const lerp = (start: number, end: number, amt: number): number => {
  return (1 - amt) * start + amt * end;
};

// A component for the fog layers to avoid code duplication
const FogLayers: React.FC = () => (
  <>
    {/* Core fog base: Paper mist → Warm ash → Stone haze */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#f2efe9]/90 via-[#e6e1d8]/85 to-[#d9d4cc]/90 animate-drift-slow" />
    {/* Light warmth: Morning ivory → Soft apricot → Komorebi gold */}
    <div className="absolute inset-0 bg-gradient-to-tl from-[#f6f1e7]/40 via-[#f0e3d1]/35 to-[#e8dcc3]/40 mix-blend-soft-light animate-drift-medium" />
    {/* Cool balance: Dawn blue-grey → Rain mist blue */}
    <div className="absolute inset-0 bg-gradient-to-tr from-[#d7dde2]/35 via-transparent to-[#cfd6dc]/25 mix-blend-overlay animate-drift-fast" />
    {/* Additional dense fog layer for complete coverage */}
    <div className="absolute inset-0 bg-[#e6e1d8]/70 animate-drift-slower" />
  </>
);

// Main App component
const App: React.FC = () => {
  // Real and smoothed mouse positions
  const { smoothMousePosition } = useSmoothMouse(0.075); 
  const [realMousePosition, setRealMousePosition] = useState({ x: 0, y: 0 });

  // Refs for text elements to calculate proximity
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const entryRef = useRef<HTMLParagraphElement>(null);

  // State for audio control
  const [isMuted, setIsMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // State to hold dynamic styles for text based on cursor proximity
  const [textStyles, setTextStyles] = useState({
    title: {},
    subtitle: {},
    entry: {},
  });

  // Track if cursor is hovering over "enter the garden" button
  const [isHoveringEntry, setIsHoveringEntry] = useState(false);
  
  // Transition animation state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showBreathingTransition, setShowBreathingTransition] = useState(false);  // ← ADDED
  const [showGarden, setShowGarden] = useState(false);

  // Handle entering the garden with breathing transition
  const handleEnterGarden = () => {
    if (isTransitioning) return; // Prevent double-click
    
    setIsTransitioning(true);
    setShowBreathingTransition(true);  // ← ADDED: Show breathing transition
    
    // Fade out audio
    const audio = audioRef.current;
    if (audio && !isMuted) {
      const duration = 1500;
      const steps = 60;
      const startVolume = audio.volume;
      const decrement = startVolume / steps;
      const interval = duration / steps;
      
      let currentStep = 0;
      const fadeInterval = setInterval(() => {
        currentStep++;
        audio.volume = Math.max(startVolume - (currentStep * decrement), 0);
        
        if (currentStep >= steps) {
          clearInterval(fadeInterval);
          audio.pause();
        }
      }, interval);
    }
  };

  // Handle breathing transition complete
  const handleBreathingComplete = () => {  // ← ADDED
    setShowBreathingTransition(false);
    setShowGarden(true);
  };

  // Effect to track real mouse position and first interaction
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setRealMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        setRealMousePosition({ x: touch.clientX, y: touch.clientY });
      }
    };

    const handleTouchEnd = () => {
      // On touch end, move position off-screen to hide video again
      setRealMousePosition({ x: -1000, y: -1000 });
    };

    const onFirstInteraction = () => {
        setHasInteracted(true);
        window.removeEventListener('mousemove', onFirstInteraction);
        window.removeEventListener('touchstart', onFirstInteraction);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('mousemove', onFirstInteraction);
    window.addEventListener('touchstart', onFirstInteraction);

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
        window.removeEventListener('mousemove', onFirstInteraction);
        window.removeEventListener('touchstart', onFirstInteraction);
    }
  }, []);

  // Effect to control audio playback based on user interaction and mute state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const fadeIn = () => {
      audio.volume = 0;
      audio.play().catch(error => console.error("Audio play failed:", error));
      
      const duration = 2000; // 2 seconds fade in
      const steps = 60;
      const increment = 0.15 / steps;
      const interval = duration / steps;
      
      let currentStep = 0;
      const fadeInterval = setInterval(() => {
        currentStep++;
        audio.volume = Math.min(currentStep * increment, 0.15);
        
        if (currentStep >= steps) {
          clearInterval(fadeInterval);
        }
      }, interval);
      
      return fadeInterval;
    };

    const fadeOut = () => {
      const duration = 1500; // 1.5 seconds fade out
      const steps = 60;
      const startVolume = audio.volume;
      const decrement = startVolume / steps;
      const interval = duration / steps;
      
      let currentStep = 0;
      const fadeInterval = setInterval(() => {
        currentStep++;
        audio.volume = Math.max(startVolume - (currentStep * decrement), 0);
        
        if (currentStep >= steps) {
          clearInterval(fadeInterval);
          audio.pause();
        }
      }, interval);
      
      return fadeInterval;
    };

    let fadeInterval: number | undefined;

    if (hasInteracted && !isMuted) {
      fadeInterval = fadeIn();
    } else if (hasInteracted && isMuted) {
      fadeInterval = fadeOut();
    }

    return () => {
      if (fadeInterval) clearInterval(fadeInterval);
    };
  }, [isMuted, hasInteracted]);


  // Main animation loop using requestAnimationFrame for text effects
  useEffect(() => {
    let animationFrameId: number;

    const updateTextStyles = () => {
      const texts = [
        { ref: titleRef, key: 'title' },
        { ref: subtitleRef, key: 'subtitle' },
        { ref: entryRef, key: 'entry' },
      ];

      const newStyles: any = {};

      texts.forEach(({ ref, key }) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const textCenter = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };
          
          const distance = Math.sqrt(
            Math.pow(textCenter.x - smoothMousePosition.x, 2) +
            Math.pow(textCenter.y - smoothMousePosition.y, 2)
          );

          const maxDist = 200;
          const proximity = Math.max(0, 1 - distance / maxDist);
          
          const blur = (1 - proximity ** 2) * 5;
          const opacity = 0.3 + proximity * 0.7;
          const scale = 1 + proximity * 0.02;

          const contrast = 1 + proximity * 0.5;
          const brightness = 1 + proximity * 0.1;

          const distortion = (1 - proximity) * 5;
          const shadowBlur = 5 + (1 - proximity) * 15;
          const shadowOpacity = 0.1 + proximity * 0.1;
          const textShadow = `
            ${distortion}px ${distortion}px ${shadowBlur}px rgba(90, 82, 76, ${shadowOpacity}),
            -${distortion}px -${distortion}px ${shadowBlur}px rgba(90, 82, 76, ${shadowOpacity})
          `;

          newStyles[key] = {
            filter: `blur(${blur}px) contrast(${contrast}) brightness(${brightness})`,
            opacity,
            transform: `scale(${scale})`,
            textShadow,
          };

          // Check if hovering over entry button
          if (key === 'entry') {
            const isHovering = 
              smoothMousePosition.x >= rect.left &&
              smoothMousePosition.x <= rect.right &&
              smoothMousePosition.y >= rect.top &&
              smoothMousePosition.y <= rect.bottom;
            
            setIsHoveringEntry(isHovering);
          }
        }
      });

      setTextStyles(prevState => ({ ...prevState, ...newStyles }));
      animationFrameId = requestAnimationFrame(updateTextStyles);
    };

    animationFrameId = requestAnimationFrame(updateTextStyles);

    return () => cancelAnimationFrame(animationFrameId);
  }, [smoothMousePosition]);

  return (
    <>
      {/* ========== BREATHING TRANSITION ========== */}
      {showBreathingTransition && (
        <BreathingTransition 
          onComplete={handleBreathingComplete}
          duration={2500}
        />
      )}
      {/* ========================================== */}

      {showGarden ? (
        <main className="relative w-screen h-screen overflow-hidden bg-[#F5E6D3]">
          <Garden />
        </main>
      ) : (
        <div className="relative w-screen h-screen overflow-hidden bg-[#e6e1d8]">
          {/* Layer 1: Base Fog Layer */}
          <div className="absolute inset-0 z-0">
            <FogLayers />
          </div>

          {/* Layer 2: Interactive Fog Reveal Effects (replaces video) */}
          <div className="absolute inset-0 z-10">
            <FogReveal mousePosition={smoothMousePosition} />
          </div>
      
      {/* Layer 3: Floating Particles / Stars */}
      <ParticleCanvas 
        mousePosition={smoothMousePosition} 
        isHoveringEntry={isHoveringEntry}
        entryRef={entryRef}
        isTransitioning={isTransitioning}
      />
      
      {/* Layer 4: Text Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-[#5a524c] select-none pointer-events-none z-40 px-4">
        <h1
          ref={titleRef}
          style={textStyles.title}
          className="text-6xl md:text-8xl font-thin tracking-widest transition-all duration-500 ease-out"
        >
          Bloom
        </h1>
        <p
          ref={subtitleRef}
          style={textStyles.subtitle}
          className="mt-4 text-base md:text-xl font-light tracking-wider transition-all duration-500 ease-out max-w-md"
        >
          a quiet place for feelings to take shape
        </p>
        <p
          ref={entryRef}
          style={{
            ...textStyles.entry,
            cursor: 'pointer',
          }}
          onClick={handleEnterGarden}
          className="absolute bottom-16 md:bottom-16 text-base md:text-lg font-light tracking-widest transition-all duration-500 ease-out pointer-events-auto"
        >
          enter the garden
        </p>
      </div>

      {/* Audio Element - Meditative Soundscape */}
      <audio ref={audioRef} src="/soundscape.mp3" loop playsInline />

      {/* Sound Toggle Button - Touch-friendly size */}
      <button
        onClick={() => setIsMuted(prev => !prev)}
        className="absolute top-4 right-4 md:top-6 md:right-6 z-50 text-[#5a524c] p-4 md:p-3 rounded-full hover:bg-[#d9d4cc]/50 active:bg-[#d9d4cc]/60 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#c7bcaf]"
        aria-label={isMuted ? "Unmute sound" : "Mute sound"}
      >
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
        )}
      </button>

      {/* Custom Cursor */}
      <div
        className="custom-cursor"
        style={{ left: `${realMousePosition.x}px`, top: `${realMousePosition.y}px` }}
      />
        </div>
      )}
    </>
  );
};

// Tailwind CSS keyframe animations
const StyleInjector: React.FC = () => {
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes drift-slow {
                0% { transform: translate(0, 0) scale(1); }
                50% { transform: translate(20px, -30px) scale(1.05); }
                100% { transform: translate(0, 0) scale(1); }
            }
            .animate-drift-slow { animation: drift-slow 45s ease-in-out infinite; }

            @keyframes drift-medium {
                0% { transform: translate(0, 0) scale(1.2); }
                50% { transform: translate(-25px, 20px) scale(1.25); }
                100% { transform: translate(0, 0) scale(1.2); }
            }
            .animate-drift-medium { animation: drift-medium 40s ease-in-out infinite; }

            @keyframes drift-slower {
                0% { transform: translate(0, 0) scale(1.3); }
                50% { transform: translate(15px, 10px) scale(1.32); }
                100% { transform: translate(0, 0) scale(1.3); }
            }
            .animate-drift-slower { animation: drift-slower 55s ease-in-out infinite; }

            @keyframes drift-fast {
                0% { transform: translate(0, 0) scale(1.5); }
                50% { transform: translate(10px, 15px) scale(1.55); }
                100% { transform: translate(0, 0) scale(1.5); }
            }
            .animate-drift-fast { animation: drift-fast 35s ease-in-out infinite; }
            
            @keyframes fadeInOverlay {
                0% { opacity: 0; }
                50% { opacity: 0; }
                100% { opacity: 1; }
            }
            
            @keyframes softFadeIn {
                0% { opacity: 0; transform: translateY(10px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes fadeOutSoft {
                0% { opacity: 1; }
                100% { opacity: 0; }
            }
            
            .bg-radial-gradient {
              background-image: radial-gradient(circle, var(--tw-gradient-stops));
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);
    return null;
};

// Main App with injected styles
const AppWithStyles: React.FC = () => (
    <>
        <StyleInjector />
        <App />
    </>
);

export default AppWithStyles;
