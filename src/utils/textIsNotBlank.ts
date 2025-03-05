/**
 * Checks if text is blank or not
 * @param text The text to check.
 * @returns The result of the check.
 */
export default function textIsNotBlank(text: string) {
  if (text.length) {
    return true;
  } else {
    return false;
  }
}
