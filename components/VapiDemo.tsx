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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vapi = useRef<any>(new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "your-public-key-here"));

  const startCall = async () => {
    try {
      setCallStatus('connecting');
      if (!assistantId) throw new Error('No assistantId configured.');
      await vapi.current.start(assistantId);
      setIsCallActive(true);
      setCallStatus('active');
    } catch {
      setCallStatus('error');
      if (onError) onError();
    }
  };


  const endCall = async () => {
    try {
      await vapi.current.stop();
    } catch {}
    setIsCallActive(false);
    setCallStatus("idle");
    if (onCallEnd) onCallEnd();
  };

  useEffect(() => {
    const handleCallStart = () => {
      setIsCallActive(true);
      setCallStatus('active');
    };

    const handleCallEnd = () => {
      setIsCallActive(false);
      setCallStatus('idle');
      if (onCallEnd) onCallEnd();
    };

    const currentVapi = vapi.current;
    currentVapi.on('call-start', handleCallStart);
    currentVapi.on('call-end', handleCallEnd);

    return () => {
      currentVapi.off('call-start', handleCallStart);
      currentVapi.off('call-end', handleCallEnd);
    };
  }, [onCallEnd]);

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
            className="w-40 py-2 rounded-full bg-gray-300 text-gray-700 font-semibold shadow hover:bg-gray-400 transition-colors"
            onClick={endCall}
            disabled={!isCallActive}
            aria-label="End Call"
          >
            End Call
          </button>

        </div>

      </div>
    </div>
  );
};

export default VapiDemo;
