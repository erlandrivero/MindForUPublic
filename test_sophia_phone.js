const fetch = require('node-fetch');

async function testSophiaPhone() {
  const response = await fetch('http://localhost:3000/api/ai-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: "Hi Sophia, I need help transferring a call to the HR department."
        }
      ],
      scenario: 'sophia_phone'
    })
  });
  const data = await response.json();
  console.log('AI Response:', data);
}

testSophiaPhone().catch(console.error);
