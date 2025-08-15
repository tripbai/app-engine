import { inject, injectable } from "inversify";
import { BaseRepository } from "../../core/orm/repository/base-repository";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { AbstractCacheProvider } from "../../core/providers/cache/cache.provider";
import { ImageModel } from "./image.model";

@injectable()
export class ImageRepository extends BaseRepository<ImageModel> {
  protected collection: string = "images";

  constructor(
    @inject(AbstractDatabaseProvider)
    private DatabaseProvider: AbstractDatabaseProvider,
    @inject(AbstractCacheProvider) private CacheProvider: AbstractCacheProvider
  ) {
    super(ImageModel, DatabaseProvider, CacheProvider);
  }
}
