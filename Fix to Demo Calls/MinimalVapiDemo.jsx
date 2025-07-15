import React, { useState, useRef } from 'react';
import Vapi from '@vapi-ai/web';

const MinimalVapiDemo = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState('idle');
  const vapi = useRef(new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || 'your-public-key-here'));
  const assistantId = '7512f1a1-6775-4c1f-96c7-a7fc6f50ec8e'; // Customer Service Assistant

  const startCall = async () => {
    try {
      setCallStatus('connecting');
      if (!assistantId) throw new Error('No assistantId configured.');
      console.log('MINIMAL DEMO: vapi.start payload:', assistantId);
      await vapi.current.start(assistantId);
      setIsCallActive(true);
      setCallStatus('active');
    } catch (error) {
      console.error('MINIMAL DEMO: Failed to start call:', error);
      setCallStatus('error');
      alert('Failed to start call. Check your API key and try again.');
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
      <button onClick={startCall} disabled={isCallActive || callStatus === 'connecting'} style={{ marginRight: 8 }}>
        {callStatus === 'connecting' ? 'Connecting...' : 'Start Call'}
      </button>
      <button onClick={endCall} disabled={!isCallActive}>End Call</button>
      <div style={{ marginTop: 20 }}>Status: {callStatus}</div>
    </div>
  );
};

export default MinimalVapiDemo;
