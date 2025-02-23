import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome';

function IconWithText({
  icon,
  text,
  hideText,
}: {
  icon: FontAwesomeIconProps['icon'];
  text: string;
  hideText?: boolean;
}) {
  return (
    <span className='flex items-center'>
      <FontAwesomeIcon icon={icon} />
      {!hideText && (
        <span className='ml-5 whitespace-nowrap transition-opacity duration-300'>
          {text}
        </span>
      )}
    </span>
  );
}

export default IconWithText;
