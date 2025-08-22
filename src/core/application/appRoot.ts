/** Path to the application root */
let _r: string | null = null;

/**
 * Sets or retrieves the path to Application root directory
 * @param path - to initialize application root path
 * @returns
 */
export const appRoot = (path?: string | undefined) => {
  if (path && _r === null) _r = path;
  return _r;
};
