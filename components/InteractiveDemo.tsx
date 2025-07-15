import React, { useRef, useState } from "react";
import { BrainIcon } from "lucide-react";
import Vapi from "@vapi-ai/web";




interface InteractiveDemoProps {
  open: boolean;
  onClose?: () => void;
}

const assistants = [
  {
    id: 'assistant-1',
    name: 'Support Bot',
    description: 'Handles customer support questions.',
    avatar: '🤖',
  },
  {
    id: 'assistant-2',
    name: 'Sales Bot',
    description: 'Assists with sales inquiries.',
    avatar: '💼',
  },
  {
    id: 'assistant-3',
    name: 'Scheduler',
    description: 'Books appointments and meetings.',
    avatar: '📅',
  },
  {
    id: 'assistant-4',
    name: 'FAQ Bot',
    description: 'Answers frequently asked questions.',
    avatar: '❓',
  },
];

const InteractiveDemo: React.FC<InteractiveDemoProps> = ({ open, onClose }) => {
  console.log('InteractiveDemo rendered, open:', open);
  const vapi = useRef<InstanceType<typeof Vapi> | null>(null);
  const [callActive, setCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'active' | 'ended' | 'error'>('idle');
  const [selectedAssistantId, setSelectedAssistantId] = useState<string>(assistants[0].id);

  // Initialize Vapi only once
  React.useEffect(() => {
    if (!vapi.current && typeof window !== 'undefined') {
      const apiKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
      if (apiKey) {
        vapi.current = new Vapi(apiKey);
        vapi.current.on('call-start', () => {
          setCallActive(true);
          setCallStatus('active');
        });
        vapi.current.on('call-end', () => {
          setCallActive(false);
          setCallStatus('ended');
        });
      }
    }
  }, []);

  const startCall = async () => {
    try {
      setCallStatus('connecting');
      if (!selectedAssistantId) throw new Error('No assistantId configured.');
      if (!vapi.current) throw new Error('Vapi client not initialized!');
      await vapi.current.start(selectedAssistantId);
      setCallActive(true);
      setCallStatus('active');
    } catch (error) {
      setCallStatus('error');
      alert('Failed to start call. Check your API key and try again. ' + (error?.message || ''));
    }
  };

  const endCall = () => {
    if (vapi.current) {
      vapi.current.stop();
    }
    setCallActive(false);
    setCallStatus('ended');
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      if (vapi.current) {
        vapi.current.setMicrophoneMuted(!prev);
      }
      return !prev;
    });
  };

  if (!open) return null;
  return (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30">
    <div className="relative w-full max-w-lg mx-auto rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-br from-teal-100 to-cyan-200 p-0 sm:p-0 min-h-[540px] animate-fade-in">
      {/* Interactive Demo label */}
      <div className="absolute left-1/2 top-8 -translate-x-1/2 z-10">
        <span className="block text-2xl lg:text-3xl font-bold text-center text-black drop-shadow-sm" style={{letterSpacing: '0.01em'}}>Interactive Demo</span>
      </div>
      {/* Central Brain Icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-slate-700 rounded-full flex items-center justify-center animate-pulse-slow shadow-2xl will-change-transform">
            <BrainIcon className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-white" />
          </div>
          {/* Assistant Selector */}
          <div className="mt-6 flex gap-3 sm:gap-5">
            {assistants.map(a => (
              <button
                key={a.id}
                onClick={() => setSelectedAssistantId(a.id)}
                className={`flex flex-col items-center px-3 py-2 rounded-xl border transition-all duration-200 min-w-[80px] sm:min-w-[110px] shadow-sm focus:outline-none ${selectedAssistantId === a.id ? 'bg-teal-50 border-teal-400 shadow-md scale-105 text-teal-800' : 'bg-white/60 border-gray-200 hover:border-teal-300 hover:bg-teal-50'}`}
                type="button"
              >
                <span className="text-2xl mb-1">{a.avatar}</span>
                <span className="text-base font-semibold">{a.name}</span>
                <span className="text-xs text-gray-500 mt-0.5">{a.description}</span>
                {selectedAssistantId === a.id && (
                  <span className="mt-1 text-xs text-teal-600 font-medium">Selected</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Floating Action Icons */}
      <div className="absolute top-8 right-8 animate-float">
        <div className="w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
          <svg className="w-4 h-4 text-yellow-800" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
      </div>
      <div className="absolute bottom-8 left-8 animate-float-delayed">
        <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>
      </div>
      {/* Pulsing Text Placeholders */}
      <div className="absolute top-1/4 left-6 space-y-2">
        <div className="w-24 h-2.5 bg-white/40 rounded-full animate-pulse shadow-sm" style={{ animationDelay: '0s' }}></div>
        <div className="w-20 h-2.5 bg-white/40 rounded-full animate-pulse shadow-sm" style={{ animationDelay: '0.5s' }}></div>
        <div className="w-28 h-2.5 bg-white/40 rounded-full animate-pulse shadow-sm" style={{ animationDelay: '1s' }}></div>
      </div>
      {/* Bouncing Dots */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
      {/* Call Controls Overlay */}
      <div className="absolute left-1/2 bottom-5 -translate-x-1/2 z-20 w-[90%] max-w-md">
        <div className="bg-white/90 rounded-xl shadow-lg px-6 py-4 flex flex-col items-center">
          <div className="mb-2 font-medium text-gray-800">
            Call Status: <span className="font-semibold text-teal-700">{callStatus}</span>
          </div>
          <div className="flex gap-3 mb-2 w-full justify-center">
            <button
              onClick={startCall}
              disabled={callActive || !selectedAssistantId}
              className={`px-5 py-2 rounded-lg font-semibold text-white transition-colors duration-200 ${callActive || !selectedAssistantId ? 'bg-gray-300 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600'}`}
              type="button"
            >
              Start Call
            </button>
            <button
              onClick={endCall}
              disabled={!callActive}
              className={`px-5 py-2 rounded-lg font-semibold text-white transition-colors duration-200 ${!callActive ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
              type="button"
            >
              End Call
            </button>
            <button
              onClick={toggleMute}
              disabled={!callActive}
              className={`px-5 py-2 rounded-lg font-semibold text-white transition-colors duration-200 ${!callActive ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600'}`}
              type="button"
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
          </div>
          <button
            onClick={onClose}
            className="mt-1 px-6 py-2 rounded-lg bg-teal-400 hover:bg-teal-500 text-white font-semibold transition-colors duration-200"
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
);
};

export default InteractiveDemo;
