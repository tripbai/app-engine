import { inject, injectable } from "inversify";
import { BaseRepository } from "../../core/orm/repository/base-repository";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { AbstractCacheProvider } from "../../core/providers/cache/cache.provider";
import { OrganizationModel } from "./organization.model";

@injectable()
export class OrganizationRepository extends BaseRepository<OrganizationModel> {
  constructor(
    @inject(AbstractDatabaseProvider)
    private DatabaseProvider: AbstractDatabaseProvider,
    @inject(AbstractCacheProvider) private CacheProvider: AbstractCacheProvider
  ) {
    super("organizations", OrganizationModel, {
      database: DatabaseProvider,
      cache: CacheProvider,
    });
  }
}
