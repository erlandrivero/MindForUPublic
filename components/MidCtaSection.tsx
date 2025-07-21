"use client";
import { CheckCircle, Clock } from "lucide-react";

import Link from "next/link";

const MidCtaSection = () => (
  <section className="w-full bg-gradient-to-r from-slate-700 to-primaryTeal py-16">
    <div className="max-w-4xl mx-auto px-8 text-center flex flex-col items-center gap-6">
      <h2 className="font-extrabold text-3xl lg:text-5xl text-white mb-2">Ready to Experience the Transformation?</h2>
      <p className="text-lg mb-4 max-w-xl" style={{color: '#7ce2e2'}}>
        Join thousands of businesses who have already revolutionized their operations and reclaimed their peace of mind.
      </p>
      <Link href="#pricing" scroll={true} className="bg-[#18C5C2] text-white font-bold py-3 px-8 rounded-full hover:bg-[#1A7F6B] transition duration-300 inline-block">
        Get Started Today
      </Link>
      <div className="flex flex-row gap-8 text-base text-white/90 mt-4 items-center justify-center">
        <span className="flex items-center gap-2" style={{color: '#7ce2e2'}}><CheckCircle className="w-5 h-5 text-[#7ce2e2]" />No Credit Card Required</span>
        <span className="flex items-center gap-2" style={{color: '#7ce2e2'}}><Clock className="w-5 h-5 text-[#7ce2e2]" />Cancel Anytime</span>
      </div>
    </div>
  </section>
);

export default MidCtaSection;
