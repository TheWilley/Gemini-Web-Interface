import { useEffect } from 'react';

/**
 * Hook that alerts clicks outside of the passed ref
 * @see https://stackoverflow.com/a/42234988
 */
export default function useOutsideAlerter(
  ref: React.RefObject<HTMLElement>,
  callback: () => void
): void {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: MouseEvent): void {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      // Unbind the event listener on cleanup
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback, ref]);
}
