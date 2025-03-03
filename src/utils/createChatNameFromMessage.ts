import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Generates a chat name based on a prompt.
 * @param prompt The prompt to use.
 * @returns The name of the chat.
 */
export default async function createChatNameFromMessage(prompt: string) {
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
