import React, { useState, useRef } from "react";

// Sample phone call scenario
type TranscriptLine = {
  speaker: "customer" | "ai";
  text: string;
  decisionPoint?: boolean;
  options?: string[];
  annotation?: string;
  sentiment?: "neutral" | "positive" | "negative";
};

// Branching script with branch property
const callScript: (TranscriptLine & { branch?: number })[] = [
  { speaker: "customer", text: "Hi, I have a terrible toothache and need help right away.", sentiment: "negative" },
  { speaker: "ai", text: "I'm so sorry you're in pain. Can you describe your symptoms for me?", sentiment: "neutral" },
  { speaker: "customer", text: "It's a sharp pain, and my cheek is swelling.", sentiment: "negative" },
  { speaker: "ai", text: "Thank you for letting me know. Based on your symptoms, this may be urgent.", sentiment: "neutral" },
  { speaker: "ai", text: "Would you like to come in immediately, or do you need help scheduling?", decisionPoint: true, options: ["Offer immediate emergency slot", "Ask more questions first", "Refer to on-call dentist"], sentiment: "neutral" },
  // Branch 0: Offer immediate emergency slot
  { speaker: "customer", text: "I can come in now if you have time.", branch: 0, sentiment: "negative" },
  { speaker: "ai", text: "We have an emergency slot in 30 minutes. Please come in as soon as possible!", branch: 0, sentiment: "positive" },
  { speaker: "customer", text: "Thank you so much!", branch: 0, sentiment: "positive" },
  // Branch 1: Ask more questions first
  { speaker: "ai", text: "Can you tell me how long you've had these symptoms and if you have a fever?", branch: 1, sentiment: "neutral" },
  { speaker: "customer", text: "I've had them since last night. No fever.", branch: 1, sentiment: "neutral" },
  { speaker: "ai", text: "Thank you for clarifying. I recommend you come in today to be seen urgently.", branch: 1, sentiment: "positive" },
  { speaker: "customer", text: "Okay, I'll come in as soon as I can.", branch: 1, sentiment: "positive" },
  // Branch 2: Refer to on-call dentist
  { speaker: "ai", text: "Let me connect you with our on-call dentist. Please hold for a moment.", branch: 2, sentiment: "neutral" },
  { speaker: "customer", text: "Thank you, I appreciate it.", branch: 2, sentiment: "positive" },
];

