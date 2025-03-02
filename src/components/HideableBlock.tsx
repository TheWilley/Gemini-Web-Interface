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
        'transition-opacity duration-300',
        isHidden ? '0' : 'opacity-100',
        classes
      )}
    >
      {!isHidden && children}
    </div>
  );
}

export default HideableBlock;
