import { ReactNode, useRef, useState } from 'react';
import Button from '../components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import useOutsideAlerter from '../hooks/useOutsideAlerter';
import classNames from '../utils/classNames';

function Ellipsis({
  options,
  onclick,
  classes,
}: {
  options: {
    display: ReactNode;
    key: string;
    onclick: () => void;
  }[];
  onclick: () => void;
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

  const handleOptionClick = (optionOnclick: () => void) => {
    setIsOpen(false);
    optionOnclick();
  };

  return (
    <span className='relative' ref={wrapperRef} onClick={onclick}>
      <div className={classNames('absolute top-1/2 -translate-y-1/2', classes)}>
        <Button onclick={toggleEllipsis} bold strong>
          <FontAwesomeIcon icon={faEllipsisVertical} />
        </Button>
      </div>

      {isOpen && (
        <ul className='absolute left-12 top-1/2 z-10 mt-2 max-h-60 w-60 -translate-y-1/2 overflow-y-auto rounded-md bg-overlay shadow-lg'>
          {options.map((option) => (
            <li
              key={option.key}
              onClick={() => handleOptionClick(option.onclick)}
              className='flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-highlight'
            >
              {option.display}
            </li>
          ))}
        </ul>
      )}
    </span>
  );
}

export default Ellipsis;
