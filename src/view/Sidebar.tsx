import { useState, useEffect } from 'react';
import {
  faAlignLeft,
  faBars,
  faFileExport,
  faFileImport,
  faPlus,
  faX,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../components/Button';
import IconWithElement from '../components/IconWithText';
import classNames from '../utils/classNames';
import HideableBlock from '../components/HideableBlock';
import { ChatInfo } from '../global/types';
import Tooltip from '../components/Tooltip';

function Sidebar({
  chatsInfo,
  newChat,
  selectChat,
  chatIsSelected,
  clearChats,
  exportChats,
  importChats,
}: {
  chatsInfo: ChatInfo[];
  newChat: () => void;
  selectChat: (chatId: string) => void;
  chatIsSelected: boolean;
  clearChats: () => void;
  exportChats: () => void;
  importChats: (file: File) => void;
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [permantelyExpanded, setPermanentlyExpanded] = useState(false);

  const toggleSidebar = () => {
    if (isHovered) return;
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    if (isHovered) {
      setIsCollapsed(false);
    } else {
      if (!permantelyExpanded) {
        setIsCollapsed(true);
      }
    }
  }, [isHovered, permantelyExpanded]);

  return (
    <div
      className={classNames(
        'flex h-screen flex-col overflow-hidden bg-overlay p-3 transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-2/6'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div>
        <Tooltip position='bottom' text={permantelyExpanded ? 'Collapse' : 'Keep open'}>
          <Button
            onclick={() => {
              setPermanentlyExpanded(!permantelyExpanded);
              toggleSidebar();
            }}
          >
            <FontAwesomeIcon icon={faBars} className='h-4 w-4' />
          </Button>
        </Tooltip>
      </div>

      <div className='mt-8'>
        <Tooltip position='bottom' text='New chat'>
          <Button onclick={() => newChat()} disabled={!chatIsSelected} strong bold>
            <IconWithElement icon={faPlus} text='New Chat' hideText={isCollapsed} />
          </Button>
        </Tooltip>
      </div>

      <div className='mt-8 flex-grow text-sm'>
        <HideableBlock isHidden={isCollapsed || chatsInfo.length === 0}>
          <h2 className='mb-2 ml-2 text-sm font-bold text-text-strong'>Chats</h2>
          <ul className='m-0 list-none'>
            {chatsInfo.map((chatInfo) => (
              <li key={chatInfo.id}>
                <Tooltip
                  position='right'
                  text={chatInfo.name || 'Generating chat name...'}
                >
                  <Button
                    onclick={() => selectChat(chatInfo.id)}
                    fillWidth
                    active={chatInfo.active}
                  >
                    <IconWithElement
                      icon={faAlignLeft}
                      text={
                        chatInfo.name || (
                          <div className='max-w-full animate-pulse'>
                            <div className='mb-2 block h-1 w-56 rounded-full bg-gray-300 font-sans text-5xl font-semibold leading-tight tracking-normal text-inherit antialiased'>
                              &nbsp;
                            </div>
                            <div className='block h-1 w-72 rounded-full bg-gray-300 font-sans text-base font-light leading-relaxed text-inherit antialiased'>
                              &nbsp;
                            </div>
                          </div>
                        )
                      }
                    />
                  </Button>
                </Tooltip>
              </li>
            ))}
          </ul>
        </HideableBlock>
      </div>

      <div className='ml-3 mt-auto text-sm'>
        <HideableBlock isHidden={isCollapsed}>
          <Button onclick={clearChats}>
            <IconWithElement icon={faX} text={'Clear Chats'} />
          </Button>
          <br />
          <Button onclick={exportChats}>
            <IconWithElement icon={faFileExport} text={'Export Chats'} />
          </Button>
          <br />
          <Button onclick={() => document.getElementById('importChat')?.click()}>
            <IconWithElement icon={faFileImport} text={'Import Chats'} />
          </Button>
        </HideableBlock>
      </div>

      <div className='hidden'>
        <input
          id='importChat'
          type='file'
          accept='.json'
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              importChats(file);
            }
          }}
        />
      </div>
    </div>
  );
}

export default Sidebar;