export default function DemoPhoneCall() {
  const [currentLine, setCurrentLine] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [branch, setBranch] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Speak the current line aloud when playing, and advance only when speech ends
  React.useEffect(() => {
    if (!playing) return;
    const line = callScript[currentLine];
    if (line && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utter = new window.SpeechSynthesisUtterance(line.text);
      utter.rate = 1.05;
      utter.pitch = 1.0;
      utter.lang = 'en-US';
      // Use a female English voice for AI lines
      if (line.speaker === 'ai') {
        const voices = window.speechSynthesis.getVoices();
        // Remove gender property for compatibility
        const femaleVoice = voices.find(v => v.lang.startsWith('en') && v.name && v.name.toLowerCase().includes('female'))
          || voices.find(v => v.lang.startsWith('en') && v.name && v.name.toLowerCase().includes('woman'))
          || voices.find(v => v.lang.startsWith('en') && v.name && v.name.toLowerCase().includes('girl'))
          || voices.find(v => v.lang.startsWith('en') && v.name && v.name.toLowerCase().includes('samantha'))
          || voices.find(v => v.lang.startsWith('en') && v.name && v.name.toLowerCase().includes('zira'))
          || voices.find(v => v.lang.startsWith('en'));
        if (femaleVoice) utter.voice = femaleVoice;
      }
      utter.onend = () => {
        // Only advance if still playing and not at the end or decision point
        if (!playing) return;
        if (currentLine < callScript.length - 1 && !line.decisionPoint) {
          setCurrentLine(l => l + 1);
        } else {
          setPlaying(false);
        }
      };
      window.speechSynthesis.speak(utter);
    }
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [playing, currentLine]);

  const handlePlay = () => setPlaying(true);
  const handlePause = () => {
    setPlaying(false);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  };
  const handleOption = (opt: string) => {
    setSelectedOption(opt);
    // Determine branch index from options
    const line = callScript[currentLine];
    if (line && line.decisionPoint && line.options) {
      const branchIdx = line.options.findIndex(o => o === opt);
      setBranch(branchIdx);
      // Find the first line with the selected branch
      const nextIdx = callScript.findIndex((l, i) => i > currentLine && l.branch === branchIdx);
      if (nextIdx !== -1) {
        setTimeout(() => setCurrentLine(nextIdx), 500);
      }
    }
    setPlaying(true);
  };


  const line = callScript[currentLine];
  // Only show the main script up to the decision point, then only the selected branch
  const transcriptToShow = branch === null
    ? callScript.slice(0, callScript.findIndex(l => l.decisionPoint) + 1)
    : callScript.filter((l, idx) => !('branch' in l) || l.branch === branch);

  return (
    <div className="w-full max-w-md mx-auto bg-gray-50 rounded-xl shadow p-4 flex flex-col" style={{fontFamily: 'Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif'}}>
      <div className="flex items-center gap-3 mb-3">
        <span className="font-semibold text-base text-[#1A7F6B]">Phone Call Simulator</span>
        <span className={`ml-auto text-xl ${line.sentiment === 'positive' ? 'text-green-500' : line.sentiment === 'negative' ? 'text-red-500' : 'text-gray-400'}`}>{line.sentiment === 'positive' ? '😊' : line.sentiment === 'negative' ? '😟' : '😐'}</span>
      </div>
      <div className="bg-white rounded-lg p-2 mb-3 shadow-inner min-h-[90px] text-sm">
        {transcriptToShow.map((l, idx) => (
          <div key={idx} className={`mb-1 flex items-start ${idx === currentLine ? 'font-bold text-[#1A7F6B]' : 'text-gray-800'}`}> 
            <span className="mr-2 font-mono text-[11px] text-gray-400">{l.speaker === 'ai' ? 'AI:' : 'Caller:'}</span>
            <span>{l.text}</span>
          </div>
        ))}
      </div>
      {/* Decision point */}
      {line.decisionPoint && (
        <div className="mb-4">
          <div className="mb-2 text-sm text-gray-700">How should the AI respond?</div>
          <div className="flex flex-col gap-2">
            {line.options!.map(opt => (
              <button
                key={opt}
                className="min-w-[120px] h-14 px-6 py-4 rounded-full text-base font-semibold flex items-center justify-center bg-gradient-to-r from-[#16222A] to-[#1A7F6B] text-white shadow hover:from-[#1A7F6B] hover:to-[#18C5C2] transition-colors"
                onClick={() => handleOption(opt)}
                disabled={!!selectedOption}
              >{opt}</button>
            ))}
          </div>
        </div>
      )}
      {/* Controls */}
      <div className="flex gap-3 mt-auto">
        <button
          className="min-w-[120px] h-14 px-6 py-4 rounded-full text-base font-semibold flex items-center justify-center bg-gradient-to-r from-[#16222A] to-[#1A7F6B] text-white shadow hover:from-[#1A7F6B] hover:to-[#18C5C2] transition-colors"
          onClick={handlePlay}
          disabled={playing || currentLine >= callScript.length - 1}
        >Play</button>
        <button
          className="min-w-[120px] h-14 px-6 py-4 rounded-full text-base font-semibold flex items-center justify-center bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200"
          onClick={handlePause}
          disabled={!playing}
        >Pause</button>
        <button
          className="min-w-[120px] h-14 px-6 py-4 rounded-full text-base font-semibold flex items-center justify-center bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200"
          onClick={() => { 
            setCurrentLine(0); 
            setPlaying(false); 
            setSelectedOption(null); 
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
          }}
        >Restart</button>
      </div>
    </div>
  );
}
