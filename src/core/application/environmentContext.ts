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

export const getEnvFilePath = (appRoot: string, environment: Environment) => {
  return `${appRoot}/.env.${environment}`;
};
