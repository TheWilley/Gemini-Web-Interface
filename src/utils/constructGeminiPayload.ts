import { Chat, GeminiPayload } from '../global/types';

/**
 * Constructs a payload for gemini based on previous messages.
 * @param chat The chat object to use messages from.
 * @param numTrailingItems Defines the last n messages to use as context when generating an answer.
 * @returns The payload.
 */
export default function constructGeminiPayload(chat: Chat, numTrailingItems: number) {
  // We always get an even number of items (the message sent by the user + by the AI)
  if (numTrailingItems <= 0) {
    numTrailingItems = 2;
  } else if (numTrailingItems % 2 !== 0) {
    numTrailingItems += 1;
  }

  console.log(numTrailingItems);

  const payload: GeminiPayload = {
    contents: chat.messages
      .slice(Math.max(chat.messages.length - numTrailingItems))
      .map((message) => ({
        role: message.sender === 'self' ? 'user' : 'model',
        parts: [{ text: message.text }],
      })),
  };

  return payload;
}
