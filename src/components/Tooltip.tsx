import { ReactNode } from 'react';
import classNames from '../utils/classNames';

function Tooltip({
  text,
  position,
  children,
  classes,
  offsetX = 0,
  offsetY = 0,
}: {
  text: string;
  position: 'left' | 'right' | 'bottom' | 'top';
  children: ReactNode;
  classes?: string;
  offsetX?: number;
  offsetY?: number;
}) {
  const tooltipPositionStyles = {
    top: {
      bottom: '100%',
      left: '50%',
      marginBottom: '2px',
      transform: `translateX(calc(-50% + ${offsetX}px)) translateY(${offsetY}px)`,
    },
    right: {
      left: '100%',
      top: '50%',
      marginLeft: '2px',
      transform: `translateX(${offsetX}px) translateY(calc(-50% + ${offsetY}px))`,
    },
    bottom: {
      top: '100%',
      left: '50%',
      marginTop: '2px',
      transform: `translateX(calc(-50% + ${offsetX}px)) translateY(${offsetY}px)`,
    },
    left: {
      right: '100%',
      top: '50%',
      marginRight: '2px',
      transform: `translateX(${offsetX}px) translateY(calc(-50% + ${offsetY}px))`,
    },
  };

  for (const positionKey in tooltipPositionStyles) {
    if (positionKey === 'top' || positionKey === 'bottom') {
      tooltipPositionStyles[positionKey as keyof typeof tooltipPositionStyles].transform =
        `translateX(calc(-50% + ${offsetX}px)) translateY(${offsetY}px)`;
    } else {
      tooltipPositionStyles[positionKey as keyof typeof tooltipPositionStyles].transform =
        `translateX(${offsetX}px) translateY(calc(-50% + ${offsetY}px))`;
    }
  }

  return (
    <span className={classNames('group/tooltip relative inline-block', classes)}>
      {children}
      <span
        className={classNames(
          'pointer-events-none absolute z-10 w-fit scale-75 whitespace-nowrap rounded-md bg-gray-300 px-2 py-1 text-xs text-gray-900 opacity-0 transition-all group-hover/tooltip:scale-100 group-hover/tooltip:opacity-100'
        )}
        style={tooltipPositionStyles[position]}
      >
        {text}
      </span>
    </span>
  );
}

export default Tooltip;
