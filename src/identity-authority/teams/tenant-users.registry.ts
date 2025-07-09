import { inject, injectable } from "inversify";
import { RegistryRepository } from "../../core/orm/repository/registry-repository";
import { TeamModel } from "./team.model";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { Core } from "../../core/module/module";
import { IAuthDatabaseProvider } from "../providers/iauth-database.provider";

@injectable()
export class TenantUsersRegistry extends RegistryRepository<TeamModel> {

  constructor(
    @inject(IAuthDatabaseProvider) public readonly abstractDatabaseProvider: AbstractDatabaseProvider
  ){
    super({
      collection: 'teams',
      reference: 'tenant_id',
      modelInstance: new TeamModel(),
      databaseProvider: abstractDatabaseProvider
    })
  }

  /**
   * Retrieves all the users that have access 
   * to a specific Tenant instance
   */
  async getActiveUserIdsOfTenantIds(tenantId: Core.Entity.Id): Promise<Array<Core.Entity.Id>>{
    const allModels = await this.getAll({
      foreignKeyValue: tenantId
    })
    const TeamModels = allModels.filter(model => {
      return model.is_active
    })
    return TeamModels.map(model => {
      return model.user_id
    })
  }

  async doesTenantHaveTeamsRegistry(tenantId: Core.Entity.Id): Promise<boolean> {
    const allModels = await this.getAll({
      foreignKeyValue: tenantId
    })
    return allModels.length > 0
  }

}