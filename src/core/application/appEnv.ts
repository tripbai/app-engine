import { LogicException } from "../exceptions/exceptions";

const _env: { [key: string]: any } = {};

/**
 * Returns environment variables defined
 * @param key - key of the environment variable
 * @returns string
 */
export const getEnv = (key: string): string => {
  if (_env[key] === undefined) {
    throw new LogicException({
      message: "application envar must be provided before used",
      data: { key: key },
    });
  }
  return _env[key];
};

/**
 * Sets environment variable value, only if not already set
 * @param key - key of the environment variable
 * @param value - value of the environment variable
 * @returns string
 */
export const setEnv = (key: string, value: string): void => {
  if (_env[key] !== undefined) {
    throw new LogicException({
      message: "application envar can only be assigned once",
      data: { key: key },
    });
  }
  _env[key] = value;
};
