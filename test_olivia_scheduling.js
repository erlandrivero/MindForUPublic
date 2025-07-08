const fetch = require('node-fetch');

(async () => {
  const response = await fetch('http://localhost:3000/api/ai-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      persona: "Olivia B.",
      scenario: "scheduling",
      messages: [
        { role: "user", content: "Hi, I need to reschedule my dental cleaning." },
        { role: "user", content: "Are there any openings this week?" }
      ]
    })
  });
  const data = await response.json();
  console.log('Olivia B. (Scheduling) AI Response:', data);
})();
