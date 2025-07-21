import Image from "next/image";

/**
 * HeroIllustration - matches the right side of the sample website's hero section.
 * Uses a placeholder illustration. Replace the src with your own asset for a perfect match.
 */
const HeroIllustration = () => {
  return (
    <div className="relative w-full h-[420px] flex items-center justify-center rounded-3xl bg-gradient-to-br from-[#e6f8fa] to-[#d0f5ee] shadow-xl overflow-hidden">
      {/* Floating bubbles */}
      <div className="absolute top-6 right-6 w-8 h-8 bg-cyan-200 rounded-full opacity-80 z-10" />
      <div className="absolute bottom-8 left-8 w-6 h-6 bg-cyan-100 rounded-full opacity-70 z-10" />
      <div className="absolute top-1/2 left-4 w-4 h-4 bg-teal-100 rounded-full opacity-60 z-10" />
      {/* Illustration - replace with your own asset for exact match */}
      <Image
        src="/logoAndName.png" // Use your mascot/AI assistant illustration here
        alt="AI Assistant Illustration"
        width={340}
        height={340}
        priority={true}
        className="object-contain drop-shadow-xl z-20"
      />
      {/* Decorative sparkles or extra bubbles can be added here for more detail */}
    </div>
  );
};

export default HeroIllustration;
