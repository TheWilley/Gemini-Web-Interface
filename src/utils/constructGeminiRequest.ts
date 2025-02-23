import { Chat, GeminiPayload } from '../global/types';

/**
 * Constucts fetch parameters for a request to the gemini rest API
 * @param apiKey The gemini api key
 * @param payload The gemini payload
 * @returns The fetch url along with initial parameters.
 */
export default function constructGeminiRequest(
  apiKey: string,
  payload: GeminiPayload,
  model: Chat['model']['key'],
  streamContent: boolean = false
) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:${streamContent ? 'streamGenerateContent?alt=sse&' : 'generateContent?'}key=${apiKey}`;

  // Constructing the request init object
  const init = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  };

  // Return the URL and init object as a tuple
  return [url, init] as const;
}
