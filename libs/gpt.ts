

// Use this if you want to make a call to OpenAI GPT-4 for instance. userId is used to identify the user on openAI side.
export const sendOpenAi = async (
  messages: any[], // TODO: type this
  userId: number,
  max = 100,
  temp = 1
) => {
  console.log('Ask GPT >>>');
  messages.map((m) =>
    console.log(' - ' + m.role.toUpperCase() + ': ' + m.content)
  );

  try {
    const res = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        userId,
        max,
        temp,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to fetch from OpenAI API route');
    }

    const data = await res.json();

    const answer = data.choices[0].message.content;
    const usage = data?.usage;

    console.log('>>> ' + answer);
    console.log(
      'TOKENS USED: ' +
        usage?.total_tokens +
        ' (prompt: ' +
        usage?.prompt_tokens +
        ' / response: ' +
        usage?.completion_tokens +
        ')'
    );
    console.log('\n');

    return answer;
  } catch (e) {
    console.error('GPT Error: ' + e.message);
    return null;
  }
};
