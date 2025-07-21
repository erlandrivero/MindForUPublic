"use client";
import React, { useState, useRef, useEffect } from "react";
import Vapi from "@vapi-ai/web";

interface VapiDemoProps {
  assistantId: string | null;
  onError?: () => void;
  onCallEnd?: () => void;
}

const VapiDemo: React.FC<VapiDemoProps> = ({ assistantId, onError, onCallEnd }) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "active" | "error">("idle");
  const [callStarted, setCallStarted] = useState(false); // Track if call actually started

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vapi = useRef<any>(new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "your-public-key-here"));

  const startCall = async () => {
    try {
      console.log('Starting call...');
      setCallStatus('connecting');
      setCallStarted(false); // Reset call started flag
      if (!assistantId) throw new Error('No assistantId configured.');
      await vapi.current.start(assistantId);
      // Don't set active here - wait for call-start event
      console.log('Call start request sent successfully');
    } catch (error) {
      console.error('Failed to start call:', error);
      setCallStatus('error');
      setIsCallActive(false);
      setCallStarted(false);
      if (onError) onError();
    }
  };

  const endCall = async () => {
    console.log('Ending call manually...');
    try {
      await vapi.current.stop();
      console.log('Call stop request sent successfully');
    } catch (error) {
      console.error('Error stopping call:', error);
    }
    // Update state immediately for better UX
    setIsCallActive(false);
    setCallStatus("idle");
    // Only call onCallEnd if the call actually started
    if (callStarted && onCallEnd) {
      console.log('Calling onCallEnd callback');
      onCallEnd();
    }
    setCallStarted(false);
    console.log('Call ended, state updated');
  };

  useEffect(() => {
    const handleCallStart = () => {
      console.log('Call started successfully');
      setIsCallActive(true);
      setCallStatus('active');
      setCallStarted(true); // Mark that call actually started
    };

    const handleCallEnd = () => {
      console.log('Call ended');
      setIsCallActive(false);
      setCallStatus('idle');
      // Only call onCallEnd if the call actually started
      if (callStarted && onCallEnd) {
        onCallEnd();
      }
      setCallStarted(false);
    };

    const handleError = (error: unknown) => {
      console.error('Vapi call error:', error);
      setCallStatus('error');
      setIsCallActive(false);
      setCallStarted(false);
      if (onError) onError();
    };

    const currentVapi = vapi.current;
    currentVapi.on('call-start', handleCallStart);
    currentVapi.on('call-end', handleCallEnd);
    currentVapi.on('error', handleError);

    return () => {
      currentVapi.off('call-start', handleCallStart);
      currentVapi.off('call-end', handleCallEnd);
      currentVapi.off('error', handleError);
    };
  }, [onCallEnd, onError, callStarted]);

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-4">

      <div className="w-full rounded-2xl shadow-xl bg-white/90 p-6 flex flex-col items-center gap-6">
        <div className="text-lg font-extrabold text-gray-400 tracking-tight mb-0">Call Controls</div>
        <div className="flex gap-6 w-full justify-center">
          <button
            className="w-40 py-2 rounded-full bg-[#18C5C2] text-white font-semibold shadow hover:bg-[#1A7F6B] transition-colors"
            onClick={startCall}
            disabled={!assistantId || isCallActive || callStatus === 'connecting'}
            aria-label="Start Call"
          >
            {callStatus === 'connecting' ? 'Connecting...' : 'Start Call'}
          </button>
          <button
            className={`w-40 py-2 rounded-full font-semibold shadow transition-colors ${
              isCallActive 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={() => {
              console.log('End Call button clicked! isCallActive:', isCallActive, 'callStatus:', callStatus, 'callStarted:', callStarted);
              if (isCallActive) {
                endCall();
              } else {
                console.log('End Call button disabled - call not active');
              }
            }}
            disabled={!isCallActive}
            aria-label="End Call"
          >
            {isCallActive ? 'End Call' : 'End Call (Disabled)'}
          </button>

        </div>

      </div>
    </div>
  );
};

export default VapiDemo;
