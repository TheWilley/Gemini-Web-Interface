import { Chat, Options } from '../global/types';
import Messages from './Messages';
import MessageInput from '../components/MessageInput';
import ChatHeader from './ChatHeader';
import DropdownSelect from '../components/DropdownSelect';
import Settings from './Settings';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import Dropdown from '../components/Dropdown';

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
  cloneChat,
  togglePinMessage,
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
  cloneChat: (chatId: string, messageId?: string) => void;
  togglePinMessage: (chatId: string, messageId: string) => void;
}) {
  return (
    <div className='relative flex w-full items-center justify-center'>
      <div className='absolute left-2 top-2'>
        {!viewOptions && (
          <div className='flex'>
            <DropdownSelect
              options={models}
              onSelect={(selected) => {
                updateSelectModel(selected);
              }}
              value={selectedModel.key}
            />
            {activeChat && activeChat.messages.filter((m) => m.pinned).length > 0 && (
              <Dropdown
                text='Pinned Messages'
                options={activeChat.messages.map((m) => {
                  if (m.pinned) {
                    return {
                      content: (
                        <a
                          href={`#${m.id}`}
                          className='grid w-96 grid-cols-[30%_60%_20%] items-center overflow-hidden'
                        >
                          <div>{m.id.slice(0, 7)}</div>
                          <div>{m.text.slice(0, 42)}...</div>
                          <div>
                            <FontAwesomeIcon icon={faArrowRight} />
                          </div>
                        </a>
                      ),
                    };
                  }
                })}
              />
            )}
          </div>
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
            <>
              <Messages
                activeChat={activeChat}
                isLoading={isLoading}
                regenerate={regenerate}
                editMessage={editMessage}
                cloneChat={cloneChat}
                togglePinMessage={togglePinMessage}
              />
            </>
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
