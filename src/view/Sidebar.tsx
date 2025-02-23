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
import IconWithText from '../components/IconWithText';
import classNames from '../utils/classNames';
import HideableBlock from '../components/HideableBlock';
import { ChatInfo } from '../global/types';

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
        <Button
          onclick={() => {
            setPermanentlyExpanded(!permantelyExpanded);
            toggleSidebar();
          }}
        >
          <FontAwesomeIcon icon={faBars} className='h-4 w-4' />
        </Button>
      </div>

      <div className='mt-8'>
        <Button onclick={() => newChat()} disabled={!chatIsSelected} strong bold>
          <IconWithText icon={faPlus} text='New Chat' hideText={isCollapsed} />
        </Button>
      </div>

      <div className='mt-8 flex-grow text-sm'>
        <HideableBlock isHidden={isCollapsed || chatsInfo.length === 0}>
          <h2 className='mb-2 ml-2 text-sm font-bold text-text-strong'>Chats</h2>
          <ul className='m-0 list-none'>
            {chatsInfo.map((chatInfo) => (
              <li key={chatInfo.id}>
                <Button
                  onclick={() => selectChat(chatInfo.id)}
                  fillWidth
                  active={chatInfo.active}
                >
                  <IconWithText
                    icon={faAlignLeft}
                    text={chatInfo.name || 'Generating name...'}
                  />
                </Button>
              </li>
            ))}
          </ul>
        </HideableBlock>
      </div>

      <div className='ml-3 mt-auto text-sm'>
        <HideableBlock isHidden={isCollapsed}>
          <Button onclick={clearChats}>
            <IconWithText icon={faX} text={'Clear Chats'} />
          </Button>
          <br />
          <Button onclick={exportChats}>
            <IconWithText icon={faFileExport} text={'Export Chats'} />
          </Button>
          <br />
          <Button onclick={() => document.getElementById('importChat')?.click()}>
            <IconWithText icon={faFileImport} text={'Import Chats'} />
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
