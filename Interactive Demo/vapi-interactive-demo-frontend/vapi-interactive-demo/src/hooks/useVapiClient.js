import { useRef, useEffect, useState, useCallback } from 'react';
import Vapi from '@vapi-ai/web';

// Reads Vapi public key from environment
const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '';
console.log('[DEBUG] Vapi public key:', VAPI_PUBLIC_KEY);

export function useVapiClient() {
  const vapiRef = useRef(null);
  const [callActive, setCallActive] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!VAPI_PUBLIC_KEY) {
      setError('Vapi public key is missing.');
      return;
    }
    // Initialize Vapi client
    vapiRef.current = new Vapi(VAPI_PUBLIC_KEY);
console.log('[DEBUG] Vapi instance initialized:', vapiRef.current);

    // Event listeners
    vapiRef.current.on('call-start', () => setCallActive(true));
    vapiRef.current.on('call-end', () => setCallActive(false));
    vapiRef.current.on('volume-level', setVolume);
    vapiRef.current.on('message', (msg) => {
      if (msg.type === 'transcript') {
        setTranscript((prev) => [...prev, msg]);
      }
    });
    vapiRef.current.on('error', setError);

    return () => {
      vapiRef.current?.stop();
      vapiRef.current = null;
    };
  }, []);

  // Start a call with assistantId or config
  const startCall = useCallback(async (assistantId) => {
    if (!vapiRef.current) return;
    try {
      await vapiRef.current.start(assistantId);
      setError(null);
    } catch (e) {
      setError('Failed to start call');
      console.error(e);
      alert('Vapi API Error: ' + String(e));
    }
  }, []);

  // Stop the call
  const stopCall = useCallback(() => {
    vapiRef.current?.stop();
  }, []);

  // Mute/unmute mic
  const setMicMuted = useCallback((muted) => {
    vapiRef.current?.setMuted(muted);
    setIsMuted(muted);
  }, []);

  // Send a text message to the assistant
  const sendMessage = useCallback((role, content) => {
    vapiRef.current?.send({
      type: 'add-message',
      message: { role, content },
    });
  }, []);

  return {
    callActive,
    transcript,
    volume,
    error,
    isMuted,
    startCall,
    stopCall,
    setMicMuted,
    sendMessage,
  };
}
