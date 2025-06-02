import * as fs from "fs"
import { Application } from "../../application";
import { AppENV } from "../../helpers/env";
import { AbstractMySqlConfig } from "./mysql-config.interface";

export class MySqlEnvConfig implements AbstractMySqlConfig {

  getHost(): string {
    return AppENV.get('MYSQL_HOST_NAME')
  }

  getUsername(): string {
    return AppENV.get('MYSQL_USERNAME')
  }

  getPassword(): string {
    return AppENV.get('MYSQL_PASSWORD')
  }

  getDatabaseName(): string {
    return AppENV.get('MYSQL_DATABASE')
  }

  useSSL(): boolean {
    return AppENV.get('MYSQL_USE_SSL') === 'true'
  }

  getCertificate(): string {
    const environment = Application.environment()
    const certificatePath = `${Application.root()}/${environment}.mysql.crt.pem`
    return fs.readFileSync(certificatePath).toString()
  }

}