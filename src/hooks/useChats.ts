import { useEffect, useMemo, useRef, useState } from 'react';
import { Chat, ChatInfo, Options } from '../global/types';
import { useImmer } from 'use-immer';
import { produce } from 'immer';
import constructGeminiRequest from '../utils/constructGeminiRequest';
import constructGeminiPayload from '../utils/constructGeminiPayload';
import uid from '../utils/uid';
import createChatNameFromMessage from '../utils/createChatNameFromMessage';

/*/
  We're using a non-mutable approach to update messages in seperate objects, only reflecting the change to the chats state
  when we need to. This is required (and convinient) because a state is async and not very good for quick modifications. Only after everything
  is processed do we actually show it to the user.
/*/

export default function useChats() {
  /* --===== Normal States =====-- */

  const [chats, setChats] = useImmer<Chat[]>(() => {
    const savedChats = localStorage.getItem('chats');
    return savedChats ? JSON.parse(savedChats) : [];
  });
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const [viewOptions, setViewOptions] = useState(true);
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

    const chatWithUserMessage = addMessageToChat(newChat, sentMessage, 'self');
    fetchAnswer(chatWithUserMessage);
  };

  /**
   * Sends a message to the AI.
   * @param message The message to send.
   */
  const sendMessage = (message: string) => {
    const chat = activeChat || createChat();
    const chatWithUserMessage = addMessageToChat(chat, message, 'self');

    fetchAnswer(chatWithUserMessage);
  };

  /**
   * Fetches an answer from the AI.
   * @param chat The chat object to update.
   */
  const fetchAnswer = async (chat: Chat) => {
    // Notify user we're processing their request
    setIsGeneratingAnswer(true);
    setIsLoading(true);

    // Construct gemeni request
    const [url, init] = constructGeminiRequest(
      import.meta.env.VITE_GEMINI_API_KEY,
      constructGeminiPayload(chat, parseInt(options.numRememberPreviousMessages)),
      selectedModel.key,
      true
    );

    // Create a new message with a unique ID for the AI response
    const messageId = uid();
    const chatWithAiMessage = addMessageToChat(chat, '', 'ai', messageId);
    updateMessageContentState(chat);

    fetch(url, init).then((response) => {
      if (!response.body) throw new Error('No response body found');

      setIsLoading(false);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';

      // Function to process stream chunks
      function readStream() {
        reader
          .read()
          .then(({ done, value }) => {
            if (done) {
              setIsGeneratingAnswer(false);

              if (!chat.name) {
                createChatNameFromMessage(result, (name) => {
                  updateChatName(chat, name);
                });
              }
              return;
            }

            // Decode the chunk and append to result, remove the "data: " prefix
            const chunk = JSON.parse(
              decoder.decode(value, { stream: true }).replace('data: ', '')
            );

            if (chunk.error) {
              throw new Error(chunk.error.message);
            } else {
              result += chunk.candidates[0].content.parts.reduce(
                (acc: string, part: { text: string }) => acc + part.text,
                ''
              );
            }

            // Update the message incrementally with each chunk
            const updatedChat = updateMessageContent(
              chatWithAiMessage,
              messageId,
              result
            );
            updateMessageContentState(updatedChat);

            // Continue reading next chunk
            readStream();
          })
          .catch((error) => {
            setIsGeneratingAnswer(false);
            const updatedChat = updateMessageContent(
              chatWithAiMessage,
              messageId,
              'Error: ' + error.message
            );
            updateMessageContentState(updatedChat);
          });
      }

      readStream();
    });
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
        id: messageId || Date.now() + Math.random().toString(),
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

    if (activeChat) {
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
    if (!newName || newName.trim() === '') {
      alert("Name can't be empty!");
    } else if (newName && newName.length > 200) {
      alert("Name can't be over 200 characters!");
    } else if (newName) {
      setChats((draft) => {
        const foundChat = draft.find((c) => c.id === chatId);
        if (foundChat) {
          foundChat.name = newName;
        }
      });
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
  };
}
