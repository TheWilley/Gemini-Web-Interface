import { useState, useEffect, useRef } from 'react';
import Button from './Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import classNames from '../utils/classNames';
import useOutsideAlerter from '../hooks/useOutsideAlerter';

function DropdownSelect({
  options,
  onSelect,
  value,
  classes,
}: {
  options: {
    name: string;
    key: string;
  }[];
  onSelect: (selected: string) => void;
  value: string | undefined;
  classes?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => {
    setIsOpen(false);
  });
  useEffect(() => {
    const selected = options.find((option) => option.key === value);
    setSelectedOption(selected ? selected.name : null);
  }, [value, options]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (key: string) => {
    setSelectedOption(options.find((option) => option.key === key)?.name || null);
    onSelect(key);
    setIsOpen(false);
  };

  return (
    <div className={classNames('relative', classes)} ref={wrapperRef}>
      <Button onclick={toggleDropdown} bold strong>
        {selectedOption || 'Select an option'}
        <span className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </Button>

      {isOpen && (
        <ul className='absolute left-0 z-10 mt-2 max-h-60 w-60 overflow-y-auto rounded-md bg-overlay p-3 shadow-lg'>
          {options.map((option) => (
            <li
              key={option.key}
              onClick={() => handleOptionClick(option.key)}
              className='flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-highlight'
            >
              {option.name}
              {option.name === selectedOption && (
                <FontAwesomeIcon icon={faCheckCircle} className='ml-auto' />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DropdownSelect;
