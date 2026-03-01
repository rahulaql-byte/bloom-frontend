import { useState, useRef, useEffect } from 'react';

interface VoiceRecorderProps {
  isRecording: boolean;
  onRecordingComplete: (audioBlob: Blob) => void;
  onRecordingStart: () => void;
  onRecordingStop: () => void;
  maxDuration?: number; // in milliseconds, default 30s
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number; // in seconds
  audioLevel: number; // 0-1 for visualizations
}

const useVoiceRecorder = (props: VoiceRecorderProps) => {
  const {
    isRecording,
    onRecordingComplete,
    onRecordingStart,
    onRecordingStop,
    maxDuration = 30000, // 30 seconds default
  } = props;

  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioLevel: 0,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<number>();

  // Start recording
  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      
      streamRef.current = stream;

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Collect audio data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(audioBlob);
        cleanup();
      };

      // Start recording
      mediaRecorder.start();
      startTimeRef.current = Date.now();
      
      // Set up audio analysis for visualization
      setupAudioAnalysis(stream);
      
      // Start duration tracking
      startDurationTracking();

      // Update state
      setRecordingState(prev => ({
        ...prev,
        isRecording: true,
        duration: 0,
      }));

      onRecordingStart();

      // Auto-stop after max duration
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording();
        }
      }, maxDuration);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      onRecordingStop();
      
      setRecordingState(prev => ({
        ...prev,
        isRecording: false,
      }));
    }
  };

  // Set up audio analysis for level visualization
  const setupAudioAnalysis = (stream: MediaStream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    
    analyser.fftSize = 256;
    microphone.connect(analyser);
    
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    
    // Start analyzing audio level
    analyzeAudioLevel();
  };

  // Analyze audio level for visualization
  const analyzeAudioLevel = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateLevel = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength / 255; // Normalize to 0-1
      
      setRecordingState(prev => ({
        ...prev,
        audioLevel: average,
      }));

      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  };

  // Track recording duration
  const startDurationTracking = () => {
    durationIntervalRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000; // Convert to seconds
      setRecordingState(prev => ({
        ...prev,
        duration: Math.floor(elapsed),
      }));
    }, 100);
  };

  // Cleanup resources
  const cleanup = () => {
    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Clear duration interval
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }

    analyserRef.current = null;
    mediaRecorderRef.current = null;
  };

  // Handle recording state changes from parent
  useEffect(() => {
    if (isRecording && !recordingState.isRecording) {
      startRecording();
    } else if (!isRecording && recordingState.isRecording) {
      stopRecording();
    }
  }, [isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return {
    recordingState,
    startRecording,
    stopRecording,
  };
};

export default useVoiceRecorder;
