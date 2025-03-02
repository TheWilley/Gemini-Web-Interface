import classNames from '../utils/classNames';

function Button({
  onclick,
  children,
  fillWidth,
  active,
  disabled,
  strong,
  bold,
  classes,
}: {
  onclick: () => void;
  children: React.ReactNode;
  fillWidth?: boolean;
  active?: boolean;
  disabled?: boolean;
  strong?: boolean;
  bold?: boolean;
  classes?: string;
}) {
  return (
    <button
      onClick={() => !disabled && onclick()}
      className={classNames(
        'rounded-full p-3 transition-all duration-[0.1s] ease-in-out hover:bg-highlight',
        fillWidth && 'w-full',
        strong && 'text-text-strong',
        bold && 'font-bold',
        active && '!bg-primary text-text-strong',
        disabled && 'cursor-default !bg-[#202122] text-text',
        classes
      )}
    >
      <span className={disabled ? 'opacity-40' : 'opacity-100'}>{children}</span>
    </button>
  );
}

export default Button;
