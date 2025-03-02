import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import { ChangeEvent } from 'react';

function Input({
  label,
  name,
  value,
  onChange,
  type = 'text',
  icon,
  disabled,
  minValue,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type: 'text' | 'number';
  icon: FontAwesomeIconProps['icon'];
  disabled: boolean;
  minValue?: number;
}) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    if (type === 'number') {
      if (minValue && +newValue < minValue) {
        newValue = minValue.toString();
      }
    }

    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: newValue,
      },
    };

    onChange(syntheticEvent);
  };

  return (
    <>
      <div className='flex w-full flex-row-reverse items-stretch'>
        <input
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          type={type}
          placeholder={label}
          aria-label={label}
          className={`peer block w-full appearance-none rounded rounded-bl-none rounded-tl-none border border-border bg-overlay px-3 py-3 transition-colors duration-300 focus:border-primary focus:outline-none focus:ring-0 ${
            disabled ? 'bg-gray-200' : ''
          }`}
          disabled={disabled}
          min={type === 'number' && minValue ? minValue : undefined} // Apply minValue only if type is 'number'
        />

        <div
          className={`flex items-center rounded rounded-br-none rounded-tr-none border border-r-0 border-border px-3 py-3 ${
            disabled ? 'bg-gray-200' : ''
          }`}
        >
          {<FontAwesomeIcon icon={icon} />}
        </div>
      </div>
    </>
  );
}

export default Input;
