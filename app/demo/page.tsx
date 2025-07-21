"use client";
import React, { useState } from "react";
import Image from "next/image";
import VapiDemo from "@/components/VapiDemo";
import { SCENARIO_ASSISTANT_MAP } from "@/components/scenarioMap";

const SCENARIOS = [
  {
    key: "scheduling",
    label: "Appointment Scheduling",
    description: [
      'Calendar Integration',
      'Availability Checking',
      'Provide Confirmation Emails',
    ],
  },
  {
    key: "ecommerce",
    label: "E-Commerce Assistant",
    description: [
      'Order Tracking',
      'Product Recommendations',
      'Return Processing',
    ],
  },
  {
    key: "sales-qualification",
    label: "Sales Lead Qualifications",
    description: [
      'Lead Scoring & BANT Qualification',
      <span key="appointment-scheduling" style={{ color: '#18C5C2' }}>Appointment Scheduling</span>,
      'Objection Handling',
    ],
  },
  {
    key: "customer-service",
    label: "Customer Service Assistant",
    description: [
      'Natural Language Understanding',
      'Context Retention',
      'Multi-turn Conversations',
    ],
  }
];

import { useRouter } from "next/navigation";

export default function DemoPage() {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [loadingScenario, setLoadingScenario] = useState<string | null>(null);
  const router = useRouter();

  // Toast notification state
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#eafcff] to-[#d3f7f7] py-6 px-2 sm:px-4">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg font-semibold text-white transition-all duration-300
            ${toast.type === 'success' ? 'bg-[#18C5C2]' : 'bg-red-500'}`}
          role="alert"
        >
          {toast.message}
        </div>
      )}
      <div className="w-full max-w-5xl rounded-3xl shadow-xl bg-white/90 p-2 sm:p-3 flex flex-col gap-4 sm:gap-6 relative">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-[#18C5C2] text-3xl font-bold z-10"
          onClick={() => router.push("/")}
          aria-label="Close and return to main page"
        >
          &times;
        </button>
        <div className="relative mb-1 mt-0 h-14">
          <Image src="/Icon_Small-removebg-preview.png" alt="MindForU Logo" width={56} height={56} className="w-14 h-auto absolute left-8 top-1/2 -translate-y-1/2" />
          <h1 className="text-3xl font-extrabold text-[#18C5C2] m-0 p-0 text-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full">Interactive AI Assistant Demo</h1>
        </div>
        <p className="text-center text-gray-700 mb-0">
          Choose a scenario and explore how MindForU&apos;s AI assistants can transform your business.
        </p>
        {/* Scenario Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-2 mb-4">
          {SCENARIOS.map((scenario) => (
            <div
              key={scenario.key}
              className={`peer flex flex-col h-[230px] sm:h-[270px] p-2 sm:p-4 pb-8 rounded-2xl shadow-xl border transition-transform duration-200 hover:scale-110 hover:shadow-3xl focus-within:scale-110 focus-within:shadow-3xl cursor-pointer relative focus:outline-none z-0 focus-visible:ring-4 focus-visible:ring-[#18C5C2] ${activeScenario === scenario.key ? 'border-4 border-[#18C5C2] bg-[#eafcff]/80 ring-4 ring-[#18C5C2]' : 'border-[#18C5C2]/10 bg-white/80 ring-0 hover:ring-4 focus-within:ring-4 ring-[#18C5C2] border-[#18C5C2]'}
`}
              onMouseEnter={e => e.currentTarget.style.zIndex = '30'}
              onMouseLeave={e => e.currentTarget.style.zIndex = '0'}
              onFocus={e => e.currentTarget.style.zIndex = '30'}
              onBlur={e => e.currentTarget.style.zIndex = '0'}
              tabIndex={0}
              role="button"
              aria-label={`Demo: ${scenario.label}`}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setLoadingScenario(scenario.key);
                  setTimeout(() => {
                    setActiveScenario(scenario.key);
                    setLoadingScenario(null);
                  }, 900);
                }
              }}
            >
              <div className="flex-1 flex flex-col">
                <div className="flex items-center mb-1">
                  {scenario.key === "customer-service" && (
                    <Image src="/customer-service.svg" alt="Headset Icon" width={32} height={32} className="w-8 h-8 mr-4" />
                  )}
                  {scenario.key === "sales-qualification" && (
                    <Image src="/sales-qualification.svg" alt="Lightning Icon" width={32} height={32} className="w-8 h-8 mr-4" />
                  )}
                  {scenario.key === "ecommerce" && (
                    <Image src="/ecommerce.svg" alt="Cart Icon" width={32} height={32} className="w-8 h-8 mr-4" />
                  )}
                  {scenario.key === "scheduling" && (
                    <Image src="/scheduling.svg" alt="Calendar Icon" width={32} height={32} className="w-8 h-8 mr-4" />
                  )}
                  <span className="text-xl font-bold text-[#18C5C2]">{scenario.label}</span>
                </div>
                <div className="text-gray-600 text-sm mb-1">
                  {scenario.key === "customer-service" && "Experience intelligent customer support with natural conversation flow and perfect context retention"}
                  {scenario.key === "sales-qualification" && "See how AI qualifies prospects and schedules appointments with 300% higher conversion rates"}
                  {scenario.key === "ecommerce" && "Handle customer inquiries, process returns, and provide personalized recommendations instantly"}
                  {scenario.key === "scheduling" && "Automate booking with smart calendar integration and 40% reduction in no-shows"}
                </div>
                <div className="text-xs font-semibold text-[#18C5C2] mb-4">
                  {scenario.key === "customer-service" && "Avg. response time: 2s · 95% CSAT"}
                  {scenario.key === "sales-qualification" && "3x more qualified leads · 50% faster follow-up"}
                  {scenario.key === "ecommerce" && "Instant support · 30% fewer returns"}
                  {scenario.key === "scheduling" && "40% reduction in no-shows · 2 min setup"}
                </div>
                {scenario.key === "sales-qualification" ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-[#18C5C2] text-white rounded-full px-4 py-1.5 text-sm">Appointment Scheduling</span>
                      <span className="bg-[#18C5C2]/80 text-white rounded-full px-4 py-1.5 text-sm">Objection Handling</span>
                    </div>
                    <div>
                      <span className="bg-[#18C5C2]/80 text-white rounded-full px-4 py-1.5 text-sm">Lead Scoring &amp; BANT Qualification</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {scenario.description.map((point: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-[#18C5C2]/80 text-white rounded-full px-4 py-1.5 text-sm"
                      >
                        {point}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-auto pt-2">
              <button
                className="mt-auto mx-auto px-5 py-2 rounded-full font-semibold text-base border-2 border-[#18C5C2] text-[#18C5C2] bg-white hover:bg-[#eafcff] transition-colors flex items-center justify-center gap-2"
                onClick={async () => {
                  setLoadingScenario(scenario.key);
                  setTimeout(() => {
                    setActiveScenario(scenario.key);
                    setLoadingScenario(null);
                  }, 900); // Simulate loading, replace with real async if needed
                }}
                disabled={!!loadingScenario}
              >
                {loadingScenario === scenario.key ? (
                  <>
                    <span className="inline-block w-5 h-5 border-2 border-[#18C5C2] border-t-transparent rounded-full animate-spin"></span>
                    Loading...
                  </>
                ) : (
                  'Start Demo'
                )}
              </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for Mini Page */}
        {activeScenario && (
          <div className="fixed inset-0 bg-black/40 z-30 flex items-center justify-center">
            <div
              className="bg-white rounded-2xl shadow-2xl p-3 sm:p-8 w-full max-w-xs sm:max-w-md relative flex flex-col items-center"
              role="dialog"
              aria-modal="true"
              aria-label={SCENARIOS.find(s => s.key === activeScenario)?.label || 'Demo modal'}
            >
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-[#1A7F6B] text-2xl font-bold focus:outline-none focus-visible:ring-4 focus-visible:ring-[#18C5C2]"
                onClick={() => setActiveScenario(null)}
                aria-label="Close"
              >
                &times;
              </button>

              <div className="text-2xl font-bold mb-4" style={{ color: '#18C5C2' }}>
                {SCENARIOS.find(s => s.key === activeScenario)?.label}
              </div>
              <VapiDemo
                assistantId={SCENARIO_ASSISTANT_MAP[activeScenario]}
                onError={() => showToast('error', 'Failed to connect. Please check your network or API key.')}
                onCallEnd={() => showToast('success', 'Call ended successfully.')}
              />
            </div>
          </div>
        )}


      </div>
    </main>
  );
}
