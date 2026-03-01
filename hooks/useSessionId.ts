import { useState, useEffect } from 'react';

/**
 * Hook to manage user session ID for backend communication
 * Session ID is stored in localStorage and persists across page reloads
 */
export const useSessionId = () => {
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // Get or create session ID
    let sid = localStorage.getItem('bloom_session_id');
    
    if (!sid) {
      // Generate new session ID
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 11);
      sid = `session_${timestamp}_${random}`;
      
      // Save to localStorage
      localStorage.setItem('bloom_session_id', sid);
      console.log('✨ New session created:', sid);
    } else {
      console.log('♻️ Existing session loaded:', sid);
    }
    
    setSessionId(sid);
  }, []);

  return sessionId;
};

export default useSessionId;
