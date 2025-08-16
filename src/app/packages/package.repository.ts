import { inject, injectable } from "inversify";
import { BaseRepository } from "../../core/orm/repository/base-repository";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { AbstractCacheProvider } from "../../core/providers/cache/cache.provider";
import { PackageModel } from "./package.model";
import { DataIntegrityException } from "../../core/exceptions/exceptions";

@injectable()
export class PackageRepository extends BaseRepository<PackageModel> {
  protected collectionName: string = "packages";

  constructor(
    @inject(AbstractDatabaseProvider)
    private DatabaseProvider: AbstractDatabaseProvider,
    @inject(AbstractCacheProvider) private CacheProvider: AbstractCacheProvider
  ) {
    super("packages", PackageModel, {
      database: DatabaseProvider,
      cache: CacheProvider,
    });
  }

  async getAllNonArchivedPackages() {
    const models: Array<PackageModel> = [];
    const results = await this.DatabaseProvider.whereFieldHasValue(
      this.collectionName,
      "archived_at",
      null
    );
    if (results.length === 0) {
      return models;
    }
    for (let i = 0; i < results.length; i++) {
      const data = results[i];
      const Registry: PackageModel = new PackageModel();
      try {
        this.ingestIntoModel(Registry, data);
      } catch (error) {
        throw new DataIntegrityException({
          message: "one of package records contains invalid data",
          data: {
            email_template: data,
            error: error,
          },
        });
      }
      models.push(Registry);
    }
    return models;
  }

  async hasDefaultPackage(): Promise<boolean> {
    const results = await this.DatabaseProvider.whereFieldHasValue(
      this.collectionName,
      "is_default",
      true
    );
    return results.length > 0;
  }

  async getCurrentDefaultPackage(): Promise<PackageModel> {
    const results = await this.DatabaseProvider.whereFieldHasValue(
      this.collectionName,
      "is_default",
      true
    );
    if (results.length === 0) {
      throw new DataIntegrityException({
        message: "no default package found, please set a default package",
        data: {},
      });
    }
    if (results.length > 1) {
      throw new DataIntegrityException({
        message:
          "multiple default packages found, please ensure only one package is set as default",
        data: {},
      });
    }
    const data = results[0];
    const model: PackageModel = new PackageModel();
    try {
      this.ingestIntoModel(model, data);
    } catch (error) {
      throw new DataIntegrityException({
        message: "one of package records contains invalid data",
        data: {
          email_template: data,
          error: error,
        },
      });
    }
    return model;
  }
}
