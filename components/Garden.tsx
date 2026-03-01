
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
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Get user session ID for backend communication
  const sessionId = useSessionId();

  // Voice recorder hook
  const { recordingState } = useVoiceRecorder({
    isRecording,
    onRecordingStart: () => {
      console.log('🎤 Recording started');
    },
    onRecordingStop: () => {
      console.log('🎤 Recording stopped');
    },
    onRecordingComplete: async (audioBlob: Blob) => {
      console.log('🎤 Recording complete, size:', audioBlob.size, 'bytes');
      setIsProcessing(true);
      
      try {
        // TODO: Replace with your actual Replicate backend URL
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL 
  ? `${import.meta.env.VITE_BACKEND_URL}/api/analyze-voice`
  : 'http://localhost:5000/api/analyze-voice';
        
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
        console.log('✅ Backend response:', result);
        
        // Set flower data and show flower page
        setFlowerData({
          emotion: result.emotion,
          poem: result.poem,
          transcript: result.transcript,
        });
        
        setIsProcessing(false);
        setShowFlowerPage(true);
        
      } catch (error) {
        console.error('❌ Error processing voice:', error);
        setIsProcessing(false);
        alert('Could not process recording. Please try again.\n\nMake sure backend is running at: http://localhost:5000');
      }
    },
    maxDuration: 30000, // 30 seconds
  });

  useEffect(() => {
    // Start text fade out after 3 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 3000);

    // Remove text and show bubble after fade finishes
    const removeTimer = setTimeout(() => {
      setTextGone(true);
      setShowBubble(true);
    }, 6000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  const handleBubbleClick = () => {
    if (!isRecording) {
      console.log('🎤 Starting recording...');
      setIsRecording(true);
    } else {
      console.log('⏹️ Stopping recording...');
      setIsRecording(false);
    }
  };

  const handleCloseFlowerPage = () => {
    setShowFlowerPage(false);
    setFlowerData(null);
    setIsRecording(false);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    let animationId: number;
    const mount = containerRef.current;
    
    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialiasing: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    const fogColor = new THREE.Color(0xF5E6D3);
    renderer.setClearColor(fogColor, 0.2);
    mount.appendChild(renderer.domElement);
    
    // Fog
    scene.fog = new THREE.FogExp2(fogColor, 0.07);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.0);
    scene.add(ambientLight);

    // Particles
    const particleCount = 800;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const accelerations = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 80;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    particleGeometry.setAttribute('acceleration', new THREE.BufferAttribute(accelerations, 3));

    const createCircleTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d')!;
        
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(160, 120, 77, 0.8)');
        gradient.addColorStop(0.3, 'rgba(160, 120, 77, 0.5)');
        gradient.addColorStop(0.6, 'rgba(160, 120, 77, 0.2)');
        gradient.addColorStop(1, 'rgba(160, 120, 77, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        
        return new THREE.CanvasTexture(canvas);
    };

    // Shader Material with center masking
    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        pointTexture: { value: createCircleTexture() },
        centerMaskRadius: { value: 0.25 }, // Inner radius (0-1, screen space)
        centerMaskFeather: { value: 0.15 }, // Feather distance
      },
      vertexShader: `
        varying vec2 vScreenPos;
        
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = 0.3 * (300.0 / -mvPosition.z);
          
          // Pass screen position to fragment shader (normalized -1 to 1)
          vScreenPos = gl_Position.xy / gl_Position.w;
        }
      `,
      fragmentShader: `
        uniform sampler2D pointTexture;
        uniform float centerMaskRadius;
        uniform float centerMaskFeather;
        varying vec2 vScreenPos;
        
        void main() {
          // Sample particle texture
          vec4 texColor = texture2D(pointTexture, gl_PointCoord);
          
          // Calculate distance from screen center
          float distFromCenter = length(vScreenPos);
          
          // Feathered mask (invisible at center, visible outside)
          float maskStart = centerMaskRadius;
          float maskEnd = centerMaskRadius + centerMaskFeather;
          float maskAlpha = smoothstep(maskStart, maskEnd, distFromCenter);
          
          // Apply mask to particle opacity
          gl_FragColor = vec4(texColor.rgb, texColor.a * maskAlpha * 0.6);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Mouse interaction
    const mouse = new THREE.Vector2(10000, 10000);
    const targetCameraRotation = new THREE.Vector2(0, 0);

    const handleMouseMove = (event: MouseEvent) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        targetCameraRotation.y = mouse.x * 0.1;
        targetCameraRotation.x = mouse.y * 0.05;
    };
    
    const handleTouchMove = (event: TouchEvent) => {
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
            
            targetCameraRotation.y = mouse.x * 0.1;
            targetCameraRotation.x = mouse.y * 0.05;
        }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    const clock = new THREE.Clock();
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      camera.position.z -= 0.008;

      camera.rotation.x += (targetCameraRotation.x - camera.rotation.x) * 0.05;
      camera.rotation.y += (targetCameraRotation.y - camera.rotation.y) * 0.05;

      const pPositions = particles.geometry.attributes.position.array as Float32Array;
      const pVelocities = particles.geometry.attributes.velocity.array as Float32Array;
      
      const mousePos3D = new THREE.Vector3(mouse.x, mouse.y, 0.5);
      mousePos3D.unproject(camera);
      const dir = mousePos3D.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z;
      const mouseWorldPos = camera.position.clone().add(dir.multiplyScalar(distance));
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const particlePos = new THREE.Vector3(pPositions[i3], pPositions[i3 + 1], pPositions[i3 + 2]);

        // Mouse Repulsion (existing)
        const distToMouse = particlePos.distanceTo(mouseWorldPos);
        const repulsionRadius = 5;
        if (distToMouse < repulsionRadius) {
            const repulsionForce = (repulsionRadius - distToMouse) / repulsionRadius;
            const direction = particlePos.clone().sub(mouseWorldPos).normalize();
            pVelocities[i3] += direction.x * repulsionForce * 0.05;
            pVelocities[i3 + 1] += direction.y * repulsionForce * 0.05;
        }

        // Random motion / turbulence
        pVelocities[i3] += (Math.random() - 0.5) * 0.001;
        pVelocities[i3 + 1] += (Math.random() - 0.5) * 0.001;
        pVelocities[i3 + 2] += (Math.random() - 0.5) * 0.001;
        
        // Apply velocity and damping
        pPositions[i3] += pVelocities[i3];
        pPositions[i3 + 1] += pVelocities[i3 + 1];
        pPositions[i3 + 2] += pVelocities[i3 + 2];
        pVelocities[i3] *= 0.98;
        pVelocities[i3 + 1] *= 0.98;
        pVelocities[i3 + 2] *= 0.98;

        // Respawn particles - always ahead of camera for continuous loop
        const distFromCamera = particlePos.distanceTo(camera.position);
        if (distFromCamera > 40) {
            pPositions[i3] = camera.position.x + (Math.random() - 0.5) * 40;
            pPositions[i3 + 1] = camera.position.y + (Math.random() - 0.5) * 40;
            pPositions[i3 + 2] = camera.position.z - Math.random() * 30 - 10;  // Always spawn ahead
            pVelocities[i3] = 0;
            pVelocities[i3 + 1] = 0;
            pVelocities[i3 + 2] = 0;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;

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
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, []);

  return (
    <>
      <div 
        ref={containerRef} 
        className="absolute top-0 left-0 w-full h-full z-0"
      />
      
      {/* Radial gradient overlay - pink/orange from center, lighter at edges */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
            style={{
              background: `radial-gradient(circle at center, 
                rgba(232, 180, 188, 0.15) 0%,
                rgba(212, 162, 118, 0.12) 30%,
                rgba(245, 230, 211, 0.08) 50%,
                transparent 70%
              )`,
            }}
          />
        )}
      </AnimatePresence>
      
      {!textGone && (
        <div 
          className="relative z-10 text-center text-[#5a524c] transition-all duration-3000 ease-out"
          style={{
            animation: fadeOut ? 'dissolveIntoFog 3s ease-out forwards' : 'softFadeIn 1.5s ease-out',
          }}
        >
          <h1 className="text-5xl font-light tracking-wider mb-4 opacity-80">
            Welcome to the Garden
          </h1>
          <p className="text-xl font-light opacity-50">
            Your emotional sanctuary awaits...
          </p>
        </div>
      )}
      
      {/* Bubble - appears after text fades */}
      {showBubble && (
        <BubbleGradient 
          onBubbleClick={handleBubbleClick}
          isRecording={isRecording}
          recordingDuration={recordingState.duration}
          audioLevel={recordingState.audioLevel}
        />
      )}

      {/* Loading animation while processing */}
      {isProcessing && <LoadingAnimation />}

      {/* Flower page - shows emotion and poem */}
      {showFlowerPage && flowerData && (
        <FlowerPage
          emotion={flowerData.emotion}
          poem={flowerData.poem}
          transcript={flowerData.transcript}
          onClose={handleCloseFlowerPage}
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
