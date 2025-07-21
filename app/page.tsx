import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Header from "@/components/Header";
import Hero from "@/components/Hero";

// Dynamically import components that are below the fold
const StatsSection = dynamic(() => import('@/components/StatsSection'));
const MidCtaSection = dynamic(() => import('@/components/MidCtaSection'));
const FeaturesSection = dynamic(() => import('@/components/FeaturesSection'));
const PricingTable = dynamic(() => import('@/components/PricingTable'));
const TestimonialsSection = dynamic(() => import('@/components/TestimonialsSection'));
const FaqSection = dynamic(() => import('@/components/FaqSection'));
const FinalCtaSection = dynamic(() => import('@/components/FinalCtaSection'));
const Footer = dynamic(() => import('@/components/Footer'));
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
        <FaqSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </>
  );
}
