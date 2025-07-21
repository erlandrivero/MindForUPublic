const fetch = require('node-fetch');

(async () => {
  const response = await fetch('http://localhost:3000/api/ai-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      persona: "Marcus L.",
      scenario: "phone",
      messages: [
        { role: "user", content: "Hi, I want to confirm my dental appointment time." },
        { role: "user", content: "Is my cleaning still scheduled for Thursday at 2pm?" }
      ]
    }),
  });
  const data = await response.json();
  console.log('Marcus L. (Phone) AI Response:', data);
})();
