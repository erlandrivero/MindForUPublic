"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ButtonLead from '@/components/ButtonLead';

// This page serves as an intermediate step between the main page and the Interactive Demo
// It contains the "Request a Personal Demo" section that was moved from the main page
export default function DemoRequestPage(): JSX.Element {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#eafcff] to-[#d3f7f7] py-6 px-2 sm:px-4">
      <div className="w-full max-w-2xl rounded-3xl shadow-xl bg-white/90 p-6 sm:p-8 flex flex-col gap-4 relative">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-[#18C5C2] text-3xl font-bold z-10"
          onClick={() => router.push("/")}
          aria-label="Close and return to main page"
        >
          &times;
        </button>

        {/* Header Section */}
        <div className="relative mb-0 mt-2 h-14">
          <Image 
            src="/Icon_Small-removebg-preview.png" 
            alt="MindForU Logo" 
            width={56} 
            height={56} 
            className="w-14 h-auto absolute left-8 top-1/2 -translate-y-1/2" 
          />
          <h1 className="text-3xl font-extrabold text-[#18C5C2] m-0 p-0 text-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
            Request a Personal Demo
          </h1>
        </div>

        {/* Demo Request Content */}
        <div className="w-full flex flex-col items-center justify-center py-0">
          <h2 className="font-bold text-2xl md:text-3xl mb-6 text-[#18C5C2] text-center -mt-4">
            See MindForU in Action
          </h2>
          <p className="mb-8 text-base md:text-lg text-gray-700 max-w-2xl text-center leading-relaxed">
            See how MindForU can streamline your workflow and transform your business. 
            Fill out the form below and our team will reach out to schedule your personalized demo.
          </p>
          
          {/* Lead Capture Form - Centered */}
          <div className="w-full flex justify-center items-center">
            <div className="flex justify-center">
              <ButtonLead extraStyle="max-w-none mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
