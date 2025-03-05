import classNames from '../utils/classNames';

function HideableBlock({
  children,
  isHidden,
  classes,
}: {
  children: React.ReactNode;
  isHidden: boolean;
  classes?: string;
}) {
  return (
    <div
      className={classNames(
        'transition-opacity delay-75 duration-500',
        isHidden ? 'invisible opacity-0' : 'visible opacity-100',
        classes
      )}
    >
      {children}
    </div>
  );
}

export default HideableBlock;
