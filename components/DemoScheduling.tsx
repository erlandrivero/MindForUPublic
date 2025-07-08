import React, { useState } from "react";

// Sample scheduling scenario
const initialSlots = [
  { time: "9:00 AM", booked: false },
  { time: "10:00 AM", booked: false },
  { time: "11:00 AM", booked: false },
  { time: "1:00 PM", booked: false },
  { time: "2:00 PM", booked: false },
  { time: "3:00 PM", booked: false },
];

const requests = [
  { id: 1, name: "Emily S.", need: "Cleaning", preferred: ["10:00 AM", "2:00 PM"] },
  { id: 2, name: "Mike R.", need: "Consultation", preferred: ["9:00 AM"] },
  { id: 3, name: "Lisa T.", need: "Emergency", preferred: ["ASAP"] },
];

type Slot = { time: string; booked: boolean };
type Request = { id: number; name: string; need: string; preferred: string[] };
type Assignment = Request & { slot: string | null };

function aiSuggest(slots: Slot[], requests: Request[]): Assignment[] {
  // Simple AI: prioritize emergencies, then preferred slots
  const booked = [...slots];
  const assignments = [];
  for (const req of requests) {
    if (req.need === "Emergency") {
      const idx = booked.findIndex(s => !s.booked);
      if (idx !== -1) {
        booked[idx].booked = true;
        assignments.push({ ...req, slot: booked[idx].time });
        continue;
      }
    }
    const prefIdx = booked.findIndex(s => !s.booked && req.preferred.includes(s.time));
    if (prefIdx !== -1) {
      booked[prefIdx].booked = true;
      assignments.push({ ...req, slot: booked[prefIdx].time });
      continue;
    }
    const anyIdx = booked.findIndex(s => !s.booked);
    if (anyIdx !== -1) {
      booked[anyIdx].booked = true;
      assignments.push({ ...req, slot: booked[anyIdx].time });
    } else {
      assignments.push({ ...req, slot: null });
    }
  }
  return assignments;
}

export default function DemoScheduling() {
  const [slots, setSlots] = useState(initialSlots.map(s => ({ ...s })));
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showAI, setShowAI] = useState(false);

  // For toggling, store initial state
  const [aiToggled, setAIToggled] = useState(false);

  const handleAssign = (reqIdx: number, slotIdx: number) => {
    if (slots[slotIdx].booked) return;
    setSlots(slots => slots.map((s, i) => i === slotIdx ? { ...s, booked: true } : s));
    setAssignments(a => [...a, { ...requests[reqIdx], slot: slots[slotIdx].time }]);
  };

  const handleAISuggest = () => {
    if (aiToggled) {
      // Reset to original state
      setSlots(initialSlots.map(s => ({ ...s })));
      setAssignments([]);
      setShowAI(false);
      setAIToggled(false);
    } else {
      setAssignments(aiSuggest(slots, requests));
      setShowAI(true);
      setAIToggled(true);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-50 rounded-xl shadow p-4 flex flex-col" style={{fontFamily: 'Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif', minWidth: 440}}>
      <div className="font-semibold text-lg text-[#1A7F6B] mb-2">Scheduling Playground</div>
      <div className="mb-4 text-sm text-gray-600">Assign each patient to a time slot. Try to optimize for emergencies and preferences, then see how the AI would do it!</div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="font-bold mb-1 text-xs text-gray-700">Requests</div>
          {requests.map((r, i) => (
            <div key={r.id} className="mb-2 p-2 bg-white rounded shadow text-xs">
              <div><span className="font-medium">{r.name}</span> ({r.need})</div>
              <div className="text-gray-500">Pref: {r.preferred.join(", ")}</div>
              <div className="flex gap-2 mt-1 overflow-x-auto flex-nowrap pb-1" style={{ maxWidth: '100%' }}>
                {slots.map((s, j) => (
                  <button
                    key={s.time}
                    className={`min-w-[90px] h-10 px-3 py-2 rounded-full text-sm font-semibold flex items-center justify-center whitespace-nowrap ${s.booked ? 'bg-gray-200 text-gray-400 border border-gray-300' : 'bg-gradient-to-r from-[#16222A] to-[#1A7F6B] text-white font-semibold shadow hover:from-[#1A7F6B] hover:to-[#18C5C2] transition-colors'}`}
                    disabled={s.booked}
                    onClick={() => handleAssign(i, j)}
                  >{s.time}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div>
          <div className="font-bold mb-1 text-xs text-gray-700">Schedule</div>
          {slots.map((s, i) => (
            <div key={s.time} className={`mb-1 p-2 rounded text-xs flex items-center justify-between ${s.booked ? 'bg-[#18C5C2]/10' : 'bg-white'} shadow`}>
              <span>{s.time}</span>
              <span className="text-xs text-gray-500">{s.booked ? 'Booked' : 'Available'}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-3">
        <button
          className="px-4 py-2 rounded-full bg-gradient-to-r from-[#16222A] to-[#1A7F6B] text-white font-semibold shadow hover:from-[#1A7F6B] hover:to-[#18C5C2] transition-colors"
          onClick={handleAISuggest}
        >{aiToggled ? 'Reset Scheduling' : 'Show AI Suggestion'}</button>
      </div>
      {showAI && (
        <div className="bg-white rounded-lg p-3 shadow-inner">
          <div className="font-bold mb-2 text-[#1A7F6B] text-sm">AI Scheduling Result</div>
          {assignments.map((a, i) => (
            <div key={a.id} className="mb-1 text-xs flex items-center gap-2">
              <span className="font-medium">{a.name}</span>
              <span>→</span>
              <span className="text-gray-700">{a.slot || 'No slot available'}</span>
              <span className="text-gray-400">({a.need})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
