import { ReactNode } from 'react';
import classNames from '../utils/classNames';

function Tooltip({
  text,
  position,
  children,
  classes,
}: {
  text: string;
  position: 'left' | 'right' | 'bottom' | 'top';
  children: ReactNode;
  classes?: string;
}) {
  const tooltipPositionClasses = {
    top: 'bottom-full mb-2 left-1/2 transform -translate-x-1/2',
    right: 'left-full ml-2 top-1/2 transform -translate-y-1/2',
    bottom: 'top-full mt-2 left-1/2 transform -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 transform -translate-y-1/2',
  };

  return (
    <span className={classNames('group/tooltip relative inline-block', classes)}>
      {children}
      <span
        className={classNames(
          'absolute z-10 w-fit scale-75 whitespace-nowrap rounded-md bg-gray-300 px-2 py-1 text-xs text-gray-900 opacity-0 transition-all group-hover/tooltip:scale-100 group-hover/tooltip:opacity-100',
          tooltipPositionClasses[position]
        )}
      >
        {text}
      </span>
    </span>
  );
}

export default Tooltip;
