const fetch = require('node-fetch');

(async () => {
  const response = await fetch('http://localhost:3000/api/ai-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      persona: "Olivia B.",
      scenario: "pain",
      messages: [
        { role: "user", content: "I have a severe toothache and need to see a dentist as soon as possible." },
        { role: "user", content: "Can you help me get an emergency appointment?" }
      ]
    })
  });
  const data = await response.json();
  console.log('Olivia B. (Pain) AI Response:', data);
})();
