import { inject, injectable } from "inversify";
import { RegistryRepository } from "../../core/orm/repository/registry-repository";
import { TeamModel } from "./team.model";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { Core } from "../../core/module/module";
import { DataIntegrityException } from "../../core/exceptions/exceptions";
import { IAuthDatabaseProvider } from "../providers/iauth-database.provider";

@injectable()
export class UserAccessRegistry extends RegistryRepository<TeamModel> {

  constructor(
    @inject(IAuthDatabaseProvider) public readonly abstractDatabaseProvider: AbstractDatabaseProvider
  ){
    super({
      collection: 'teams',
      reference: 'user_id',
      modelInstance: new TeamModel(),
      databaseProvider: abstractDatabaseProvider
    })
  }

  /**
   * Retrieves the entity_id of the Tenant 
   * owned by the user
   */
  async getOwnedTenantIdOfUserId(userId: Core.Entity.Id): Promise<Core.Entity.Id | null>{
    const TeamModels = await this.getAll({
      foreignKeyValue: userId
    })
    const filtered = TeamModels.filter(TeamModel => {
      return TeamModel.is_active && TeamModel.is_owner
    })
    if (filtered.length > 1) {
      throw new DataIntegrityException({
        message: 'user is an owner of two or more tenants',
        data: { user_id: userId, tenants: filtered }
      })
    }
    if (filtered.length === 0) {
      return null
    }
    return filtered[0].tenant_id
  }

  /**
   * Retrieves all the entity_ids of the Tenants 
   * where the user has access to
   */
  async getTenantIdsWhereUserIdHasAccessTo(userId: Core.Entity.Id): Promise<Array<Core.Entity.Id>> {
    const allModels = await this.getAll({
      foreignKeyValue: userId
    })
    const TeamModels = allModels.filter(model => {
      return model.is_active
    })
    return TeamModels.map(model => {
      return model.tenant_id
    })
  }

  async isUserOwnerOfTenant({userId, tenantId}: {
    userId: Core.Entity.Id, tenantId: Core.Entity.Id
  }): Promise<boolean> {
    const admintenantId = await this.getOwnedTenantIdOfUserId(userId)
    if (admintenantId === null) {
      return false
    }
    return admintenantId === tenantId
  }

  async canUserAccessTenant({userId, tenantId}: {
    userId: Core.Entity.Id, tenantId: Core.Entity.Id
  }): Promise<boolean> {
    const tenantIds = await this.getTenantIdsWhereUserIdHasAccessTo(userId)
    return tenantIds.includes(tenantId)
  }

  async getTeamModelOfUserAccessToTenant({userId, tenantId}: {
    userId: Core.Entity.Id, tenantId: Core.Entity.Id
  }): Promise<TeamModel | null>{
    const allModels = await this.getAll({
      foreignKeyValue: userId
    })
    const filtered = allModels.filter(model => {
      return model.user_id === userId && model.tenant_id === tenantId
    })
    if (filtered.length === 0) return null
    return filtered[0]
  }

  



}