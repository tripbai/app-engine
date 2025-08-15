import { MySqlPool } from "./mysql.types";

export abstract class AbstractMySqlPoolService {
  abstract createOrGetPool(): Promise<MySqlPool>;
}
