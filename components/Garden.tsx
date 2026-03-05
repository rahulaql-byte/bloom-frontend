import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import BubbleGradient from './BubbleGradient';
import FlowerPage from './FlowerPage';
import LoadingAnimation from './LoadingAnimation';
import useVoiceRecorder from '../hooks/useVoiceRecorder';
import useSessionId from '../hooks/useSessionId';
import { motion, AnimatePresence } from 'framer-motion';

const Garden: React.FC = () => {
  const [fadeOut, setFadeOut] = useState(false);
  const [textGone, setTextGone] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFlowerPage, setShowFlowerPage] = useState(false);
  const [flowerData, setFlowerData] = useState<{
    emotion: 'tenderness' | 'contentment' | 'growth' | 'warmth' | 'tranquility';
    poem: string;
    transcript?: string;
    flowerImage?: string;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const sessionId = useSessionId();

  const { recordingState } = useVoiceRecorder({
    isRecording,
    onRecordingStart: () => {
      console.log('Recording started');
    },
    onRecordingStop: () => {
      console.log('Recording stopped');
    },
    onRecordingComplete: async (audioBlob: Blob) => {
      console.log('Recording complete, size:', audioBlob.size, 'bytes');
      setIsProcessing(true);
      
      try {
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL 
          ? `${import.meta.env.VITE_BACKEND_URL}/api/analyze-voice`
          : 'https://bloom-backend-production-2d21.up.railway.app/api/analyze-voice';
        
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        
        const response = await fetch(BACKEND_URL, {
          method: 'POST',
          headers: {
            'X-Session-ID': sessionId,
          },
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Backend request failed: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Backend response:', result);
        
        setFlowerData({
          emotion: result.emotion,
          poem: result.poem,
          transcript: result.transcript,
          flowerImage: result.flower_image,
        });
        
        setIsProcessing(false);
        setShowFlowerPage(true);
        
      } catch (error) {
        console.error('Error processing voice:', error);
        setIsProcessing(false);
        alert('Could not process recording. Please try again.\n\nMake sure backend is running.');
      }
    },
    maxDuration: 30000,
  });

  const handleBubbleClick = () => {
    setIsRecording(!isRecording);
  };

  const handleReturnToGarden = () => {
    setShowFlowerPage(false);
    setFlowerData(null);
  };

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setFadeOut(true);
    }, 2000);

    const timer2 = setTimeout(() => {
      setTextGone(true);
    }, 3000);

    const timer3 = setTimeout(() => {
      setShowBubble(true);
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || !showBubble) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    camera.position.z = 5;

    const particles: THREE.Points[] = [];
    const particleCount = 800;

    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.BufferGeometry();
      const position = new Float32Array(3);

      const radius = 15;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      position[0] = radius * Math.sin(phi) * Math.cos(theta);
      position[1] = radius * Math.sin(phi) * Math.sin(theta);
      position[2] = radius * Math.cos(phi);

      geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));

      const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: Math.random() * 0.03 + 0.01,
        transparent: true,
        opacity: Math.random() * 0.3 + 0.1,
        blending: THREE.AdditiveBlending,
      });

      const particle = new THREE.Points(geometry, material);
      particle.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.002
        ),
        baseOpacity: Math.random() * 0.3 + 0.1,
      };

      scene.add(particle);
      particles.push(particle);
    }

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);

      particles.forEach((particle) => {
        const positions = particle.geometry.attributes.position.array as Float32Array;
        const x = positions[0];
        const y = positions[1];
        const z = positions[2];

        const distanceToCenter = Math.sqrt(x * x + y * y + z * z);

        particle.userData.velocity.x += (Math.random() - 0.5) * 0.0001;
        particle.userData.velocity.y += (Math.random() - 0.5) * 0.0001;
        particle.userData.velocity.z += (Math.random() - 0.5) * 0.0001;

        positions[0] += particle.userData.velocity.x;
        positions[1] += particle.userData.velocity.y;
        positions[2] += particle.userData.velocity.z;

        if (distanceToCenter < 3) {
          const material = particle.material as THREE.PointsMaterial;
          const distanceFactor = distanceToCenter / 3;
          const fadeStart = 0.7;
          
          if (distanceFactor < fadeStart) {
            const fadeAmount = 1 - ((fadeStart - distanceFactor) / fadeStart);
            material.opacity = particle.userData.baseOpacity * fadeAmount * 0.3;
          } else {
            material.opacity = particle.userData.baseOpacity;
          }
        } else {
          const material = particle.material as THREE.PointsMaterial;
          material.opacity = particle.userData.baseOpacity;
        }

        const newDistance = Math.sqrt(
          positions[0] * positions[0] +
          positions[1] * positions[1] +
          positions[2] * positions[2]
        );

        if (newDistance > 20 || newDistance < 1) {
          const radius = 15;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);

          positions[0] = radius * Math.sin(phi) * Math.cos(theta);
          positions[1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[2] = radius * Math.cos(phi);

          particle.userData.velocity.set(
            (Math.random() - 0.5) * 0.002,
            (Math.random() - 0.5) * 0.002,
            (Math.random() - 0.5) * 0.002
          );
        }

        particle.geometry.attributes.position.needsUpdate = true;
      });

      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      particles.forEach((particle) => {
        particle.geometry.dispose();
        (particle.material as THREE.Material).dispose();
      });
      renderer.dispose();
    };
  }, [showBubble]);

  return (
    <>
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(180deg, #b8c8d8 0%, #d8c4c8 40%, #e8d4c8 70%, #e8d0c4 100%)',
          zIndex: 0,
        }}
      />

      <AnimatePresence>
        {!textGone && (
          <motion.div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 5,
              textAlign: 'center',
              color: '#D4A276',
              fontSize: '1.2rem',
              fontWeight: 300,
              letterSpacing: '0.15em',
              textTransform: 'lowercase',
              pointerEvents: 'none',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: fadeOut ? 0 : 1,
              y: fadeOut ? -20 : 0,
              filter: fadeOut ? 'blur(8px)' : 'blur(0px)'
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 1,
              ease: 'easeInOut'
            }}
          >
            speak your feelings into the void
          </motion.div>
        )}
      </AnimatePresence>

      {showBubble && (
        <BubbleGradient 
          onBubbleClick={handleBubbleClick}
          isRecording={isRecording}
          recordingDuration={recordingState.duration}
          audioLevel={recordingState.audioLevel}
        />
      )}

      {isProcessing && <LoadingAnimation />}

      {showFlowerPage && flowerData && (
        <FlowerPage
          emotion={flowerData.emotion}
          poem={flowerData.poem}
          transcript={flowerData.transcript}
          flowerImage={flowerData.flowerImage}
          onReturn={handleReturnToGarden}
        />
      )}
      
      <style>{`
        @keyframes softFadeIn {
          0% { 
            opacity: 0; 
            transform: translateY(10px);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        
        @keyframes dissolveIntoFog {
          0% { 
            opacity: 1; 
            transform: translateY(0) scale(1);
            filter: blur(0px);
          }
          100% { 
            opacity: 0;
            transform: translateY(-15px) scale(1.05);
            filter: blur(8px);
          }
        }
      `}</style>
    </>
  );
};

export default Garden;
