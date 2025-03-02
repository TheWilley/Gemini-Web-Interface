import { useRef, useState } from 'react';
import Button from '../components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import useOutsideAlerter from '../hooks/useOutsideAlerter';
import classNames from '../utils/classNames';

function Ellipsis({
  options,
  onClick,
  classes,
}: {
  options: {
    name: string;
    key: string;
  }[];
  onClick: (selected: string) => void;
  classes?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => {
    setIsOpen(false);
  });

  const toggleEllipsis = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (key: string) => {
    onClick(key);
    setIsOpen(false);
  };

  return (
    <span className={classNames('relative', classes)} ref={wrapperRef}>
      <div className='absolute top-1/2 -translate-y-1/2'>
        <Button onclick={toggleEllipsis} bold strong>
          <FontAwesomeIcon icon={faEllipsisVertical} />
        </Button>
      </div>

      {isOpen && (
        <ul className='absolute left-16 top-1/2 z-10 mt-2 max-h-60 w-60 -translate-y-1/2 overflow-y-auto rounded-md bg-overlay shadow-lg'>
          {options.map((option) => (
            <li
              key={option.key}
              onClick={() => handleOptionClick(option.key)}
              className='flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-highlight'
            >
              {option.name}
            </li>
          ))}
        </ul>
      )}
    </span>
  );
}

export default Ellipsis;
