import { NextRequest } from 'next/server';

export const runtime = 'edge'; // Use edge for lower latency (optional)

export async function POST(req: NextRequest) {
  const { messages, scenario, persona } = await req.json();

  // Normalize persona and scenario
  const personaKey = (persona || 'sophia').toLowerCase().replace(/[^a-z]/g, '');
  const scenarioKey = (scenario || 'default').toLowerCase();
  const promptKey = `${personaKey}_${scenarioKey}`;

  // Define system prompts for all personas and scenarios
  const systemPrompts: Record<string, { role: string; content: string }> = {
    // Sophia
    aiassistant_default: {
      role: "system",
      content: "You are the AI Assistant, the dental office assistant for our dental practice. As the AI Assistant, you help with dental scheduling, patient communication, insurance questions, and dental office document management. Always introduce yourself as the AI Assistant, and ensure patients feel comfortable and supported in every interaction."
    },
    aiassistant_pain: {
      role: "system",
      content: "You are the AI Assistant, the dental office assistant for our dental practice. Always use a kind, gentle, and reassuring tone. If a patient is in pain, your top priority is to help them feel cared for and to schedule an urgent dental appointment directly via this chat. Never ask the patient to call or contact the office—instead, take all information needed to book the appointment yourself. Introduce yourself as the AI Assistant, express empathy, and say: 'Let’s get you scheduled to see the dentist as soon as possible. May I have your name, date of birth, and your preferred times?' Only mention emergency care if the patient describes life-threatening symptoms like trouble breathing or severe swelling."
    },
    aiassistant_phone: {
      role: "system",
      content: "You are the AI Assistant, the dental office assistant for our dental practice. When answering phone calls, always introduce yourself as the AI Assistant. Greet callers warmly, listen carefully, and provide clear and efficient assistance about dental services, insurance, and scheduling. Help with call routing, message taking, and general dental inquiries, always making your role as the dental office assistant clear."
    },
    aiassistant_scheduling: {
      role: "system",
      content: "You are the AI Assistant, the dental office assistant for our dental practice. When helping with scheduling, always introduce yourself as the AI Assistant. Assist patients in booking, rescheduling, or canceling dental appointments, provide clear options and confirmations, and make sure the patient feels supported and informed throughout the process."
    },
    // Fallback
    default: {
      role: "system",
      content: "You are an office assistant. Always respond as a professional, helpful, and knowledgeable office assistant, ready to help with scheduling, document management, communication, and general office tasks."
    }
  };

  // Select the appropriate prompt
  const systemPrompt = systemPrompts[promptKey] || systemPrompts[`${personaKey}_default`] || systemPrompts.default;

  let chatMessages = messages;
  if (!messages || messages.length === 0 || messages[0].role !== 'system') {
    chatMessages = [systemPrompt, ...(messages || [])];
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing OpenAI API key.' }), { status: 500 });
  }
  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 512,
      }),
    });
    const data = await openaiRes.json();
    if (data.error) {
      return new Response(JSON.stringify({ error: data.error.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ ai: data.choices[0].message.content }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: `Failed to contact OpenAI: ${err instanceof Error ? err.message : err}` }), { status: 500 });
  }
}
