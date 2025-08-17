import { setEnv } from "../../application/appEnv";
import { appRoot } from "../../application/appRoot";
import { setEnvironmentContext } from "../../application/environmentContext";
import { MySqlEnvConfig } from "../../services/mysql/mysql-env-config";
import { MySQLPoolManager } from "../../services/mysql/mysql-pool-manager";
import { MySqlPoolService } from "../../services/mysql/mysql-pool-service";
const { Umzug, JSONStorage } = require("umzug");
const path = require("path");
const fs = require("fs");

type UmzugDatabaseClient = {
  query: (sql: string) => Promise<void>;
  end: () => Promise<void>;
};

/**
 * Retrieves the path to the env file
 * @param env
 * @param rootdir
 * @returns
 */
const get_env_path = (env: string, rootdir: string) => {
  switch (env) {
    case "development":
      return `${rootdir}/.env.development`;
    case "staging":
      return `${rootdir}/.env.staging`;
    case "production":
      return `${rootdir}/.env.production`;
    default:
      return `${rootdir}/.env.test`;
  }
};

/**
 * Creates a new umzug object
 * @param client
 * @param cwd
 * @returns
 */
const create_umzug = (client: UmzugDatabaseClient, cwd: string) => {
  const pattern = "migrations/up/*.sql";
  return new Umzug({
    migrations: {
      glob: pattern,
      cwd,
      resolve: ({
        name,
        path: uppath,
        context,
      }: {
        name: string;
        path: string;
        context: UmzugDatabaseClient;
      }) => {
        const basename = path.basename(uppath);
        const downpath = path.join(cwd, "migrations/down", basename);
        return {
          name: basename,
          up: async () => {
            const sql = fs.readFileSync(uppath, "utf8");
            await context.query(sql);
          },
          down: async () => {
            const sql = fs.readFileSync(downpath, "utf8");
            await context.query(sql);
          },
        };
      },
    },
    context: client,
    storage: new JSONStorage({
      path: path.join(cwd, "migrations/.umzug-log.json"),
    }),
    logger: console,
  });
};

/**
 * Gracefully kills the application
 */
const die = async () => {
  await MySQLPoolManager.closeAllPools();
  process.exit();
};

export const run = async (params: {
  rootdir: string;
  cwd: string;
  options: {
    env?: "test" | "staging" | "production" | "development" | null;
    action?: string;
  };
}) => {
  try {
    const environment = params.options.env ?? "development";
    const action = params.options.action ?? "next";

    /** Loads env file, depending on which environment is selected */
    require("dotenv").config({
      path: get_env_path(environment, params.rootdir),
    });

    /** Loads up environment variables to AppENV singleton */
    for (const key in process.env) {
      setEnv(key, process.env[key] ?? "");
    }

    /** Boots the application */
    setEnvironmentContext(environment);
    appRoot(params.rootdir);

    const mySqlPoolService = new MySqlPoolService(new MySqlEnvConfig());

    const ConnectionPool = await mySqlPoolService.createOrGetPool();

    const client = {
      query: async (sql: string) => {
        try {
          const statements = sql.split(/;\s*$/m);
          for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim() === "") continue;
            await new Promise<void>((resolve, reject) => {
              ConnectionPool.query(statement, [], (error, results) => {
                if (error) {
                  console.log(error);
                  return reject(error);
                }
                resolve();
              });
            });
          }
          return;
        } catch (error) {
          throw error;
        }
      },
      end: async () => {
        return;
      },
    };

    const uzmug = create_umzug(client, params.cwd);
    switch (action) {
      case "next":
        console.log("Processing latest migration");
        await uzmug.up({ step: 1 });
        break;
      case "up":
        const allMigrations = await uzmug.migrations();
        console.log(
          "Running all discovered migrations:",
          allMigrations.map((m: { name: string }) => m.name)
        );
        await uzmug.up();
        break;
      case "down":
        await uzmug.down();
        break;
      default:
        throw new Error("Invalid action option");
    }
    ConnectionPool.end();
  } catch (error) {
    console.log(error);
  }

  await die();
};
