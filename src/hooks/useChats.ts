import { useEffect, useMemo, useRef, useState } from 'react';
import { Chat, ChatInfo, Options } from '../global/types';
import { useImmer } from 'use-immer';
import { produce } from 'immer';
import constructGeminiPayload from '../utils/constructGeminiPayload';
import uid from '../utils/uid';
import createChatNameFromMessage from '../utils/createChatNameFromMessage';
import { GoogleGenerativeAI } from '@google/generative-ai';
import textIsNotBlank from '../utils/textIsNotBlank';
import {
  addMessageToChat,
  getLastSentMessage,
  updateChatMessages,
  updateMessageContent,
  updateMessageTokensCount,
} from '../helpers/chatHelper';
import { exportJson, importJson } from '../utils/exportDownload';

/*/
  We're using a non-mutable approach to update messages in seperate objects, only reflecting the change to the chats state
  when we need to. This is required (and convinient) because a state is async and not very good for quick modifications. Only after everything
  is processed do we actually show it to the user.
/*/

const defaultOptions: Options = {
  numRememberPreviousMessages: '5',
  chatNamePrompt: 'Summarize into a maximum of 5 words: [n]',
  temperature: '1',
  systemInstruction: '',
};

export default function useChats() {
  /* --===== Options =====-- */

  const [viewOptions, setViewOptions] = useState(false);
  const [options, setOptions] = useImmer<Options>(() => {
    const savedOptions = localStorage.getItem('options');
    return savedOptions ? JSON.parse(savedOptions) : defaultOptions;
  });

  /* --===== Normal States =====-- */

  const genAI = useRef(new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY));
  const [selectedModel, setSelectedModel] = useState<Chat['model']>({
    key: 'gemini-2.0-flash',
    name: '2.0 Flash',
  });
  const models = useRef<Chat['model'][]>([
    {
      name: '2.0 Flash',
      key: 'gemini-2.0-flash',
    },
    {
      key: 'gemini-2.0-flash-lite-preview-02-05',
      name: '2.0 Flash-Lite Preview',
    },
    {
      key: 'gemini-1.5-flash',
      name: '1.5 Flash',
    },
  ]);
  const model = useMemo(
    () =>
      genAI.current.getGenerativeModel({
        model: selectedModel['key'],
        generationConfig: {
          temperature: textIsNotBlank(options.temperature)
            ? parseInt(options.temperature)
            : undefined,
        },
        systemInstruction: textIsNotBlank(options.systemInstruction)
          ? options.systemInstruction
          : undefined,
      }),
    [options.systemInstruction, options.temperature, selectedModel]
  );
  const [chats, setChats] = useImmer<Chat[]>(() => {
    const savedChats = localStorage.getItem('chats');
    return savedChats ? JSON.parse(savedChats) : [];
  });
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /* --===== Memorized States =====-- */

  const activeChat = useMemo(() => chats.find((chat) => chat.active === true), [chats]);
  const chatsInfo = useMemo<ChatInfo[]>(
    () =>
      chats.map((chat) => {
        return { id: chat.id, name: chat.name, active: chat.active };
      }),
    [chats]
  );
  const totalTokenCount = useMemo(() => {
    let totalTokenCount = 0;
    chats.forEach((chat) => {
      chat.messages.forEach((message) => {
        totalTokenCount += message.tokenCount;
      });
    }, 0);

    return totalTokenCount;
  }, [chats]);

  /* --===== Effects =====-- */

  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('options', JSON.stringify(options));
  }, [options]);

  useEffect(() => {
    if (activeChat) {
      setSelectedModel(activeChat.model);
    }
  }, [activeChat]);

  /* --===== Functions =====-- */

  /**
   * Updates a option.
   * @param target The key of the option to update.
   * @param value Thw new value of the option.
   */
  const updateOption = (target: string, value: string) => {
    setOptions((draft) => {
      draft[target as keyof typeof options] = value;
    });
  };

  /**
   * Toggles options view.
   */
  const toggleViewOptions = () => {
    setViewOptions((prev) => !prev);
  };

  /**
   * Alias for `unactivateAllChats`.
   */
  const newChat = () => {
    unactivateAllChats();
    setViewOptions(false);
  };

  /**
   * Makes all chats unactive.
   */
  const unactivateAllChats = () => {
    setChats((draft) =>
      draft.map((chat) => ({
        ...chat,
        active: false,
      }))
    );
  };

  /**
   * Creates a new chat instances.
   * @returns The new chat instance.
   */
  const createChat = (): Chat => {
    const chat: Chat = {
      id: Date.now() + Math.random().toString(),
      name: '',
      messages: [],
      model: selectedModel,
      active: true,
    };

    unactivateAllChats();
    setChats((draft) => [...draft, chat]);
    return chat;
  };

  /**
   * Selects a chat (activates it).
   * @param chatId The id of the chat to activate.
   */
  const selectChat = (chatId: string) => {
    setChats((draft) =>
      draft.map((chat) => ({
        ...chat,
        active: chat.id === chatId,
      }))
    );
    setViewOptions(false);
  };

  /**
   * Regenerates the chat's answer by either editing the last message or using the last sent message.
   *
   * @param edit - If true, prompts the user to edit the last message. Defaults to false.
   * @param updatedMessage - The updated message to send. Only used if 'edit' is true.
   */
  const regenerate = (edit = false, updatedMessage?: string) => {
    const chat = activeChat || createChat();

    // Get the second-to-last message text
    const lastSentMessage = getLastSentMessage(chat);

    if (lastSentMessage) {
      // Prompt for a new message if 'edit' is true
      const sentMessage = edit ? updatedMessage : lastSentMessage;

      if (sentMessage) {
        const updatedChat = updateChatMessages(chat);
        fetchAnswer(updatedChat, sentMessage);
      }
    }
  };

  /**
   * Sends a message to the AI.
   * @param message The message to send.
   */
  const sendMessage = (message: string) => {
    const chat = activeChat || createChat();
    fetchAnswer(chat, message);
  };

  /**
   * Fetches an answer from the AI.
   * @param initialChat The chat object to update.
   */
  const fetchAnswer = async (initialChat: Chat, message: string) => {
    // Notify user we're processing their request
    setIsGeneratingAnswer(true);
    setIsLoading(true);

    // Construct payload to feed into gemini
    const payload = constructGeminiPayload(
      initialChat,
      textIsNotBlank(options.numRememberPreviousMessages)
        ? parseInt(options.numRememberPreviousMessages)
        : 0
    );

    // Add the user message to chat
    const chatWithUserMessage = addMessageToChat(initialChat, message, 'self');
    updateMessageContentState(chatWithUserMessage);

    // Create a new message with a unique ID for the AI response
    const messageId = uid();
    const chatWithAiMessage = addMessageToChat(chatWithUserMessage, '', 'ai', messageId);
    updateMessageContentState(chatWithAiMessage);

    // Start the chat with said payload
    const geminiChat = model.startChat(payload);
    let combinedChunks = '';
    let tokenCount = 0;

    try {
      const result = await geminiChat.sendMessageStream(message);
      setIsLoading(false);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        combinedChunks += chunkText;
        tokenCount = chunk.usageMetadata?.totalTokenCount || 0;

        // Update the message incrementally with each chunk
        const updatedChat = updateMessageContent(
          chatWithAiMessage,
          messageId,
          combinedChunks
        );
        const updatedChatWithTokens = updateMessageTokensCount(
          updatedChat,
          messageId,
          tokenCount
        );
        updateMessageContentState(updatedChatWithTokens);
      }

      // Update name at the ned if a name does not exist
      if (!initialChat.name) {
        updateChatName(
          initialChat,
          textIsNotBlank(options.chatNamePrompt)
            ? await createChatNameFromMessage(
                options.chatNamePrompt.replace('[n]', combinedChunks)
              )
            : 'New Chat'
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        setIsGeneratingAnswer(false);
        const updatedChat = updateMessageContent(
          chatWithAiMessage,
          messageId,
          'Error: ' + error.message
        );
        updateMessageContentState(updatedChat);
      }
    }
  };

  /**
   * Reflects chat contents onto the GUI.
   * @param chat The chat object to send.
   */
  const updateMessageContentState = (chat: Chat) => {
    setChats((draft) => {
      const foundChat = draft.find((c) => c.id === chat.id);

      if (foundChat) {
        foundChat.messages = chat.messages;
      }
    });
  };

  /**
   * Updates the name of a chat.
   * @param chat The chat object to modify.
   * @param name The new name of the chat.
   */
  const updateChatName = (chat: Chat, name: string) => {
    setChats((draft) => {
      const foundChat = draft.find((c) => c.id === chat.id);

      if (foundChat) {
        foundChat.name = name;
      }
    });
  };

  /**
   * Clears all chats.
   */
  const clearChats = () => {
    if (confirm('Are you sure you want to clear all chats?')) {
      localStorage.removeItem('chats');
      location.reload();
    }
  };

  /**
   * Exports chats as JSON.
   */
  const exportChats = () => {
    exportJson({ chats, options }, 'geminiChat', 'chats.json');
  };

  /**
   * Imports a chat file.
   * @param file The chat file to import.
   */
  const importChats = (file: File) => {
    importJson(file, 'geminiChat', (data) => {
      setChats(data.chats as Chat[]);
      setOptions(data.options as Options);
    });
  };

  /**
   * Updates the selected model.
   * @param modelKey The key of the target model.
   */
  const updateSelectModel = (modelKey: string) => {
    const targetModel = models.current.find((model) => model.key === modelKey);

    if (targetModel) {
      setSelectedModel(targetModel);
    }

    if (activeChat && activeChat.model.key !== modelKey) {
      newChat();
    }
  };

  /**
   * Deletes a chat.
   * @param chatId The id of the chat to delete.
   */
  const deleteChat = (chatId: string) => {
    if (confirm(`Are you sure you want to delete chat?`))
      setChats((draft) => {
        const foundChat = draft.find((c) => c.id === chatId);

        if (foundChat) {
          draft.splice(draft.indexOf(foundChat), 1);
        }
      });
  };

  /**
   * Edits a chat name.
   * @param chatId The id of the chat to edit.
   */
  const editChatName = (chatId: string) => {
    const newName = prompt('Enter new name for chat');
    if (newName && newName.length > 200) {
      alert("Name can't be over 200 characters!");
    } else if (newName && newName.trim() !== '') {
      setChats((draft) => {
        const foundChat = draft.find((c) => c.id === chatId);
        if (foundChat) {
          foundChat.name = newName;
        }
      });
    }
  };

  /**
   * Edits a message using a prompt.
   * @param updatedMessage The updated message to set.
   */
  const editMessage = (updatedMessage: string) => {
    regenerate(true, updatedMessage);
  };

  /**
   * Creates a clone of a chat.
   * @param chat The id of the chat to clone.
   */
  const cloneChat = (chatId: string, messageId?: string) => {
    setChats((draft) => {
      const foundChat = draft.find((c) => c.id === chatId);

      if (foundChat) {
        const messageIndex = messageId
          ? foundChat.messages.findIndex((m) => m.id === messageId)
          : foundChat.messages.length;

        if (messageIndex !== -1) {
          const newChat = produce(foundChat, (draft2) => {
            draft2.id = uid();
            draft2.name = draft2.name + ' (Copy)';
            draft2.active = false;
            draft2.messages = draft2.messages.slice(0, messageIndex + 1);
          });
          draft.push(newChat);
        }
      }
    });
  };

  const togglePinMessage = (chatId: string, messageId: string) => {
    setChats((draft) => {
      const foundChat = draft.find((c) => c.id === chatId);

      if (foundChat) {
        const foundMessage = foundChat.messages.find((m) => m.id === messageId);

        if (foundMessage) {
          foundMessage.pinned = !foundMessage.pinned;
        }
      }
    });
  };

  /**
   * Restores options to defaults.
   */
  const restoreOptions = () => {
    if (confirm('Are you sure you want to restore to default settings?')) {
      setOptions(defaultOptions);
    }
  };

  return {
    chats,
    activeChat,
    chatsInfo,
    isGeneratingAnswer,
    isLoading,
    selectedModel,
    models,
    totalTokenCount,
    viewOptions,
    options,
    newChat,
    selectChat,
    sendMessage,
    clearChats,
    exportChats,
    importChats,
    updateSelectModel,
    deleteChat,
    editChatName,
    regenerate,
    toggleViewOptions,
    updateOption,
    cloneChat,
    editMessage,
    restoreOptions,
    togglePinMessage,
  };
}
