import React, { useState, useRef } from 'react';
import Vapi from '@vapi-ai/web';

interface MinimalVapiDemoProps {
  assistantId: string | null;
}

const MinimalVapiDemo: React.FC<MinimalVapiDemoProps> = ({ assistantId }) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vapi = useRef<any>(new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || 'your-public-key-here'));

  const startCall = async () => {
    try {
      setCallStatus('connecting');
      if (!assistantId) throw new Error('No assistantId configured.');
      await vapi.current.start(assistantId);
      setIsCallActive(true);
      setCallStatus('active');
    } catch (err) {
      setCallStatus('error');
      alert(`Failed to start call: ${err instanceof Error ? err.message : err}. Check your API key and try again.`);
    }
  };

  const endCall = async () => {
    try {
      await vapi.current.stop();
    } catch {}
    setIsCallActive(false);
    setCallStatus('idle');
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2>Minimal Vapi Web SDK Demo</h2>
      <button onClick={startCall} disabled={!assistantId || isCallActive || callStatus === 'connecting'} style={{ marginRight: 8 }}>
        {callStatus === 'connecting' ? 'Connecting...' : 'Start Call'}
      </button>
      <button onClick={endCall} disabled={!isCallActive}>End Call</button>
      <div style={{ marginTop: 20 }}>Status: {callStatus}</div>
    </div>
  );
};

export default MinimalVapiDemo;
