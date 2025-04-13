import { useState } from 'react';
import Markdown from 'react-markdown';
import { Chat, Message } from '../global/types';
import Button from '../components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faClone,
  faCopy,
  faFingerprint,
  faPen,
  faRotateRight,
  faThumbTack,
  faThumbTackSlash,
} from '@fortawesome/free-solid-svg-icons';
import geminiLogo from '../assets/gemini.png';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import Tooltip from '../components/Tooltip';

function Skeleton() {
  return (
    <div role='status' className='max-w-sm animate-pulse'>
      <div className='mb-4 h-2.5 w-48 rounded-full bg-gray-200 dark:bg-gray-700'></div>
      <div className='mb-2.5 h-2 max-w-[360px] rounded-full bg-gray-200 dark:bg-gray-700'></div>
      <div className='mb-2.5 h-2 rounded-full bg-gray-200 dark:bg-gray-700'></div>
      <div className='mb-2.5 h-2 max-w-[330px] rounded-full bg-gray-200 dark:bg-gray-700'></div>
      <div className='mb-2.5 h-2 max-w-[300px] rounded-full bg-gray-200 dark:bg-gray-700'></div>
      <div className='h-2 max-w-[360px] rounded-full bg-gray-200 dark:bg-gray-700'></div>
      <span className='sr-only'>Loading...</span>
    </div>
  );
}

function MessageActions({
  message,
  activeChatId,
  isLastMessage,
  copy,
  togglePinMessage,
  cloneChat,
  regenerate,
}: {
  message: Message;
  activeChatId: string;
  isLastMessage: boolean;
  copy: (message: Message, type: 'chat' | 'id' | 'time') => void;
  togglePinMessage: (chatId: string, messageId: string) => void;
  cloneChat: (chatId: string, messageId?: string) => void;
  regenerate: () => void;
}) {
  return (
    <div className='flex items-center opacity-0 transition-opacity group-hover:opacity-100'>
      <Tooltip position='bottom' text='Copy text'>
        <Button onclick={() => copy(message, 'chat')}>
          <FontAwesomeIcon icon={faCopy} className='opacity-60' />
        </Button>
      </Tooltip>
      <Tooltip position='bottom' text='Copy ID'>
        <Button onclick={() => copy(message, 'id')}>
          <FontAwesomeIcon icon={faFingerprint} className='opacity-60' />
        </Button>
      </Tooltip>
      <Tooltip position='bottom' text='Copy timestamp'>
        <Button onclick={() => copy(message, 'time')}>
          <FontAwesomeIcon icon={faClock} className='opacity-60' />
        </Button>
      </Tooltip>
      <Tooltip position='bottom' text={message.pinned ? 'Unpin message' : 'Pin message'}>
        <Button
          onclick={() => {
            togglePinMessage(activeChatId, message.id);
          }}
        >
          <FontAwesomeIcon
            icon={message.pinned ? faThumbTackSlash : faThumbTack}
            className='opacity-60'
          />
        </Button>
      </Tooltip>
      {!isLastMessage && (
        <Tooltip position='bottom' text='Clone from this point'>
          <Button
            onclick={() => {
              cloneChat(activeChatId, message.id);
            }}
          >
            <FontAwesomeIcon icon={faClone} className='opacity-60' />
          </Button>
        </Tooltip>
      )}
      {isLastMessage && (
        <Tooltip position='bottom' text='Regenerate'>
          <Button onclick={() => regenerate()}>
            <FontAwesomeIcon icon={faRotateRight} className='opacity-60' />
          </Button>
        </Tooltip>
      )}
      <span className='ml-auto hidden opacity-60 sm:block'>
        {message.tokenCount || '0'} tokens
      </span>
    </div>
  );
}

function EditableMessage({
  message,
  onSave,
  onCancel,
}: {
  message: Message;
  onSave: (updatedText: string) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(message.text);

  return (
    <>
      <div className='w-full'>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className='h-full min-h-36 w-full resize-none overflow-hidden rounded-lg border border-gray-500 bg-transparent p-2 text-white hover:overflow-auto'
          style={{
            scrollbarWidth: 'initial',
            scrollbarColor: 'gray transparent',
            msOverflowStyle: 'none',
          }}
        />
      </div>
      <div className='mt-2 flex justify-end gap-2'>
        <Button onclick={onCancel}>Cancel</Button>
        <Button
          onclick={() => onSave(text)}
          classes='bg-blue-300 text-blue-800 hover:bg-blue-400'
        >
          Save
        </Button>
      </div>
    </>
  );
}

function UserMessage({
  message,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  canBeEdited,
}: {
  message: Message;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updatedText: string) => void;
  onCancel: () => void;
  canBeEdited?: boolean;
}) {
  return (
    <div className='group-message mb-12 flex justify-end'>
      {canBeEdited && !isEditing && (
        <Button
          onclick={onEdit}
          classes='mr-2 group-hover/message:opacity-100 opacity-0 transition-opacity'
        >
          <FontAwesomeIcon icon={faPen} />
        </Button>
      )}
      {isEditing ? (
        <div className='w-full'>
          <EditableMessage message={message} onSave={onSave} onCancel={onCancel} />
        </div>
      ) : (
        <div
          id={message.id}
          className='group max-w-96 justify-end whitespace-pre-wrap break-words rounded-2xl rounded-tr-sm bg-overlay p-3 text-text-strong'
        >
          {message.text}
        </div>
      )}
    </div>
  );
}

