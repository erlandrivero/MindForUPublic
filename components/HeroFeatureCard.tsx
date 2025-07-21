import Image from "next/image";
import { Star } from "lucide-react";
import logo from "@/public/Logo_Small-removebg-preview.png";

const testimonial = {
  quote:
    "Before, the phone was a constant source of anxiety. Now, it's like a heavy blanket has been lifted. Our new patient acquisition is up, and I can actually think and strategize. This isn't just a tool; it's given me back my time and my sanity.",
  author: {
    name: "Sarah C.",
    role: "Office Manager, Dental Clinic",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  rating: 5,
};

export default function HeroFeatureCard() {
  return (
    <div className="relative bg-gradient-to-br from-[#eafcff] to-[#d3f7f7] rounded-3xl shadow-xl p-8 flex flex-col items-center min-h-[480px] min-w-[350px] max-w-[430px] w-full overflow-visible">
      {/* Floating Bubbles */}
      <span className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-cyan-300/60" />
      <span className="absolute -bottom-4 -left-4 w-6 h-6 rounded-full bg-cyan-300/70" />
      {/* Logo/Icon */}
      <div className="flex flex-col items-center mt-4 mb-6">
        <Image src={logo} alt="MindForU Logo" width={110} height={70} className="mb-2" />
      </div>
      {/* Testimonial Card */}
      <div className="bg-[#f4feff] rounded-2xl shadow-md px-6 py-6 flex flex-col items-center w-full max-w-[350px] mx-auto">
        {/* Stars */}
        <div className="flex gap-1 mb-2">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
          ))}
        </div>
        {/* Quote */}
        <blockquote className="italic text-base text-center text-slate-700 opacity-90 mb-4">“{testimonial.quote}”</blockquote>
        {/* Author */}
        <div className="flex items-center gap-3 mt-2">
          <Image
            src={testimonial.author.avatar}
            alt={testimonial.author.name}
            width={36}
            height={36}
            className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm"
          />
          <div className="flex flex-col items-start">
            <span className="font-bold text-primaryTeal">{testimonial.author.name}</span>
            <span className="text-sm text-cyan-700">{testimonial.author.role}</span>
          </div>
        </div>
        {/* Dots */}
        <div className="flex gap-2 mt-4 justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-primaryTeal" />
          <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
        </div>
      </div>
    </div>
  );
}
