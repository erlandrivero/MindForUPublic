import React from "react";
import Image from "next/image";

const BrainIcon = ({ className = "w-16 h-16" }) => (
  <Image
    src="/Icon_Small-removebg-preview.png"
    alt="Brain Icon"
    width={64}
    height={64}
    className={`${className} rounded-full`}
    priority
  />
);


export default BrainIcon;
