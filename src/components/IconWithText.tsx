import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import { ReactNode } from 'react';

function IconWithElement({
  icon,
  text,
  hideText,
}: {
  icon: FontAwesomeIconProps['icon'];
  text: ReactNode;
  hideText?: boolean;
}) {
  return (
    <span className='flex items-center'>
      <FontAwesomeIcon icon={icon} />
      {!hideText && (
        <span className='ml-5 overflow-hidden text-ellipsis whitespace-nowrap transition-opacity duration-300'>
          {text}
        </span>
      )}
    </span>
  );
}

export default IconWithElement;
