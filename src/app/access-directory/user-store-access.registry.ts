import { inject, injectable } from "inversify";
import { RegistryRepository } from "../../core/orm/repository/registry-repository";
import { AccessDirectoryModel } from "./access-directory.model";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import * as Core from "../../core/module/types";

@injectable()
export class UserStoreAccessRegistry extends RegistryRepository<AccessDirectoryModel> {
  constructor(
    @inject(AbstractDatabaseProvider)
    private abstractDatabaseProvider: AbstractDatabaseProvider
  ) {
    super({
      collection: "access_directory",
      reference: "user_id",
      modelInstance: new AccessDirectoryModel(),
      databaseProvider: abstractDatabaseProvider,
    });
  }

  /**
   * Retrieves all the stores that a user has access to,
   * as well as the permissions they have for each store.
   */
  async getStoreIdsUserHasAccess(userId: Core.Entity.Id): Promise<
    Array<{
      store_id: Core.Entity.Id;
    }>
  > {
    const allModels = await this.getAll({
      foreignKeyValue: userId,
    });
    const filteredModels = allModels.filter((accessDirectoryModel) => {
      return accessDirectoryModel.is_active;
    });
    return filteredModels.map((accessDirectoryModel) => {
      return {
        store_id: accessDirectoryModel.store_id,
      };
    });
  }
}
