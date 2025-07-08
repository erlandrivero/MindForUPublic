import { Suspense, ReactNode } from 'react';
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import StatsSection from "@/components/StatsSection";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import MidCtaSection from "@/components/MidCtaSection";
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
          <TestimonialsSection />
        <MidCtaSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </>
  );
}
