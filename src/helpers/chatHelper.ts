import { produce } from 'immer';
import { Chat } from '../global/types';
import uid from '../utils/uid';

/**
 * Updates the chat object by removing the last two messages.
 *
 * @param chat - The chat object containing messages.
 * @returns A new chat object with the last two messages removed.
 */
export const updateChatMessages = (chat: Chat) => {
  return produce(chat, (draft) => {
    draft.messages.splice(chat.messages.length - 2, 2);
  });
};

/**
 * Retrieves the second-to-last message from the chat.
 *
 * @param chat - The chat object containing messages.
 * @returns The text of the second-to-last message or null if no message exists.
 */
export const getLastSentMessage = (chat: Chat) => {
  return chat.messages[chat.messages.length - 2]?.text || null;
};

/**
 * Add a message to the chat.
 * @param chat The chat object to update.
 * @param text The message text.
 * @param sender Who is sending the message ('self' or 'ai').
 * @param messageId Optional message ID.
 * @returns A new chat object with the updated messages.
 */
export const addMessageToChat = (
  chat: Chat,
  text: string,
  sender: 'self' | 'ai',
  messageId?: string
) => {
  return produce(chat, (draft) => {
    draft.messages.push({
      id: messageId || uid(),
      text,
      createdAt: Date.now(),
      sender,
      tokenCount: 0,
      pinned: false,
    });
  });
};

/**
 * Update the contents of a message.
 * @param chat The chat object to update.
 * @param messageId The ID of the chat to modify.
 * @param text The text to set the message to.
 * @returns The updated chat object.
 */
export const updateMessageContent = (chat: Chat, messageId: string, text: string) => {
  return produce(chat, (draft) => {
    const message = draft.messages.find((m) => m.id === messageId);

    if (message) {
      message.text = text;
    }
  });
};

/**
 * Updates the token count for a given message in a chat.
 * @param chat The chat object to update.
 * @param messageId The ID of the chat to modify.
 * @param tokenCount The number of tokens the message cost.
 * @returns The updated chat object.
 */
export const updateMessageTokensCount = (
  chat: Chat,
  messageId: string,
  tokenCount: number
) => {
  return produce(chat, (draft) => {
    const message = draft.messages.find((m) => m.id === messageId);

    if (message) {
      message.tokenCount = tokenCount;
    }
  });
};
