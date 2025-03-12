import { ReactNode, useState } from 'react';
import Button from './Button';
import classNames from '../utils/classNames';

function Dropdown({
  options,
  text,
  classes,
}: {
  options: (
    | {
        content: ReactNode;
      }
    | undefined
  )[];
  text: string;
  classes?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = () => {
    setIsOpen(false);
  };

  return (
    <div className={classNames('relative', classes)}>
      <Button onclick={toggleDropdown} bold strong>
        {text}
        <span className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </Button>

      {isOpen && (
        <ul className='absolute left-0 z-10 mt-2 max-h-60 w-96 overflow-y-auto rounded-md bg-overlay shadow-lg'>
          {options.map(
            (option, index) =>
              option && (
                <li
                  key={index}
                  onClick={() => handleOptionClick()}
                  className='flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-highlight'
                >
                  {option.content}
                </li>
              )
          )}
        </ul>
      )}
    </div>
  );
}

export default Dropdown;
