const fetch = require('node-fetch');

(async () => {
  const response = await fetch('http://localhost:3000/api/ai-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      persona: "Marcus L.",
      scenario: "scheduling",
      messages: [
        { role: "user", content: "I need to book a dental checkup for next week." },
        { role: "user", content: "What days are available?" }
      ]
    })
  });
  const data = await response.json();
  console.log('Marcus L. (Scheduling) AI Response:', data);
})();
