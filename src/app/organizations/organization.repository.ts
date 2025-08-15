import { inject, injectable } from "inversify";
import { BaseRepository } from "../../core/orm/repository/base-repository";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { AbstractCacheProvider } from "../../core/providers/cache/cache.provider";
import { OrganizationModel } from "./organization.model";

@injectable()
export class OrganizationRepository extends BaseRepository<OrganizationModel> {
  protected collection: string = "organizations";

  constructor(
    @inject(AbstractDatabaseProvider)
    private DatabaseProvider: AbstractDatabaseProvider,
    @inject(AbstractCacheProvider) private CacheProvider: AbstractCacheProvider
  ) {
    super(OrganizationModel, DatabaseProvider, CacheProvider);
  }
}
