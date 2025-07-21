import { useEffect, useRef, useState } from 'react';
// Import the Vapi Web SDK as you did in your Vite project
import Vapi from '@vapi-ai/web';

export interface TranscriptMessage {
  role: string;
  text: string;
  timestamp?: string;
}

export function useVapiClient() {
  const [client, setClient] = useState<InstanceType<typeof Vapi> | null>(null);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [volume, setVolume] = useState<number>(0);
  const [callActive, setCallActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [micMuted, setMicMuted] = useState(false);
  const transcriptRef = useRef<TranscriptMessage[]>([]);

  useEffect(() => {
    console.log('[DEBUG] Vapi public key:', process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);
    const vapi = new Vapi({ publicApiKey: process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY });
    setClient(vapi);
    if (!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY) {
      console.error('[DEBUG] Vapi public key is missing!');
      alert('Vapi public key is missing!');
    }
    // Log available methods for debugging
    if (typeof window !== 'undefined') {
      // @ts-expect-error Vapi client is not directly exposed
      window.vapiClient = vapi;
      console.log('Vapi client instance:', vapi);
      console.log('Vapi client prototype:', Object.getPrototypeOf(vapi));
      console.log('Vapi client keys:', Object.keys(vapi));
    }

    vapi.on('call-started', () => setCallActive(true));
    vapi.on('call-ended', () => setCallActive(false));
    vapi.on('transcript', (arg: unknown) => {
      const msg = arg as { speaker: string; transcript: string; timestamp: string };
      transcriptRef.current = [
        ...transcriptRef.current,
        { role: msg.speaker, text: msg.transcript, timestamp: msg.timestamp }
      ];
      setTranscript([...transcriptRef.current]);
    });
    vapi.on('volume', (vol: number) => setVolume(vol));
    vapi.on('error', (event: unknown) => setError(String(event)));

    return () => {
      vapi.removeAllListeners();
    };
  }, []);

  const startCall = async (assistantId: string) => {
    console.log('[DEBUG] startCall called. client:', client, 'assistantId:', assistantId);
    if (!client) {
      console.error('[DEBUG] Vapi client not initialized yet!');
    }
    if (!client) {
      console.error("Vapi client not initialized yet!");
      alert("Vapi client is still initializing. Please wait a moment and try again.");
      return;
    }
    try {
      await client.start(assistantId);
      setError(null);
    } catch (e) {
      setError('Failed to start call');
      console.error(e);
      alert('Vapi API Error: ' + String(e));
    }
  };


  const endCall = () => {
    if (!client) return;
    client.endCall();
  };

  const sendText = (text: string) => {
    if (!client) return;
    client.sendText(text);
  };

  const toggleMute = () => {
    if (!client) return;
    setMicMuted((m) => {
      client.setMicMuted(!m);
      return !m;
    });
  };

  return {
    transcript,
    volume,
    callActive,
    error,
    micMuted,
    startCall,
    endCall,
    sendText,
    toggleMute,
  };
}
