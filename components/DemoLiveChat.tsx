import React, { useRef, useState } from "react";

// Sample customer threads
const customerThreads = [
  {
    id: 'olivia',
    name: 'Olivia B.',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    history: 'Longtime patient, prefers mornings, last appointment 3 months ago.',
    initialMessages: [
      { sender: 'customer', text: 'Hi, I need to reschedule my appointment.' },
      { sender: 'customer', text: 'Do you have any openings this week?' },
      { sender: 'ai', text: 'Hello Olivia! I can help with that. May I have your preferred days?' },
      { sender: 'customer', text: 'Monday would be best.' },
      { sender: 'ai', text: 'Thank you! Could you please confirm the date and provider of your previous appointment? This will help me locate your booking and reschedule it for you.' },
    ],
  },
  {
    id: 'marcus',
    name: 'Marcus L.',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    history: 'New patient, insurance pending, prefers late afternoons.',
    initialMessages: [
      { sender: 'customer', text: 'How much does a cleaning cost?' },
      { sender: 'ai', text: 'Hi Marcus! A standard cleaning is $95. Would you like to schedule one?' },
    ],
  },
  {
    id: 'sophia',
    name: 'Sophia T.',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    history: 'Recent emergency, anxious about pain, prefers text over calls.',
    initialMessages: [
      { sender: 'customer', text: 'It hurts a lot, can you help me now?' },
      { sender: 'ai', text: 'Hi Sophia, I’m here to help. Can you describe your pain?' },
      { sender: 'customer', text: 'It is a sharp pain and it is getting worse.' },
      { sender: 'ai', text: 'I’m really sorry to hear that you’re in pain. Based on what you’ve described, I recommend seeing our dentist as soon as possible. Would you like me to book you the next available appointment at our office?' },
    ],
  },
];

function getInitialThreadState() {
  return customerThreads.map(thread => ({
    messages: [...thread.initialMessages],
    satisfaction: 3, // 1-5 scale
  }));
}

