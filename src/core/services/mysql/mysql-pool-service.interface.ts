import { MySqlPool } from "./mysql";

export abstract class AbstractMySqlPoolService {
  abstract createOrGetPool(): Promise<MySqlPool>
}