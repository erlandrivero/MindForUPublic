"use client";
import Link from "next/link";
import HeroVisual from "./HeroVisual";
import { CheckCircle } from "lucide-react";


const Hero = () => {
  
  return (
    <section
  className="max-w-7xl mx-auto bg-base-100 flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-20 px-8 py-8 lg:py-20 font-sans"
  
>
      {/* Left Side: Text Content */}
      <div className="flex flex-col gap-6 lg:gap-10 items-center justify-center text-center lg:text-left lg:items-start w-full lg:w-1/2">
        {/* Badge */}
        <span
  className="inline-flex items-center gap-2 px-8 py-2 rounded-full text-[1.1rem] mb-2 tracking-wide"
  style={{
    background: '#6FE7DD',
    color: '#17796d',
    fontSize: '1.1rem',
    lineHeight: 1.2,
    letterSpacing: '0.04em',
    fontWeight: 400,
    boxShadow: 'none',
  }}
>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#17796d" strokeWidth="2.2" width="22" height="22" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.4rem' }}>
    <path d="M13 2L3 14h7v8l10-12h-7z" />
  </svg>
  Transform Your Business Today
</span>
        {/* Headline with gradient on "Effortless Efficiency" */}
        <h1 className="font-extrabold text-left text-4xl lg:text-6xl tracking-tight leading-tight mb-2" style={{fontWeight: 800}}>
  Reclaim Your Day:<br />
  <span
    className="bg-clip-text text-transparent"
    style={{
      backgroundImage: 'linear-gradient(90deg, #22303b, #18C5C2)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontWeight: 800,
      minWidth: '2px',
      paddingRight: '6px',
    }}
  >
    Effortless&nbsp;Efficiency
  </span><br />
  Uninterrupted Growth
</h1>
{/* Subheadline */}
<p className="text-lg opacity-80 leading-relaxed max-w-xl">
  Say goodbye to missed calls, scheduling chaos, and endless admin. Our AI-powered assistant handles it all, so you can focus on what truly matters: your business, your clients, your life.
</p>
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center lg:justify-start">
          <Link href="#pricing" scroll={true} className="bg-[#18C5C2] text-white font-bold py-3 px-8 rounded-full hover:bg-[#1A7F6B] transition duration-300 inline-block">
          Start Your Free Trial Now
        </Link>
        </div>
        {/* Checkmark Text */}
        <div className="flex flex-col sm:flex-row gap-4 text-sm mt-2 items-center">
          <span className="flex items-center gap-2 font-medium" style={{ color: '#000' }}>
  <CheckCircle className="w-8 h-8 text-[#18C5C2]" />
  No Credit Card Required
</span>
          <span className="flex items-center gap-2 font-medium" style={{ color: '#000' }}>
  <CheckCircle className="w-8 h-8 text-[#18C5C2]" />
  14-Day Free Trial
</span>
        </div>
      </div>
      {/* Right Side: Animated Hero Visual */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center">
        <HeroVisual />
      </div>
    </section>
  );
};

export default Hero;
