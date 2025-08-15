import * as Core from "../module/types";

const validRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

/**
 * Returns the current timestamp in UTC
 * @returns {string} The current timestamp in the format "YYYY-MM-DD HH:mm:ss"
 */
export const getTimestampNow = () => {
  const current = Date.now();
  return normalizeTimestamp(new Date(current));
};

/**
 * Checks if a timestamp is valid
 * @param date The timestamp to check
 * @returns {boolean} True if the timestamp is valid, false otherwise
 */
export const isValidTimestamp = (date: string) => {
  if (!validRegex.test(date)) {
    return false;
  }
  const newdate = date.replace(" ", "T") + ".000Z";
  const dateobj = new Date(newdate);
  const normalized = normalizeTimestamp(dateobj);
  return !isNaN(dateobj.getTime()) && normalized === date;
};

/**
 * Normalizes a timestamp to the format "YYYY-MM-DD HH:mm:ss"
 * @param date The timestamp to normalize
 * @returns {string} The normalized timestamp
 */
export const normalizeTimestamp = (date: Date): Core.TimeStamp => {
  const Y = date.getUTCFullYear();
  const MM = pad(date.getUTCMonth() + 1);
  const DD = pad(date.getUTCDate());
  const hh = pad(date.getUTCHours());
  const mi = pad(date.getUTCMinutes());
  const ss = pad(date.getUTCSeconds());
  return `${Y}-${MM}-${DD} ${hh}:${mi}:${ss}` as Core.TimeStamp;
};

const pad = (n: number) => n.toString().padStart(2, "0");
