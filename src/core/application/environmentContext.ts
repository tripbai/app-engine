export type Environment =
  | "test"
  | "staging"
  | "production"
  | "development"
  | null;

let environment: Environment = null;

export const setEnvironmentContext = (name: Exclude<Environment, null>) => {
  if (environment === null) environment = name;
};

export const getEnvironmentContext = (): Exclude<Environment, null> => {
  return environment ?? "test";
};
