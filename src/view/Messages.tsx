import Markdown from 'react-markdown';
import { Chat, Message } from '../global/types';
import classNames from '../utils/classNames';
import Button from '../components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCopy, faFingerprint } from '@fortawesome/free-solid-svg-icons';
import geminiLogo from '../assets/gemini.png';
import { useCallback } from 'react';

function Messages({ activeChat, isLoading }: { activeChat: Chat; isLoading: boolean }) {
  const copy = useCallback((message: Message, type: 'chat' | 'id' | 'time') => {
    switch (type) {
      case 'chat': {
        navigator.clipboard.writeText(message.text);
        break;
      }

      case 'id': {
        navigator.clipboard.writeText(message.id);
        break;
      }

      case 'time': {
        navigator.clipboard.writeText(String(message.createdAt));
      }
    }
  }, []);

  return (
    <>
      {activeChat.messages.map((message) => (
        <div
          key={message.id}
          className={classNames(
            'mb-8 flex',
            message.sender === 'self' ? 'justify-end' : 'justify-start'
          )}
        >
          <div
            className={message.sender === 'ai' ? 'grid w-full grid-cols-[5%_95%]' : ''}
          >
            {message.sender === 'ai' && <img src={geminiLogo} width={30} />}
            <div
              className={classNames(
                'group break-words rounded-2xl rounded-tr-sm p-3',
                message.sender === 'self'
                  ? 'max-w-96 justify-end bg-overlay text-text-strong'
                  : 'prose prose-invert prose-gray bg-backgroun max-w-full leading-6'
              )}
            >
              {message.sender === 'self' ? (
                message.text
              ) : (
                <>
                  <Markdown>{isLoading ? 'Creating message...' : message.text}</Markdown>
                  <div className='opacity-0 transition-opacity group-hover:opacity-100'>
                    <Button onclick={() => copy(message, 'chat')}>
                      <FontAwesomeIcon icon={faCopy} className='opacity-60' />
                    </Button>
                    <Button onclick={() => copy(message, 'id')}>
                      <FontAwesomeIcon icon={faFingerprint} className='opacity-60' />
                    </Button>
                    <Button onclick={() => copy(message, 'time')}>
                      <FontAwesomeIcon icon={faClock} className='opacity-60' />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export default Messages;
