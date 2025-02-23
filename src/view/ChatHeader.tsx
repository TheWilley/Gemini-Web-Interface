import classNames from '../utils/classNames';

function ChatHeader() {
  return (
    <div className='flex h-full items-center justify-center'>
      <h1
        className={classNames(
          'text-4xl font-bold',
          'from-fuchsia-500 to-pink-500 text-transparent bg-gradient-to-r bg-clip-text'
        )}
      >
        Welcome to Gemini
      </h1>
    </div>
  );
}

export default ChatHeader;
