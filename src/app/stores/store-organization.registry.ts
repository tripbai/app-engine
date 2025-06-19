import { inject, injectable } from "inversify";
import { RegistryRepository } from "../../core/orm/repository/registry-repository";
import { StoreModel } from "./store.model";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { Core } from "../../core/module/module";

@injectable()
export class StoreOrganizationRegistry extends RegistryRepository<StoreModel> {

  constructor(
    @inject(AbstractDatabaseProvider) public readonly abstractDatabaseProvider: AbstractDatabaseProvider
  ) {
    super({
      collection: 'stores',
      reference: 'organization_id',
      modelInstance: new StoreModel(),
      databaseProvider: abstractDatabaseProvider
    });
  }

  async getActiveStoresByOrganizationId(organizationId: Core.Entity.Id): Promise<StoreModel[]> {
    const allStores = await this.getAll({
      foreignKeyValue: organizationId
    })
    return allStores.filter(store => {
      store.status === 'active'
    })
  }

}