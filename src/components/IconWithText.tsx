import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import { ReactNode } from 'react';
import classNames from '../utils/classNames';

function IconWithElement({
  icon,
  text,
  hideText,
  classes,
}: {
  icon: FontAwesomeIconProps['icon'];
  text: ReactNode;
  hideText?: boolean;
  classes?: string;
}) {
  return (
    <span className={classNames('flex items-center', classes)}>
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
