import { inject, injectable } from "inversify"
import { MySqlEnvConfig } from "./mysql-env-config"
import { AbstractMySqlConfig } from "./mysql-config.interface"
import { PoolConfig } from "./mysql"
import { MySQLPoolManager } from "./mysql-pool-manager"
import { AbstractMySqlPoolService } from "./mysql-pool-service.interface"

/**
 * MySQL Pool Service
 * This service is responsible for creating and managing MySQL connection pools.
 */
@injectable()
export class MySqlPoolService implements AbstractMySqlPoolService {

  constructor(
    @inject(AbstractMySqlConfig) public readonly MySqlConfig: AbstractMySqlConfig
  ){}

  async createOrGetPool(){
    const hostname = this.MySqlConfig.getHost()
    let poolConfig: PoolConfig = Object.create(null)
    poolConfig = {
      database: this.MySqlConfig.getDatabaseName(),
      user: this.MySqlConfig.getUsername(),
      password: this.MySqlConfig.getPassword(),
      connectionLimit: 10,
      acquireTimeout: 10000,
      waitForConnections: true
    }
    if (this.MySqlConfig.useSSL()) {
      poolConfig.ssl = {
        ca: this.MySqlConfig.getCertificate()
      }
    }
    await MySQLPoolManager.connect(hostname, poolConfig)
    return MySQLPoolManager.getPool(hostname)
  }

}