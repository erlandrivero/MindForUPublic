import React from "react";
import Image from "next/image";

const BrainIcon = ({ className = "w-full h-full max-w-[480px] max-h-[480px] mx-auto my-0", bare = false }) => (
  <div className={`relative ${className} animate-brain-grow-shrink flex items-center justify-center`}>
    {!bare && (
      <div className="absolute inset-0 rounded-full bg-white border-8 border-white z-0" />
    )}
    <Image
      src="/Icon_Small-removebg-preview.png"
      alt="Brain Icon"
      fill
      style={{ objectFit: "contain" }}
      className="z-10"
      priority
    />
  </div>
);


export default BrainIcon;
