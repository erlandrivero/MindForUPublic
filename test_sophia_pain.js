const fetch = require('node-fetch');

async function testSophiaPain() {
  const response = await fetch('http://localhost:3000/api/ai-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: "Hi Sophia, I'm experiencing severe pain in my chest and need help."
        }
      ],
      scenario: 'sophia_pain'
    })
  });
  const data = await response.json();
  console.log('AI Response:', data);
}

testSophiaPain().catch(console.error);
