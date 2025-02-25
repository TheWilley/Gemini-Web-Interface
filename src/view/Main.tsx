import { Chat } from '../global/types';
import Messages from './Messages';
import MessageInput from '../components/MessageInput';
import ChatHeader from './ChatHeader';
import Dropdown from './Dropdown';

function Main({
  activeChat,
  sendMessage,
  updateSelectModel,
  isGeneratingAnswer,
  isLoading,
  selectedModel,
  models,
}: {
  activeChat: Chat | undefined;
  sendMessage: (message: string) => void;
  updateSelectModel: (model: string) => void;
  isGeneratingAnswer: boolean;
  isLoading: boolean;
  selectedModel: Chat['model'];
  models: Chat['model'][];
}) {
  return (
    <div className='relative flex w-full items-center justify-center'>
      <div className='absolute left-2 top-2'>
        <Dropdown
          options={models}
          onSelect={(selected) => {
            updateSelectModel(selected);
          }}
          value={selectedModel.key}
        />
      </div>
      <div className='flex h-screen w-full max-w-[840px] flex-col'>
        <div className='no-scrollbar flex-grow overflow-auto p-5'>
          {activeChat ? (
            <Messages activeChat={activeChat} isLoading={isLoading} />
          ) : (
            <ChatHeader />
          )}
        </div>
        <MessageInput sendMessage={sendMessage} isGeneratingAnswer={isGeneratingAnswer} />
      </div>
    </div>
  );
}

export default Main;
