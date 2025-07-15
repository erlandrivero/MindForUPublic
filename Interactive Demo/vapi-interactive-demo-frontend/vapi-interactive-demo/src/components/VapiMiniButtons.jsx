import { useRef, useState } from 'react';
import Vapi from '@vapi-ai/web';
import { Button } from '@/components/ui/button.jsx';

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '';

export default function VapiMiniButtons({ assistantId }) {
  const vapiRef = useRef(null);
  const [callActive, setCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize Vapi only once
  if (!vapiRef.current && VAPI_PUBLIC_KEY) {
    vapiRef.current = new Vapi(VAPI_PUBLIC_KEY);
    vapiRef.current.on('call-start', () => setCallActive(true));
    vapiRef.current.on('call-end', () => setCallActive(false));
  }

  const startCall = async () => {
    alert('[DEBUG] Start button clicked!');
    console.log('[DEBUG] Start button clicked! assistantId:', assistantId);
    if (!assistantId) {
      alert('[DEBUG] No assistantId provided.');
      console.error('[DEBUG] No assistantId provided.');
      return;
    }
    if (!vapiRef.current) {
      alert('[DEBUG] Vapi client not initialized!');
      console.error('[DEBUG] Vapi client not initialized!');
      return;
    }
    alert('[DEBUG] About to call vapi.start with assistantId: ' + assistantId);
    try {
      await vapiRef.current.start(assistantId);
      alert('[DEBUG] Call started successfully!');
      console.log('[DEBUG] Call started successfully!');
    } catch (err) {
      alert('[DEBUG] Failed to start call: ' + err.message);
      console.error('[DEBUG] Failed to start call:', err);
    }
  };

  const endCall = () => {
    vapiRef.current?.stop();
  };

  const toggleMute = () => {
    setIsMuted((m) => {
      vapiRef.current?.setMicrophoneMuted(!m);
      return !m;
    });
  };

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <Button onClick={startCall} disabled={callActive}>Start</Button>
      <Button onClick={endCall} disabled={!callActive}>End Call</Button>
      <Button onClick={toggleMute}>{isMuted ? 'Unmute' : 'Mute'}</Button>
    </div>
  );
}
