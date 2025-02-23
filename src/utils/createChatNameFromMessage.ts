import constructGeminiRequest from './constructGeminiRequest';

export default function createChatNameFromMessage(
  message: string,
  callback: (name: string) => void
) {
  const [url, init] = constructGeminiRequest(
    import.meta.env.VITE_GEMINI_API_KEY,
    {
      contents: [
        {
          role: 'user',
          parts: [{ text: 'Summarize into a maximum of 5 words:' }, { text: message }],
        },
      ],
    },
    'gemini-1.5-flash',
    false
  );

  fetch(url, init)
    .then((response) => response.json())
    .then((data) => {
      const text = data.candidates[0].content.parts[0].text;
      callback(text);
    });
}
