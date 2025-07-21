"use client";
import React from "react";
import { useRouter } from "next/navigation";
import BrainIcon from "./BrainIcon";
import { Zap, Check } from "lucide-react";

const HeroVisual = () => {
  const router = useRouter();
  return (
    <div
      className="relative w-full h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-teal-100 to-cyan-200 rounded-2xl overflow-hidden shadow-xl"
      role="img"
      aria-label="AI-powered assistant visualization showing brain processing with floating indicators"
    >
      {/* Interactive Demo label just above the brain */}
      <div className="absolute left-1/2 top-[16%] -translate-x-1/2 z-10">
        <span className="block text-2xl lg:text-3xl font-bold text-center text-gray-500 drop-shadow-sm" style={{letterSpacing: '0.01em'}}>Interactive Demo</span>
      </div>
      {/* Central Brain Icon - Responsive sizing and clickable */}
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          type="button"
          aria-label="Request a personal demo - Click to see MindForU in action"
          className="relative group focus:outline-none"
          style={{ borderRadius: '9999px' }}
          onClick={() => router.push('/demo-request')}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-slate-700 rounded-full flex items-center justify-center animate-pulse-slow shadow-2xl will-change-transform group-hover:scale-105 group-focus:scale-105 transition-transform duration-200 ring-0 group-focus:ring-4 group-focus:ring-[#18C5C2]/40 cursor-pointer">
            <BrainIcon className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-white" />
          </div>
          <div className="absolute inset-0 w-full h-full bg-slate-700 rounded-full opacity-20 animate-ping pointer-events-none"></div>
        </button>
      </div>

    {/* Floating Action Icons */}
    <div className="absolute top-8 right-8 sm:top-12 sm:right-12 lg:top-16 lg:right-16 animate-float">
      <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
        <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-yellow-800" />
      </div>
    </div>
    <div className="absolute bottom-8 left-8 sm:bottom-12 sm:left-12 lg:bottom-16 lg:left-16 animate-float-delayed">
      <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-white" />
      </div>
    </div>

    {/* Pulsing Text Placeholders */}
    <div className="absolute top-1/4 left-4 sm:left-6 lg:left-8 space-y-1 sm:space-y-2">
      <div className="w-20 sm:w-28 lg:w-32 h-2 sm:h-2.5 lg:h-3 bg-white/40 rounded-full animate-pulse shadow-sm" style={{ animationDelay: '0s' }}></div>
      <div className="w-16 sm:w-20 lg:w-24 h-2 sm:h-2.5 lg:h-3 bg-white/40 rounded-full animate-pulse shadow-sm" style={{ animationDelay: '0.5s' }}></div>
      <div className="w-18 sm:w-24 lg:w-28 h-2 sm:h-2.5 lg:h-3 bg-white/40 rounded-full animate-pulse shadow-sm" style={{ animationDelay: '1s' }}></div>
    </div>

    {/* Bouncing Dots */}
    <div className="absolute bottom-12 sm:bottom-16 lg:bottom-20 left-1/2 transform -translate-x-1/2">
      <div className="flex space-x-1">
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-600 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0s' }}></div>
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-600 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-600 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>

  </div>
  );
};

export default HeroVisual;
