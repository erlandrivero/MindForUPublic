'use client';
import { useState } from "react";
import Image from "next/image";
import { Star, Users } from "lucide-react";
import VideoPlayer from "./VideoPlayer";
import sarahHeadshot from "@/public/videos/sarah_c_headshot.png";
import davidHeadshot from "@/public/videos/david_m_headshot.png";
import emilyHeadshot from "@/public/videos/emily_r_headshot.png";

const testimonials = [
  {
    id: "sarah",
    quote: "Before, the phone was a constant source of anxiety. Now, it's like a heavy blanket has been lifted. Our new patient acquisition is up, and I can actually think and strategize. This isn't just a tool; it's given me back my time and my sanity.",
    author: {
      name: "Sarah C.",
      role: "Office Manager, Dental Clinic"
    },
    rating: 5,
    headshot: sarahHeadshot,
    beforeVideo: "/videos/sarah_c_before.mp4",
    afterVideo: "/videos/sarah_c_during.mp4"
  },
  {
    id: "david",
    quote: "Growth was becoming a bottleneck. MindForU let us scale without the chaos. I finally have time to focus on my patients, not just paperwork.",
    author: {
      name: "David M.",
      role: "Small Business Owner, Chiropractic Clinic"
    },
    rating: 5,
    headshot: davidHeadshot,
    beforeVideo: "/videos/david_m_before.mp4",
    afterVideo: "/videos/david_m_during.mp4"
  },
  {
    id: "emily",
    quote: "I'm naturally skeptical of new tools, but MindForU won me over. The onboarding was smooth, and our team adapted instantly. Our clients noticed the difference!",
    author: {
      name: "Emily R.",
      role: "Marketing Manager, E-commerce Company"
    },
    rating: 5,
    headshot: emilyHeadshot,
    beforeVideo: "/videos/emily_r_before.mp4",
    afterVideo: "/videos/emily_r_during.mp4"
  }
];

const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);
  const testimonial = testimonials[current];

  return (
    <section id="testimonials" className="w-full bg-white py-16">
      <div className="max-w-4xl mx-auto px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <span className="inline-flex items-center gap-2 px-8 py-2 rounded-full font-sans mb-2 tracking-wide" style={{background: '#6FE7DD', color: '#17796d', fontFamily: `'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`, fontSize: '1.1rem', lineHeight: 1.2, letterSpacing: '0.04em', fontWeight: 400, boxShadow: 'none'}}>
  <Users className="w-6 h-6" style={{color: '#17796d', marginRight: '0.5rem'}} />
  Customer Stories
</span>
          <h2 className="font-extrabold text-3xl lg:text-5xl mb-4 text-black">Don&apos;t Just Take Our Word For It</h2>
          <p className="max-w-2xl text-lg opacity-80">Hear from real users who have streamlined their business and improved patient satisfaction with MindForU.</p>
        </div>
        {/* Testimonial Card */}
        <div className="relative bg-[#e9fcfd] rounded-3xl shadow-lg p-10 flex flex-col items-center gap-6">
          {/* Video Player */}
          <VideoPlayer key={current} beforeVideo={testimonial.beforeVideo} afterVideo={testimonial.afterVideo} />
          <div className="flex gap-1">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="w-6 h-6 text-amber-400 fill-amber-400" />
            ))}
          </div>
          {/* Blockquote */}
          <blockquote className="italic text-lg max-w-2xl text-center opacity-90">“{testimonial.quote}”</blockquote>
          {/* Author Info */}
          <div className="flex items-center gap-3 mt-2">
            <Image
              src={testimonial.headshot}
              alt={testimonial.author.name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
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
                className={`w-4 h-4 rounded-full transition-colors duration-200 ${
                  idx === current ? "bg-primaryTeal" : "bg-gray-300"
                } hover:scale-110`}
                onClick={() => setCurrent(idx)}
                style={{ outline: "none", border: "none", padding: "8px", cursor: "pointer", minWidth: "44px", minHeight: "44px" }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
