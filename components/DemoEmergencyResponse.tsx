import React, { useState, useEffect } from "react";

// Sample emergency scenario
const scenario = [
  {
    prompt: "A parent calls: 'My child fell and is bleeding from the mouth. What should I do?'",
    options: [
      "Tell them to come in immediately.",
      "Ask if the child is breathing and conscious.",
      "Advise them to rinse the mouth and wait.",
    ],
    correct: 1,
    aiChoice: 1,
    explanation: "AI prioritizes airway and consciousness before advising next steps.",
  },
  {
    prompt: "Parent: 'Yes, she's conscious but crying and bleeding a lot.'",
    options: [
      "Advise direct pressure and come in now.",
      "Ask about allergies.",
      "Schedule a visit for tomorrow.",
    ],
    correct: 0,
    aiChoice: 0,
    explanation: "AI gives immediate first aid and urgency.",
  },
  {
    prompt: "Parent: 'We're on our way.'",
    options: [
      "Alert the dental team for emergency prep.",
      "Tell them to call if delayed.",
      "Ask for insurance info first.",
    ],
    correct: 0,
    aiChoice: 0,
    explanation: "AI ensures the team is ready for arrival.",
  },
];

export default function DemoEmergencyResponse() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(20);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (showResult) return;
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(ti => ti - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, showResult]);

  const handleSelect = (idx: number) => {
    setSelected(idx);
    if (idx === scenario[step].correct) setScore(s => s + 1);
    setTimeout(() => {
      if (step < scenario.length - 1) {
        setStep(s => s + 1);
        setSelected(null);
      } else {
        setShowResult(true);
      }
    }, 1200);
  };

  const aiScore = scenario.filter((s, i) => s.aiChoice === s.correct).length;

  return (
    <div className="w-full max-w-md mx-auto bg-gray-50 rounded-xl shadow p-4 flex flex-col" style={{fontFamily: 'Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif'}}>
      <div className="font-semibold text-lg text-[#1A7F6B] mb-2">Emergency Response Simulator</div>
      {showResult ? (
        <div className="text-center">
          <div className="text-xl font-bold mb-2">Scenario Complete!</div>
          <div className="mb-2 text-[#1A7F6B]">Your Score: {score} / {scenario.length}</div>
          <div className="mb-2 text-gray-700">AI Score: {aiScore} / {scenario.length}</div>
          <div className="mb-4 text-sm text-gray-500">{score === scenario.length ? 'Perfect! You handled the emergency like an AI pro.' : 'Review the explanations to improve.'}</div>
          <button
            className="px-4 py-2 rounded-full bg-gradient-to-r from-[#16222A] to-[#1A7F6B] text-white font-semibold shadow hover:from-[#1A7F6B] hover:to-[#18C5C2] transition-colors"
            onClick={() => { setStep(0); setScore(0); setShowResult(false); setTimer(20); setSelected(null); }}
          >Try Again</button>
        </div>
      ) : (
        <>
          <div className="mb-2 text-sm text-gray-700">{scenario[step].prompt}</div>
          <div className="flex flex-col gap-2 mb-4">
            {scenario[step].options.map((opt, idx) => (
              <button
                key={opt}
                className={`min-w-[120px] h-14 px-6 py-4 rounded-full text-base font-semibold flex items-center justify-center ${selected === idx ? (idx === scenario[step].correct ? 'bg-gradient-to-r from-[#16222A] to-[#1A7F6B] text-white shadow hover:from-[#1A7F6B] hover:to-[#18C5C2] transition-colors' : 'bg-red-100 text-red-600 border-red-200') : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'}`}
                onClick={() => handleSelect(idx)}
                disabled={selected !== null}
              >{opt}</button>
            ))}
          </div>
          <div className="mb-2 text-xs text-gray-500">{scenario[step].explanation}</div>
          <div className="flex items-center gap-2 text-xs mb-1">
            <span className="font-semibold text-[#1A7F6B]">Time left:</span>
            <span className={`font-bold ${timer <= 5 ? 'text-red-500' : 'text-gray-800'}`}>{timer}s</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded mb-2">
            <div className={`h-2 rounded bg-gradient-to-r from-[#1A7F6B] to-[#18C5C2]`} style={{ width: `${(timer / 20) * 100}%` }} />
          </div>
        </>
      )}
    </div>
  );
}
