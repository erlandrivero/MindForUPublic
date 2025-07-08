const fetch = require('node-fetch');

async function testSophiaScheduling() {
  const response = await fetch('http://localhost:3000/api/ai-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: "Hi Sophia, can you help me schedule a meeting with the marketing team next week?"
        }
      ],
      scenario: 'sophia_scheduling'
    })
  });
  const data = await response.json();
  console.log('AI Response:', data);
}

testSophiaScheduling().catch(console.error);
