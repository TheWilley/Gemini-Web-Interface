import { useState, useEffect, useRef, useCallback } from 'react';
import Button from '../components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

function MessageInput({
  isGeneratingAnswer,
  sendMessage,
}: {
  isGeneratingAnswer: boolean;
  sendMessage: (message: string) => void;
}) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [borderRadius, setBorderRadius] = useState('9999px');

  const handleSendMessage = useCallback(() => {
    if (message.trim() === '') return;

    sendMessage(message.trim());

    setMessage('');
  }, [message, sendMessage]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '30px';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;

      // Check if the textarea has multiple lines and adjust the border-radius
      if (textareaRef.current.scrollHeight > 60) {
        setBorderRadius('20px');
      } else {
        setBorderRadius('30px');
      }
    }
  }, [message]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div
      className='mb-3 flex items-end border border-text p-1'
      style={{ borderRadius, transition: 'border-radius 1s' }}
    >
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className={`flex-grow resize-none overflow-auto rounded-full bg-background p-3 text-text-strong outline-none`}
        placeholder='Ask Gemini'
        rows={1}
        style={{ maxHeight: '150px' }}
      />
      {message.trim() && !isGeneratingAnswer && (
        <Button onclick={handleSendMessage}>
          <FontAwesomeIcon icon={faPaperPlane} />
        </Button>
      )}
    </div>
  );
}

export default MessageInput;
