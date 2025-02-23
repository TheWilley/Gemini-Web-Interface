import { Chat, GeminiPayload } from '../global/types';

/**
 * Constructs a payload for gemini based on previous messages.
 * @param chat The chat object to use messages from.
 * @returns The payload.
 */
export default function constructGeminiPayload(chat: Chat) {
  const payload: GeminiPayload = {
    contents: chat.messages.map((message) => ({
      role: message.sender === 'self' ? 'user' : 'model',
      parts: [{ text: message.text }],
    })),
  };

  return payload;
}