export default function DemoLiveChat() {
  const [activeThread, setActiveThread] = useState(0);
  const [threads, setThreads] = useState(getInitialThreadState());
  const [bookingStatus, setBookingStatus] = useState<{ [key: number]: boolean }>({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threads, activeThread]);

  // Simulate AI suggestion after user types
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!loading && e.target.value.trim()) {
      setAiSuggestion(`AI Suggestion: "${e.target.value.trim()}" (polished response)`);
    } else {
      setAiSuggestion(null);
    }
  };

  // Approve AI suggestion and send
  const handleApprove = () => {
    if (!aiSuggestion) return;
    sendMessage(aiSuggestion.replace(/^AI Suggestion: "/, '').replace(/" \(polished response\)$/, ''));
    setAiSuggestion(null);
  };

  // Send message (user or AI)
  const sendMessage = async (text: string, sender: 'user' | 'ai' = 'user') => {
    setThreads(ts => ts.map((t, idx) => idx === activeThread ? {
      ...t,
      messages: [...t.messages, { sender, text }],
      satisfaction: sender === 'ai' ? Math.min(5, t.satisfaction + 1) : t.satisfaction
    } : t));
    setInput("");
    setLoading(sender === 'user');
    if (sender === 'user') {
      // Gather conversation history for this thread
      const thread = threads[activeThread];
      const messages = thread.messages
        .concat({ sender: 'user', text })
        .filter(m => typeof m.text === 'string' && m.text.trim() !== '')
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }));
      try {
        const res = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages }),
        });
        const data = await res.json();
        setThreads(ts => ts.map((t, idx) => idx === activeThread ? {
          ...t,
          messages: [...t.messages, { sender: 'ai', text: data.ai }],
          satisfaction: Math.min(5, t.satisfaction + 1)
        } : t));
      } catch (err) {
        setThreads(ts => ts.map((t, idx) => idx === activeThread ? {
          ...t,
          messages: [...t.messages, { sender: 'ai', text: 'Sorry, I could not reach the AI service.' }],
          satisfaction: t.satisfaction,
        } : t));
      }
      setLoading(false);
    }
  };

  // Send user message (with or without AI suggestion)
  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    if (aiSuggestion) {
      handleApprove();
    } else {
      sendMessage(input.trim(), 'user');
    }
  };

  const current = threads[activeThread];
  const customer = customerThreads[activeThread];

  return (
    <div className="w-full max-w-[1200px] mx-auto bg-gray-50 rounded-xl shadow p-4 flex flex-col" style={{fontFamily: 'Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif'}}>
      {/* Customer thread selector */}
      <div className="flex gap-2 mb-2">
        {customerThreads.map((c, idx) => (
          <button
            key={c.id}
            className={`w-32 h-14 flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-[#18C5C2] ${activeThread === idx ? 'bg-gradient-to-r from-[#1A7F6B] to-[#18C5C2] text-white border-transparent' : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-100'}`}
            onClick={() => setActiveThread(idx)}
            aria-label={`Switch to chat with ${c.name}`}
          >
            <span className="w-6 h-6 rounded-full bg-gray-200 inline-block overflow-hidden">
              <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
            </span>
            <span className="whitespace-nowrap">{c.name}</span>
          </button>
        ))}
        <button
          className="w-32 h-14 flex items-center justify-center px-6 py-4 rounded-full text-base font-semibold bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200"
          onClick={() => setShowInfo(true)}
          aria-label="Show customer info"
        >Info</button>
      </div>
      {/* Satisfaction meter */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-500">Satisfaction:</span>
        <div className="flex gap-1">
          {[1,2,3,4,5].map(i => (
            <span key={i} className={`w-4 h-4 rounded-full ${i <= current.satisfaction ? 'bg-[#1A7F6B]' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>
      {/* Chat window */}
      <div className="flex-1 overflow-y-auto mb-4 max-h-64">
        {current.messages.map((msg, i) => (
          <div key={i} className={`flex mb-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`px-4 py-2 rounded-2xl text-sm max-w-[75%] shadow
                ${msg.sender === "user" ? "bg-gradient-to-r from-[#1A7F6B] to-[#18C5C2] text-white" : msg.sender === "ai" ? "bg-gray-200 text-gray-800" : "bg-blue-100 text-blue-900"}
              `}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start mb-2">
            <div className="px-4 py-2 rounded-2xl text-sm bg-gray-200 text-gray-800 max-w-[75%] shadow animate-pulse">
              AI is typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* AI suggestion bar */}
      {aiSuggestion && (
        <div className="flex items-center gap-2 mb-2 bg-[#18C5C2]/10 rounded p-2">
          <span className="text-sm text-[#1A7F6B] font-medium">{aiSuggestion}</span>
          <button
            className={`w-60 h-14 px-6 py-4 rounded-full text-base font-semibold flex items-center justify-center whitespace-nowrap bg-gradient-to-r from-[#16222A] to-[#1A7F6B] text-white shadow hover:from-[#1A7F6B] hover:to-[#18C5C2] transition-colors`}
            onClick={handleApprove}
            aria-label="Approve AI suggestion"
          >Approve & Send</button>
        </div>
      )}
      {/* Input bar */}
      <form className="flex gap-2 mt-auto" onSubmit={handleSend}>
        <input
          type="text"
          className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#18C5C2] text-gray-900 bg-white"
          placeholder="Type your message..."
          value={input}
          onChange={handleInput}
          disabled={loading}
          aria-label="Type your message"
        />
        <button
          type="submit"
          className={`w-60 h-14 px-6 py-4 rounded-full text-base font-semibold flex items-center justify-center whitespace-nowrap bg-gradient-to-r from-[#16222A] to-[#1A7F6B] text-white shadow hover:from-[#1A7F6B] hover:to-[#18C5C2] transition-colors`}
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </form>
      {/* Customer info popup */}
      {showInfo && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow p-4 flex flex-col w-full max-w-6xl mx-auto mb-6">
            <img src={customer.avatar} alt={customer.name} className="w-16 h-16 rounded-full mb-2" />
            <div className="font-bold text-lg mb-1">{customer.name}</div>
            <div className="text-xs text-gray-500 mb-3">{customer.history}</div>
            <button
              className="min-w-[120px] h-14 px-6 py-4 rounded-full text-base font-semibold flex items-center justify-center bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200"
              onClick={() => setShowInfo(false)}
              aria-label="Close customer info"
            >Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