function AIMessage({
  message,
  isLoading,
  isLastMessage,
  activeChatId,
  copy,
  togglePinMessage,
  cloneChat,
  regenerate,
}: {
  message: Message;
  isLoading: boolean;
  isLastMessage: boolean;
  activeChatId: string;
  copy: (message: Message, type: 'chat' | 'id' | 'time') => void;
  togglePinMessage: (chatId: string, messageId: string) => void;
  cloneChat: (chatId: string, messageId?: string) => void;
  regenerate: () => void;
}) {
  return (
    <div className='grid w-full grid-cols-[5%_95%]'>
      <img src={geminiLogo} width={30} />
      <div
        id={message.id}
        className='bg-backgroun group prose prose-gray prose-invert max-w-full break-words rounded-2xl rounded-tr-sm p-3 leading-6'
      >
        {isLoading && isLastMessage ? <Skeleton /> : <Markdown>{message.text}</Markdown>}
        <MessageActions
          message={message}
          activeChatId={activeChatId}
          isLastMessage={isLastMessage}
          copy={copy}
          togglePinMessage={togglePinMessage}
          cloneChat={cloneChat}
          regenerate={regenerate}
        />
      </div>
    </div>
  );
}

function MessageItem({
  message,
  isLoading,
  isLastMessage,
  activeChatId,
  copy,
  togglePinMessage,
  cloneChat,
  regenerate,
  editMessage,
  canBeEdited,
}: {
  message: Message;
  isLoading: boolean;
  isLastMessage: boolean;
  activeChatId: string;
  copy: (message: Message, type: 'chat' | 'id' | 'time') => void;
  togglePinMessage: (chatId: string, messageId: string) => void;
  cloneChat: (chatId: string, messageId?: string) => void;
  regenerate: () => void;
  editMessage: (updatedText: string) => void;
  canBeEdited: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (updatedText: string) => {
    editMessage(updatedText);
    setIsEditing(false);
  };

  return (
    <div className='group/message'>
      {message.sender === 'self' ? (
        <UserMessage
          message={message}
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
          canBeEdited={canBeEdited}
        />
      ) : (
        <AIMessage
          message={message}
          isLoading={isLoading}
          isLastMessage={isLastMessage}
          activeChatId={activeChatId}
          copy={copy}
          togglePinMessage={togglePinMessage}
          cloneChat={cloneChat}
          regenerate={regenerate}
        />
      )}
    </div>
  );
}

function Messages({
  activeChat,
  isLoading,
  regenerate,
  editMessage,
  cloneChat,
  togglePinMessage,
}: {
  activeChat: Chat;
  isLoading: boolean;
  regenerate: () => void;
  editMessage: (updatedText: string) => void;
  cloneChat: (chatId: string, messageId?: string) => void;
  togglePinMessage: (chatId: string, messageId: string) => void;
}) {
  const scrollToBottomRef = useRef<null | HTMLDivElement>(null);
  const copy = useCallback((message: Message, type: 'chat' | 'id' | 'time') => {
    switch (type) {
      case 'chat': {
        navigator.clipboard.writeText(message.text);
        toast('Copied text to clipboard');
        break;
      }

      case 'id': {
        navigator.clipboard.writeText(message.id);
        toast('Copied ID to clipboard');
        break;
      }

      case 'time': {
        navigator.clipboard.writeText(String(message.createdAt));
        toast('Copied time to clipboard');
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottomRef.current?.scrollIntoView();
  }, [activeChat.id]);

  return (
    <>
      {activeChat.messages.map((message, index) => (
        <MessageItem
          key={message.id}
          message={message}
          isLoading={isLoading}
          isLastMessage={index === activeChat.messages.length - 1}
          activeChatId={activeChat.id}
          copy={copy}
          togglePinMessage={togglePinMessage}
          cloneChat={cloneChat}
          regenerate={regenerate}
          editMessage={editMessage}
          canBeEdited={index === activeChat.messages.length - 2}
        />
      ))}
      <div id='scollToBottom' ref={scrollToBottomRef} />
    </>
  );
}

export default Messages;
