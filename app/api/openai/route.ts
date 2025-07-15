import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  const { messages, userId, max, temp } = await request.json();

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY is not set' }, { status: 500 });
  }

  const url = 'https://api.openai.com/v1/chat/completions';

  const body = JSON.stringify({
    model: 'gpt-4',
    messages,
    max_tokens: max,
    temperature: temp,
    user: userId,
  });

  const options = {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
  };

  try {
    const res = await axios.post(url, body, options);
    return NextResponse.json(res.data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
    console.error('OpenAI API Error:', error.response?.status, error.response?.data);
    return NextResponse.json({ error: error.response?.data || 'Internal Server Error' }, { status: error.response?.status || 500 });
    } else {
      return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
  }
}
