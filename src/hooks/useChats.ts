import { useEffect, useMemo, useRef, useState } from 'react';
import { Chat, ChatInfo, Options } from '../global/types';
import { useImmer } from 'use-immer';
import { produce } from 'immer';
import constructGeminiPayload from '../utils/constructGeminiPayload';
import uid from '../utils/uid';
import createChatNameFromMessage from '../utils/createChatNameFromMessage';
import { GoogleGenerativeAI } from '@google/generative-ai';

/*/
  We're using a non-mutable approach to update messages in seperate objects, only reflecting the change to the chats state
  when we need to. This is required (and convinient) because a state is async and not very good for quick modifications. Only after everything
  is processed do we actually show it to the user.
/*/

export default function useChats() {
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
    () => genAI.current.getGenerativeModel({ model: selectedModel['key'] }),
    [selectedModel]
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

  /* --===== Options =====-- */

  const [viewOptions, setViewOptions] = useState(false);
  const [options, setOptions] = useImmer<Options>(() => {
    const savedOptions = localStorage.getItem('options');
    return savedOptions
      ? JSON.parse(savedOptions)
      : {
          numRememberPreviousMessages: '5',
        };
  });

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
    setChats((prevChats) =>
      prevChats.map((chat) => ({
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
    setChats((prevChats) => [...prevChats, chat]);
    return chat;
  };

  /**
   * Selects a chat (activates it).
   * @param chatId The id of the chat to activate.
   */
  const selectChat = (chatId: string) => {
    setChats((prevChats) =>
      prevChats.map((chat) => ({
        ...chat,
        active: chat.id === chatId,
      }))
    );
    setViewOptions(false);
  };

  /**
   * Generates a new answer for the last send message.
   */
  const regenerate = () => {
    const chat = activeChat || createChat();
    const sentMessage = chat.messages[chat.messages.length - 2].text;
    const newChat = produce(chat, (draft) => {
      draft.messages.splice(chat.messages.length - 2, 2);
    });

    fetchAnswer(newChat, sentMessage);
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

    // Construct history to feed into gemini
    const history = constructGeminiPayload(
      initialChat,
      parseInt(options.numRememberPreviousMessages)
    );

    // Add the user message to chat
    const chatWithUserMessage = addMessageToChat(initialChat, message, 'self');
    updateMessageContentState(chatWithUserMessage);

    // Create a new message with a unique ID for the AI response
    const messageId = uid();
    const chatWithAiMessage = addMessageToChat(chatWithUserMessage, '', 'ai', messageId);

    // Start the chat with said history
    const geminiChat = model.startChat(history);
    let combinedChunks = '';

    try {
      setIsLoading(false);

      const result = await geminiChat.sendMessageStream(message);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        combinedChunks += chunkText;

        // Update the message incrementally with each chunk
        const updatedChat = updateMessageContent(
          chatWithAiMessage,
          messageId,
          combinedChunks
        );
        updateMessageContentState(updatedChat);
      }

      // Update name at the ned if a name does not exist
      if (!initialChat.name) {
        updateChatName(
          initialChat,
          await createChatNameFromMessage(
            'Summarize into a maximum of 5 words:' + combinedChunks
          )
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
   * Add a message to the chat.
   * @param chat The chat object to update.
   * @param text The message text.
   * @param sender Who is sending the message ('self' or 'ai').
   * @param messageId Optional message ID.
   * @returns A new chat object with the updated messages.
   */
  const addMessageToChat = (
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
      });
    });
  };

  /**
   * Update the contents of a message.
   * @param chat The chat object to update.
   * @param messageId The ID of the chat to modify.
   * @param text The text to set the message to.
   */
  const updateMessageContent = (chat: Chat, messageId: string, text: string) => {
    return produce(chat, (draft) => {
      const message = draft.messages.find((m) => m.id === messageId);

      if (message) {
        message.text = text;
      }
    });
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
    const exportData = {
      id: 'geminiChat',
      chats: chats,
      options: options,
    };

    const dataStr = JSON.stringify(exportData, null, 2);

    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'chats.json';
    a.click();

    URL.revokeObjectURL(url);
  };

  /**
   * Imports a chat file.
   * @param file The chat file to import.
   */
  const importChats = (file: File) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const fileContent = reader.result as string;
        const parsedData = JSON.parse(fileContent);

        if (parsedData.id === 'geminiChat' && Array.isArray(parsedData.chats)) {
          setChats(parsedData.chats);
          setOptions(parsedData.options);
        } else {
          alert('Invalid file format or missing unique identifier.');
        }
      } catch (error) {
        alert('Error reading or parsing the file.');
      }
    };

    reader.readAsText(file);
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
   * Creates a clone of a chat.
   * @param chat The id of the chat to clone.
   */
  const cloneChat = (chatId: string) => {
    setChats((draft) => {
      const foundChat = draft.find((c) => c.id === chatId);

      if (foundChat) {
        const newChat = produce(foundChat, (draft2) => {
          draft2.id = uid();
          draft2.name = draft2.name + ' (Copy)';
          draft2.active = false;
        });
        draft.push(newChat);
      }
    });
  };

  return {
    chats,
    activeChat,
    chatsInfo,
    isGeneratingAnswer,
    isLoading,
    selectedModel,
    models,
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
  };
}
