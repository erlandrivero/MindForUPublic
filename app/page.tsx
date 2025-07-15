import { Suspense } from 'react';
import ButtonLead from "@/components/ButtonLead";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import StatsSection from '@/components/StatsSection';
import MidCtaSection from "@/components/MidCtaSection";
import FeaturesSection from '@/components/FeaturesSection';
import PricingTable from '@/components/PricingTable';
import TestimonialsSection from '@/components/TestimonialsSection';

import FaqSection from "@/components/FaqSection";
import FinalCtaSection from "@/components/FinalCtaSection";
import Footer from "@/components/Footer";
import { Metadata } from 'next';

// Add metadata for SEO
export const metadata: Metadata = {
  title: 'MindForU - Effortless Efficiency for Modern Practices',
  description: 'MindForU automates your administrative chaos, so you can focus on what matters most—growing your business and serving your clients. Experience seamless scheduling, call management, and workflow optimization—all in one intuitive platform.',
  keywords: 'MindForU, business automation, scheduling, call management, workflow, SaaS, practice management',
};

export default function Home(): JSX.Element {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Header />
      </Suspense>
      <main>
        <Hero />
        <StatsSection />
        <FeaturesSection />
        <PricingTable />
          <TestimonialsSection />
        <MidCtaSection />
        {/* Lead Capture Section */}
        <section className="w-full flex flex-col items-center justify-center py-12 bg-slate-50">
          <h2 className="font-bold text-2xl md:text-3xl mb-2 text-primaryTeal">Request a Personal Demo</h2>
          <p className="mb-6 text-base md:text-lg text-gray-700 max-w-md text-center">See how MindForU can streamline your workflow and transform your business. Fill out the form below and our team will reach out to schedule your personalized demo.</p>
          <ButtonLead />
        </section>
        <FaqSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </>
  );
}
