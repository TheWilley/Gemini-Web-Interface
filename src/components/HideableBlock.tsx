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
        'transition-opacity duration-500 ease-in-out',
        isHidden ? 'opacity-0 duration-200' : 'opacity-100',
        'group',
        classes
      )}
    >
      <div className='transition-opacity duration-500 group-hover:opacity-100'>
        {children}
      </div>
    </div>
  );
}

export default HideableBlock;
