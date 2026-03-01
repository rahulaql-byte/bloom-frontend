import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface BubbleProps {
  onBubbleClick: () => void;
  isRecording: boolean;
  audioAmplitude?: number;
}

const Bubble: React.FC<BubbleProps> = ({ onBubbleClick, isRecording, audioAmplitude = 0 }) => {
  const bubbleRef = useRef<THREE.Mesh | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 10;
    cameraRef.current = camera;

    // Renderer with transparency
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      premultipliedAlpha: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0); // Transparent
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Frosted Glass Bubble Shader (Apple glassmorphism style)
    const bubbleGeometry = new THREE.SphereGeometry(1.5, 64, 64);
    
    const bubbleShader = {
      uniforms: {
        time: { value: 0 },
        opacity: { value: 0.15 },
        scale: { value: 1.0 },
        audioAmp: { value: 0.0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        uniform float time;
        uniform float audioAmp;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vUv = uv;
          
          // Subtle breathing animation
          float breathe = sin(time * 0.8) * 0.02;
          float audioPulse = audioAmp * 0.1;
          vec3 newPosition = position * (1.0 + breathe + audioPulse);
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        uniform float time;
        uniform float opacity;
        
        // Simple noise function for frosted texture
        float noise(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }
        
        void main() {
          // Fresnel effect for glass rim
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - dot(viewDirection, vNormal), 3.0);
          
          // Frosted glass base color (very subtle blue-white tint)
          vec3 baseColor = vec3(0.96, 0.97, 0.98); // Almost white with hint of blue
          
          // Subtle noise for frosted texture
          float noiseValue = noise(vUv * 100.0 + time * 0.1) * 0.03;
          baseColor += vec3(noiseValue);
          
          // Soft edge glow (white, not rainbow)
          float edgeGlow = fresnel * 0.4;
          vec3 glowColor = vec3(1.0, 1.0, 1.0); // Pure white glow
          vec3 color = mix(baseColor, glowColor, edgeGlow);
          
          // Very subtle blur effect at edges
          float blurFactor = 1.0 - fresnel * 0.3;
          color *= blurFactor;
          
          // Final opacity (very subtle, like real frosted glass)
          float alpha = opacity * (0.15 + fresnel * 0.25);
          
          gl_FragColor = vec4(color, alpha);
        }
      `
    };

    const bubbleMaterial = new THREE.ShaderMaterial({
      uniforms: bubbleShader.uniforms,
      vertexShader: bubbleShader.vertexShader,
      fragmentShader: bubbleShader.fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.NormalBlending // Changed from Additive for more subtle effect
    });

    const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
    bubble.position.set(0, 0, -5); // 5 units in front of camera
    scene.add(bubble);
    bubbleRef.current = bubble;

    // Drift animation (subtle floating)
    let driftOffset = { x: 0, y: 0 };
    let driftSpeed = 0.001;

    // Animation loop
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const elapsed = clock.getElapsedTime();
      
      if (bubbleRef.current && bubbleMaterial.uniforms) {
        // Update shader time
        bubbleMaterial.uniforms.time.value = elapsed;
        
        // Update audio amplitude if recording
        if (isRecording) {
          bubbleMaterial.uniforms.audioAmp.value = audioAmplitude;
          bubbleMaterial.uniforms.scale.value = 1.0 + audioAmplitude * 0.2;
        } else {
          bubbleMaterial.uniforms.audioAmp.value = 0;
          bubbleMaterial.uniforms.scale.value = 1.0;
        }
        
        // Organic drift (figure-8 pattern)
        driftOffset.x = Math.sin(elapsed * 0.5) * 0.3;
        driftOffset.y = Math.sin(elapsed * 0.3) * 0.2;
        
        bubbleRef.current.position.x = driftOffset.x;
        bubbleRef.current.position.y = driftOffset.y;
        
        // Gentle rotation
        bubbleRef.current.rotation.y += 0.002;
      }
      
      renderer.render(scene, camera);
    };

    animate();

    // Raycaster for click detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      
      if (bubbleRef.current) {
        const intersects = raycaster.intersectObject(bubbleRef.current);
        
        if (intersects.length > 0) {
          // Bubble clicked!
          onBubbleClick();
          
          // Click feedback animation
          if (bubbleMaterial.uniforms) {
            // Quick scale bounce
            const originalScale = bubbleMaterial.uniforms.scale.value;
            bubbleMaterial.uniforms.scale.value = 0.9;
            
            setTimeout(() => {
              bubbleMaterial.uniforms.scale.value = 1.1;
            }, 100);
            
            setTimeout(() => {
              bubbleMaterial.uniforms.scale.value = originalScale;
            }, 300);
          }
        }
      }
    };

    window.addEventListener('click', handleClick);

    // Window resize handler
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
      bubbleGeometry.dispose();
      bubbleMaterial.dispose();
    };
  }, [isRecording, audioAmplitude, onBubbleClick]);

  return (
    <>
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'auto',
          zIndex: 10,
        }}
      />
      
      {/* CSS Glassmorphism overlay for enhanced frosted effect */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isRecording ? '210px' : '200px',
          height: isRecording ? '210px' : '200px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px) saturate(150%)',
          WebkitBackdropFilter: 'blur(20px) saturate(150%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: isRecording 
            ? `0 8px 32px 0 rgba(31, 38, 135, 0.25),
               inset 0 0 30px 0 rgba(255, 255, 255, 0.2)`
            : `0 8px 32px 0 rgba(31, 38, 135, 0.15),
               inset 0 0 20px 0 rgba(255, 255, 255, 0.1)`,
          pointerEvents: 'none',
          zIndex: 9,
          opacity: 0.8,
          transition: 'all 0.3s ease',
        }}
      />
    </>
  );
};

export default Bubble;
