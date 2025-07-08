const fetch = require('node-fetch');

(async () => {
  const response = await fetch('http://localhost:3000/api/ai-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      persona: "Olivia B.",
      scenario: "phone",
      messages: [
        { role: "user", content: "Hello, I have a question about my dental insurance coverage." },
        { role: "user", content: "Can you help me understand what is covered for cleanings?" }
      ]
    }),
  });
  const data = await response.json();
  console.log('Olivia B. (Phone) AI Response:', data);
})();
