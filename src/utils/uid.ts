/**
 * Generates a unique ID.
 * @returns The unique ID.
 */
export default function uid() {
  return Date.now() + Math.random().toString().replace('.', '');
}
