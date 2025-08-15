import { inject, injectable } from "inversify";
import { ProfileModel } from "./profile.model";
import { BaseRepository } from "../../core/orm/repository/base-repository";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { AbstractCacheProvider } from "../../core/providers/cache/cache.provider";
import { IAuthDatabaseProvider } from "../providers/iauth-database.provider";

@injectable()
export class ProfileRepository extends BaseRepository<ProfileModel> {
  protected collection: string = "profiles";

  constructor(
    @inject(IAuthDatabaseProvider)
    private DatabaseProvider: AbstractDatabaseProvider,
    @inject(AbstractCacheProvider) private CacheProvider: AbstractCacheProvider
  ) {
    super(ProfileModel, DatabaseProvider, CacheProvider);
  }
}
