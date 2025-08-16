import { Environment } from "./environmentContext";
const yargs = require("yargs");

export type CommandOptions = {
  env: Environment;
  framework: "express" | "fastify";
  port: number;
};

export const mountCommandOptions = (): CommandOptions => {
  return yargs
    .option("env", {
      alias: "e",
      description: "Sets the environment",
      type: "string",
    })
    .option("framework", {
      alias: "r",
      description: "Sets the web application framework",
      type: "string",
    })
    .option("port", {
      alias: "p",
      description: "Sets the port",
      type: "number",
    }).argv;
};
