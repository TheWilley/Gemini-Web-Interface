import { Chat, Options } from '../global/types';
import Messages from './Messages';
import MessageInput from '../components/MessageInput';
import ChatHeader from './ChatHeader';
import Dropdown from '../components/Dropdown';
import Settings from './Settings';

function Main({
  activeChat,
  sendMessage,
  updateSelectModel,
  isGeneratingAnswer,
  isLoading,
  selectedModel,
  models,
  viewOptions,
  options,
  updateOption,
  regenerate,
  restoreOptions,
  editMessage,
}: {
  activeChat: Chat | undefined;
  sendMessage: (message: string) => void;
  updateSelectModel: (model: string) => void;
  isGeneratingAnswer: boolean;
  isLoading: boolean;
  selectedModel: Chat['model'];
  models: Chat['model'][];
  viewOptions: boolean;
  options: Options;
  updateOption: (target: string, value: string) => void;
  regenerate: () => void;
  restoreOptions: () => void;
  editMessage: () => void;
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
            <Settings
              options={options}
              updateOption={updateOption}
              restoreOptions={restoreOptions}
            />
          ) : activeChat ? (
            <Messages
              activeChat={activeChat}
              isLoading={isLoading}
              regenerate={regenerate}
              editMessage={editMessage}
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
