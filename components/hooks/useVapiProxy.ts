import { useState, useCallback } from 'react';

export interface TranscriptMessage {
  role: string;
  text: string;
  timestamp?: string;
}

export function useVapiProxy() {
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [callActive, setCallActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [callId, setCallId] = useState<string | null>(null);

  const startCall = useCallback(async (assistantId: string) => {
    console.log('[VAPI PROXY] Starting call with assistant ID:', assistantId);
    setError(null);
    
    try {
      // Use our server-side proxy instead of direct Vapi calls
      const response = await fetch('/api/vapi/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assistantId,
          // Add any additional call options here
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start call');
      }

      const callData = await response.json();
      console.log('[VAPI PROXY] Call created successfully:', callData);
      
      setCallId(callData.id);
      setCallActive(true);
      
      // Simulate transcript for demo purposes
      // In a real implementation, you'd connect to Vapi's WebSocket for live transcript
      setTimeout(() => {
        setTranscript([
          {
            role: 'assistant',
            text: 'Hello! I can hear you now. How can I help you today?',
            timestamp: new Date().toISOString()
          }
        ]);
      }, 2000);

      return callData;
      
    } catch (err) {
      console.error('[VAPI PROXY] Call start error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start call');
      setCallActive(false);
      throw err;
    }
  }, []);

  const endCall = useCallback(() => {
    console.log('[VAPI PROXY] Ending call:', callId);
    setCallActive(false);
    setCallId(null);
    setTranscript([]);
    setError(null);
  }, [callId]);

  const sendText = useCallback((text: string) => {
    console.log('[VAPI PROXY] Sending text:', text);
    // Add text message to transcript
    setTranscript(prev => [...prev, {
      role: 'user',
      text,
      timestamp: new Date().toISOString()
    }]);
  }, []);

  const toggleMute = useCallback(() => {
    console.log('[VAPI PROXY] Toggle mute called');
    // Implement mute functionality if needed
  }, []);

  return {
    transcript,
    volume: 0, // Not implemented in proxy version
    callActive,
    error,
    micMuted: false, // Not implemented in proxy version
    startCall,
    endCall,
    sendText,
    toggleMute,
  };
}
