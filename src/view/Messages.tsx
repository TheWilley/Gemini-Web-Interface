import Markdown from 'react-markdown';
import { Chat, Message } from '../global/types';
import classNames from '../utils/classNames';
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
}: {
  message: Message;
  isLoading: boolean;
  isLastMessage: boolean;
  activeChatId: string;
  copy: (message: Message, type: 'chat' | 'id' | 'time') => void;
  togglePinMessage: (chatId: string, messageId: string) => void;
  cloneChat: (chatId: string, messageId?: string) => void;
  regenerate: () => void;
  editMessage: () => void;
}) {
  return (
    <div
      key={message.id}
      className={classNames(
        'group/message mb-8 flex',
        message.sender === 'self' ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={message.sender === 'ai' ? 'grid w-full grid-cols-[5%_95%]' : 'flex'}
      >
        {message.sender === 'ai' ? (
          <img src={geminiLogo} width={30} />
        ) : (
          <Button
            onclick={() => editMessage()}
            classes='mr-2 group-hover/message:opacity-100 opacity-0 transition-opacity'
          >
            <FontAwesomeIcon icon={faPen} />
          </Button>
        )}
        <div
          id={message.id}
          className={classNames(
            'group break-words rounded-2xl rounded-tr-sm p-3',
            message.sender === 'self'
              ? 'max-w-96 justify-end bg-overlay text-text-strong'
              : 'bg-backgroun prose prose-gray prose-invert max-w-full leading-6'
          )}
        >
          {message.sender === 'self' ? (
            message.text
          ) : (
            <>
              {isLoading && isLastMessage ? (
                <Skeleton />
              ) : (
                <Markdown>{message.text}</Markdown>
              )}
              <MessageActions
                message={message}
                activeChatId={activeChatId}
                isLastMessage={isLastMessage}
                copy={copy}
                togglePinMessage={togglePinMessage}
                cloneChat={cloneChat}
                regenerate={regenerate}
              />
            </>
          )}
        </div>
      </div>
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
  editMessage: () => void;
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
        />
      ))}
      <div id='scollToBottom' ref={scrollToBottomRef} />
    </>
  );
}

export default Messages;
