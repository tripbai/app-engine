import * as fs from "fs";
import { AbstractMySqlConfig } from "./mysql-config.interface";
import { getEnv } from "../../application/appEnv";
import { appRoot } from "../../application/appRoot";
import { getEnvironmentContext } from "../../application/environmentContext";

export class MySqlEnvConfig implements AbstractMySqlConfig {
  getHost(): string {
    return getEnv("MYSQL_HOST_NAME");
  }

  getUsername(): string {
    return getEnv("MYSQL_USERNAME");
  }

  getPassword(): string {
    return getEnv("MYSQL_PASSWORD");
  }

  getDatabaseName(): string {
    return getEnv("MYSQL_DATABASE");
  }

  useSSL(): boolean {
    return getEnv("MYSQL_USE_SSL") === "true";
  }

  getCertificate(): string {
    const environment = getEnvironmentContext();
    const certificatePath = `${appRoot()}/vault/${environment}.mysql.crt.pem`;
    return fs.readFileSync(certificatePath).toString();
  }
}
