import { getTimestampNow } from "../utilities/timestamp";
import { getEnvironmentContext } from "./environmentContext";

export const logError = (params: {
  severity: number;
  message: string;
  data: Record<string, any>;
}) => {
  const timestamp = getTimestampNow();
  const stack = new Error().stack;
  if (getEnvironmentContext() !== "test") {
    console.log(
      `${timestamp} | ERROR | ${params.message} | ${JSON.stringify(
        params.data
      )}`
    );
  }
};

export const logInfo = (message: string) => {
  const timestamp = getTimestampNow();
  if (getEnvironmentContext() !== "test") {
    console.log(`${timestamp} | INFO | ${message}`);
  }
};
