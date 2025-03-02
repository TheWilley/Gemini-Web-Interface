import { Chat } from '../global/types';
import Messages from './Messages';
import MessageInput from '../components/MessageInput';
import ChatHeader from './ChatHeader';
import Dropdown from '../components/Dropdown';
import Options from './Options';

function Main({
  activeChat,
  sendMessage,
  updateSelectModel,
  isGeneratingAnswer,
  isLoading,
  selectedModel,
  models,
  viewOptions,
  regenerate,
}: {
  activeChat: Chat | undefined;
  sendMessage: (message: string) => void;
  updateSelectModel: (model: string) => void;
  isGeneratingAnswer: boolean;
  isLoading: boolean;
  selectedModel: Chat['model'];
  models: Chat['model'][];
  viewOptions: boolean;
  regenerate: () => void;
}) {
  return (
    <div className='relative flex w-full items-center justify-center'>
      <div className='absolute left-2 top-2'>
        {!viewOptions && (
          <Dropdown
            options={models}
            onSelect={(selected) => {
              updateSelectModel(selected);
            }}
            value={selectedModel.key}
          />
        )}
      </div>
      <div className='flex h-screen w-full max-w-[840px] flex-col pl-3 pr-3 pt-12'>
        <div className='no-scrollbar flex-grow overflow-auto p-5'>
          {viewOptions ? (
            <Options />
          ) : activeChat ? (
            <Messages
              activeChat={activeChat}
              isLoading={isLoading}
              regenerate={regenerate}
            />
          ) : (
            <ChatHeader />
          )}
        </div>
        {!viewOptions && (
          <MessageInput
            sendMessage={sendMessage}
            isGeneratingAnswer={isGeneratingAnswer}
          />
        )}
      </div>
    </div>
  );
}

export default Main;
