/**
 * Join multiple class names into a single string
 * @param classes The class names to join together (can be strings, undefined, or booleans)
 * @returns A single string of class names
 */
export default function classNames(...classes: (string | undefined | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}
