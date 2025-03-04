export type ChatInfo = {
  id: string;
  name: string;
  active: boolean;
};

export type Chat = {
  model:
    | {
        name: '2.0 Flash';
        key: 'gemini-2.0-flash';
      }
    | {
        name: '2.0 Flash-Lite Preview';
        key: 'gemini-2.0-flash-lite-preview-02-05';
      }
    | {
        name: '1.5 Flash';
        key: 'gemini-1.5-flash';
      };
  messages: Message[];
} & ChatInfo;

export type GeminiPayload = {
  history: {
    role: 'user' | 'model';
    parts: {
      text: string;
    }[];
  }[];
  generationConfig?: {
    maxOutputTokens: number;
  };
};

export type Message = {
  id: string;
  text: string;
  createdAt: number;
  sender: 'self' | 'ai';
  tokenCount: number;
};

export type Options = {
  numRememberPreviousMessages: string;
};
