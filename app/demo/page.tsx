"use client";
import { useRouter } from "next/navigation";
import React from "react";
import DemoLiveChat from "../../components/DemoLiveChat";
import DemoPhoneCall from "../../components/DemoPhoneCall";
import DemoScheduling from "../../components/DemoScheduling";

import DemoBusinessDashboard from "../../components/DemoBusinessDashboard";

export default function DemoPage() {
  const [showExitModal, setShowExitModal] = React.useState(false);
  const router = useRouter();
  const steps = [
    "Welcome",
    "Live Chat",
    "Phone Call",
    "Scheduling",

    "Business Dashboard",
  ];
  const [currentStep, setCurrentStep] = React.useState(0);
  const [industry, setIndustry] = React.useState("");
  const [businessSize, setBusinessSize] = React.useState("");
  const [completedSteps, setCompletedSteps] = React.useState<boolean[]>(Array(steps.length).fill(false));

  // Analytics & feedback state
  const [feedback, setFeedback] = React.useState<(null | 'up' | 'down')[]>(Array(steps.length).fill(null));
  const [sectionTimes, setSectionTimes] = React.useState<number[]>(Array(steps.length).fill(0));
  const sectionEnterTime = React.useRef(Date.now());

  React.useEffect(() => {
    setCompletedSteps((prev) => {
      if (!prev[currentStep]) {
        const updated = [...prev];
        updated[currentStep] = true;
        return updated;
      }
      return prev;
    });
    // Track time spent in previous section
    if (currentStep > 0) {
      setSectionTimes((prev) => {
        const updated = [...prev];
        const now = Date.now();
        const last = sectionEnterTime.current;
        updated[currentStep - 1] += Math.round((now - last) / 1000);
        return updated;
      });
    }
    sectionEnterTime.current = Date.now();
  }, [currentStep]);

  // Feedback widget for demo sections
  function FeedbackWidget({ idx }: { idx: number }) {
    return (
      <div className="flex gap-2 items-center justify-center mt-6">
        <span className="text-sm font-medium text-gray-600">Was this section helpful?</span>
        <button
          className={`rounded-full p-2 border-2 ${feedback[idx] === 'up' ? 'border-[#1A7F6B] bg-[#18C5C2]/20' : 'border-gray-200 hover:bg-gray-100'}`}
          aria-label="Thumbs up"
          onClick={() => setFeedback(f => { const arr = [...f]; arr[idx] = 'up'; return arr; })}
        >👍</button>
        <button
          className={`rounded-full p-2 border-2 ${feedback[idx] === 'down' ? 'border-red-400 bg-red-100' : 'border-gray-200 hover:bg-gray-100'}`}
          aria-label="Thumbs down"
          onClick={() => setFeedback(f => { const arr = [...f]; arr[idx] = 'down'; return arr; })}
        >👎</button>
      </div>
    );
  }

  // Placeholder content for each section
  const stepContent = [
    <div className="text-center text-lg text-gray-700">
      <p className="mb-4">Welcome to the Interactive AI Assistant Demo!</p>
      <p className="mb-6">Personalize your demo experience:</p>
      <form className="flex flex-col gap-4 items-center justify-center max-w-xs mx-auto">
        <label className="w-full text-left font-medium">Industry
          <select
            className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#18C5C2] bg-white text-gray-900"
            value={industry}
            onChange={e => setIndustry(e.target.value)}
          >
            <option value="">Select Industry</option>
            <option value="Dental">Dental</option>
            <option value="Legal">Legal</option>
            <option value="Professional Services">Professional Services</option>
            <option value="Other">Other</option>
          </select>
        </label>
        <label className="w-full text-left font-medium">Business Size
          <select
            className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#18C5C2] bg-white text-gray-900"
            value={businessSize}
            onChange={e => setBusinessSize(e.target.value)}
          >
            <option value="">Select Size</option>
            <option value="Solo">Solo</option>
            <option value="2-10">2-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51+">51+ employees</option>
          </select>
        </label>
      </form>
      {(industry && businessSize) && (
        <div className="mt-4 text-sm text-[#17796d] font-semibold">Demo tailored for <span className="underline">{industry}</span>, <span className="underline">{businessSize}</span> business</div>
      )}
    </div>,
    <div className="text-center text-lg text-gray-700">
      <DemoLiveChat />
      <FeedbackWidget idx={1} />
    </div>,
    <div className="text-center text-lg text-gray-700">
      <DemoPhoneCall />
      <FeedbackWidget idx={2} />
    </div>,
    <div className="text-center text-lg text-gray-700">
      <DemoScheduling />
      <FeedbackWidget idx={3} />
    </div>,

    <div className="text-center text-lg text-gray-700">
      <DemoBusinessDashboard feedback={feedback} sectionTimes={sectionTimes} />
    </div>,
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1e293b] via-[#134e4a] to-[#065f46] p-2 sm:p-6 font-sans">
      <section className="w-full max-w-7xl bg-white rounded-2xl shadow-lg p-4 sm:p-12 relative flex flex-col min-h-[600px]">
        {/* Exit Demo Button & Modal */}
        <button
          className="fixed top-6 right-8 z-30 px-4 py-2 rounded-full bg-gradient-to-r from-[#16222A] to-[#1A7F6B] text-white font-semibold shadow hover:from-[#1A7F6B] hover:to-[#18C5C2] transition-colors shadow"
          onClick={() => setShowExitModal(true)}
          aria-label="Exit Demo"
        >
          Exit Demo
        </button>
        {showExitModal && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full flex flex-col items-center">
              <h2 className="text-xl font-bold mb-2 text-[#1A7F6B]">Exit Demo?</h2>
              <p className="mb-6 text-gray-700 text-center">Are you sure you want to exit the demo? Your progress will be lost.</p>
              <div className="flex gap-4 w-full justify-center">
                <button
                  className="px-4 py-2 rounded-full bg-gray-100 text-gray-800 font-semibold border border-gray-300 hover:bg-gray-200"
                  onClick={() => setShowExitModal(false)}
                  aria-label="Cancel Exit"
                >Cancel</button>
                <button
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-[#16222A] to-[#1A7F6B] text-white font-semibold shadow hover:from-[#1A7F6B] hover:to-[#18C5C2] transition-colors"
                  onClick={() => router.push("/")}
                  aria-label="Confirm Exit"
                >Exit Demo</button>
              </div>
            </div>
          </div>
        )}
        <h1 className="text-3xl font-extrabold mb-8 text-center tracking-tight" style={{fontFamily: 'Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif'}}>Interactive AI Assistant Demo</h1>
        {/* Stepper Navigation */}
        <nav className="flex justify-center mb-8">
          <ul className="flex gap-2 sm:gap-4">
            {steps.map((step, idx) => (
              <li key={step} className="relative">
                <button
                  className={`w-48 h-14 px-6 py-4 rounded-full text-base font-semibold flex items-center justify-center gap-2 transition-colors duration-200
                    ${currentStep === idx
                      ? 'bg-gradient-to-r from-[#16222A] to-[#1A7F6B] text-white shadow border-none hover:from-[#1A7F6B] hover:to-[#18C5C2]'
                      : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'}
                  `}
                  onClick={() => setCurrentStep(idx)}
                  aria-current={currentStep === idx ? 'step' : undefined}
                >
                  {step}
                  {completedSteps[idx] && idx !== 0 && (
                    <span className="ml-1 text-[#18C5C2]" title="Completed">✓</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="py-6 min-h-[120px] flex items-center justify-center">
          {stepContent[currentStep]}
        </div>
      </section>
    </main>
  );
}

