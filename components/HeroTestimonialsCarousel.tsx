"use client";
import { useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";

// Testimonial data (reuse from TestimonialsSection)
const testimonials = [
  {
    quote:
      "Before, the phone was a constant source of anxiety. Now, it's like a heavy blanket has been lifted. Our new patient acquisition is up, and I can actually think and strategize. This isn't just a tool; it's given me back my time and my sanity.",
    author: {
      name: "Sarah C.",
      role: "Office Manager, Dental Clinic",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    },
    rating: 5,
  },
  {
    quote:
      "MindForU's automation has streamlined our workflow. Our staff is less stressed, and patients are happier than ever. Highly recommended!",
    author: {
      name: "James L.",
      role: "Practice Owner, Family Health",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    rating: 5,
  },
  {
    quote:
      "With MindForU, every call is answered, and scheduling is a breeze. We've seen a real difference in our daily operations.",
    author: {
      name: "Maria G.",
      role: "Receptionist, Wellness Center",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    },
    rating: 5,
  },
];

const HeroTestimonialsCarousel = () => {
  const [current, setCurrent] = useState(0);
  const testimonial = testimonials[current];

  return (
    <div className="relative bg-[#e9fcfd] rounded-3xl shadow-lg p-4 flex flex-col items-center gap-4 w-full max-w-[900px] px-0">
      {/* Star Ratings */}
      <div className="flex gap-1">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
        ))}
      </div>
      {/* Blockquote */}
      <blockquote className="italic text-base max-w-xl text-center opacity-90">“{testimonial.quote}”</blockquote>
      {/* Author Info */}
      <div className="flex items-center gap-3 mt-2">
        <Image
          src={testimonial.author.avatar}
          alt={testimonial.author.name}
          width={36}
          height={36}
          className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm"
        />
        <div className="flex flex-col items-start">
          <span className="font-bold text-secondarySlate">{testimonial.author.name}</span>
          <span className="text-sm text-gray-500">{testimonial.author.role}</span>
        </div>
      </div>
      {/* Navigation Dots (toggleable) */}
      <div className="flex gap-2 mt-4">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            aria-label={`Show testimonial ${idx + 1}`}
            className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
              idx === current ? "bg-primaryTeal" : "bg-gray-300"
            }`}
            onClick={() => setCurrent(idx)}
            style={{ outline: "none", border: "none", padding: 0, cursor: "pointer" }}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroTestimonialsCarousel;
