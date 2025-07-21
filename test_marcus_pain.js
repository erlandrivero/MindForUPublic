const fetch = require('node-fetch');

(async () => {
  const response = await fetch('http://localhost:3000/api/ai-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      persona: "Marcus L.",
      scenario: "pain",
      messages: [
        { role: "user", content: "My tooth is hurting badly and I need to see a dentist right away." },
        { role: "user", content: "Can you help me get an urgent appointment?" }
      ]
    })
  });
  const data = await response.json();
  console.log('Marcus L. (Pain) AI Response:', data);
})();
