/**
 * The bootstrap file is the main entry point for the Node.js application. It
 * initializes essential components such as middleware, environment variables,
 * and utilities required for the app to function. This file also creates and
 * configures routers, dynamically linking them to their respective controllers
 * or handler functions, ensuring a cohesive routing structure. By centralizing
 * these processes, it provides a streamlined and maintainable startup flow.
 *
 * After completing initialization, the bootstrap file starts the application
 * server, setting it to listen on the designated port. It logs the startup
 * status, indicating that the application is ready to handle incoming requests.
 * This modular design ensures the application is fully prepared and provides a
 * solid foundation for delivering its core functionality.
 */

import {
  Environment,
  getEnvFilePath,
  setEnvironmentContext,
} from "./environmentContext";
import { setEnv } from "./appEnv";
import { mountCommandOptions } from "./commandOptions";
import { bind } from "../../bindings";
import { appContainer } from "./appContainer";
import { providers } from "../../providers";
import { Request, Response, NextFunction } from "express";
import { getRegisteredRoutes } from "./routeRegistry";
import { HttpRouterAdapter } from "../router/http-router-adapter";
import { MySQLPoolManager } from "../services/mysql/mysql-pool-manager";
import { logInfo } from "./appLogger";
import { events } from "../../events";
import { appRoot } from "./appRoot";
import * as fs from "fs";

const path = require("path");
const cors = require("cors");
const APP_ROOT = path.resolve(__dirname, "../../../");

const options = mountCommandOptions();

// Loads env file, depending on which environment is selected
const envFilePath = getEnvFilePath(APP_ROOT, options.env);
if (!fs.existsSync(envFilePath)) {
  throw new Error(`Environment file not found: ${envFilePath}`);
}
require("dotenv").config({ path: envFilePath });

// Sets the port
const port = options.port ?? 3000;
setEnvironmentContext(options.env ?? "test");
appRoot(APP_ROOT);

// Loads up environment variables to AppENV singleton
for (const key in process.env) {
  setEnv(key, process.env[key] ?? "");
}

// Binds the application container and registers providers
bind(appContainer());
providers(appContainer());

// Loads the web framework
let framework = "express";
if ("router" in options) {
  /** @TODO implement fastify */
}

if (framework === "express") {
  const express = require("express");
  const webAppFramework = express();
  webAppFramework.use(
    (
      request: Request & { clientIp?: string; userAgent?: string },
      response: Response,
      next: NextFunction
    ) => {
      request.clientIp = request.ip;
      request.userAgent = request.headers["user-agent"];
      next();
    }
  );
  webAppFramework.use(require("express-fileupload")());

  webAppFramework.use(cors());
  webAppFramework.use(express.json());

  // Registers routes
  const Router = appContainer().get(HttpRouterAdapter);
  getRegisteredRoutes().forEach((routeConfig) => {
    const Controller = appContainer().get(routeConfig.Controller) as object & {
      [key: string]: (data: any) => Promise<any>;
    };
    Router.register(
      webAppFramework,
      routeConfig.path,
      routeConfig.method,
      async (data) => {
        return await Controller[routeConfig.handler](data);
      }
    );
  });

  /** Events Registry */
  events(appContainer());

  /** For all routes not found */
  webAppFramework.use((request: Request, response: Response) => {
    response.status(404);
    response.json({ error: "path not found" });
  });

  webAppFramework.listen(port, () => {
    console.log(`App listening on port ${port}, environment: ${options.env}`);
  });
}

process.on("SIGINT", async () => {
  await MySQLPoolManager.closeAllPools();
  logInfo("Successfully closed all mysql pool");
  process.exit();
});

setInterval(async () => {
  logInfo("Closing all unused pool");
  await MySQLPoolManager.closeUnusedPool();
}, 60 * 2000);
