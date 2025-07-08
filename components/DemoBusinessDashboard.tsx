import React from "react";

export default function DemoBusinessDashboard({
  feedback,
  sectionTimes,
}: {
  feedback: (null | 'up' | 'down')[];
  sectionTimes: number[];
}) {
  // Example metrics (could be calculated from demo state)
  const metrics = [
    { label: "Avg. Response Time", before: 60, after: 12, unit: "sec" },
    { label: "Customer Satisfaction", before: "3.2", after: "4.8", unit: "/5" },
    { label: "Schedule Efficiency", before: "72", after: "95", unit: "%" },
    { label: "Emergency Resolution", before: "67", after: "100", unit: "%" },
  ];
  // ROI calculation (example)
  const roi = 32000; // $ per year
  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-50 rounded-xl shadow p-4 flex flex-col" style={{fontFamily: 'Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif', minWidth: 440}}>
      <div className="font-semibold text-lg text-[#1A7F6B] mb-2">Business Intelligence Dashboard</div>
      <div className="mb-2 text-sm text-gray-700">See the impact of AI on your business based on this demo experience.</div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white rounded shadow p-3 flex flex-col items-center">
            <div className="font-bold text-xs text-gray-500 mb-1">{m.label}</div>
            <div className="flex items-end gap-1">
              <span className="text-lg font-extrabold text-gray-400 line-through">{m.before}</span>
              <span className="text-xs text-gray-300">{m.unit}</span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-extrabold text-[#1A7F6B]">{m.after}</span>
              <span className="text-xs text-gray-500">{m.unit}</span>
            </div>
            <div className="text-[10px] text-gray-400">Before → After</div>
          </div>
        ))}
      </div>
      <div className="mb-4 bg-white rounded shadow p-3 flex flex-col items-center">
        <div className="font-bold text-xs text-gray-500 mb-1">Estimated ROI</div>
        <div className="text-3xl font-extrabold text-[#18C5C2]">${roi.toLocaleString()}</div>
        <div className="text-xs text-gray-400">Annual savings with AI assistant</div>
      </div>
      <div className="mb-2 font-semibold text-[#1A7F6B]">Your Demo Feedback</div>
      <ul className="text-xs mb-4">
        {[
          "Live Chat", "Phone Call", "Scheduling"
        ].map((section, idx) => (
          <li key={section} className="flex items-center gap-2 mb-1">
            <span>{section}:</span>
            {feedback[idx+1] === 'up' && <span className="ml-1 text-[#1A7F6B]">👍</span>}
            {feedback[idx+1] === 'down' && <span className="ml-1 text-red-500">👎</span>}
            {feedback[idx+1] == null && <span className="ml-1 text-gray-400">No feedback</span>}
          </li>
        ))}
      </ul>
      <div className="text-xs text-gray-500 text-center">* Metrics are illustrative. Actual impact may vary based on your business and AI usage.</div>
    </div>
  );
}
