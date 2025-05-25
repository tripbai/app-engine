import { BaseEntity } from "../entity/entity"
import { DataIntegrityException } from "../../exceptions/exceptions"
import { TimeStamp } from "../../helpers/timestamp"
import { Entity } from "../../interface"
import { RepositoryHelper } from "./helpers"
import { RepositoryServiceProviders } from "./types"

export class CatalogRepository<TModel extends BaseEntity<TModel>> {
  /**
   * In NoSQL databases, the collection refers to the database collection itself. 
   * For relational databases, this collection value refers
   * to the name of the database table
   */
  protected readonly collection: string

  /**
   * Binds service providers to a Catalog instance
   */
  protected readonly providers: RepositoryServiceProviders

  /**
   * The class definition of TModel itself
   */
  protected readonly model: new (...args: any[]) => TModel

  /**
   * Retrieves models based on a list of entity_ids.
   * 
   * @param entityIds - this list of entity_ids
   * @returns Array<TModel extends BaseEntity<TModel>>
   */
  static async find<TModel extends BaseEntity<TModel>>(
    this: new () => CatalogRepository<TModel>,
    entityIds: Array<Entity.Id>
  ): Promise<Array<TModel>>{
    const CatalogInstance = new this()
    await CatalogInstance.providers.database.connect()
    const hits = await CatalogInstance.providers.database.get().entities(
      CatalogInstance.collection,
      entityIds
    )
    const models: Array<TModel> = []
    for (let i = 0; i < hits.length; i++) {
      const data = hits[i]
      const model = new CatalogInstance.model
      try {
        for (const key in data) {
          if (RepositoryHelper.isDateObject(data[key])) {
            // @ts-ignore the above check will determine if the value is Date object
            model[key] = TimeStamp.normalize(data[key])
          } else {
            model[key] = data[key]
          }
        }
      } catch (error) {
        throw new DataIntegrityException({
          message: 'database record contains invalid data',
          data: {
            collection: CatalogInstance.collection,
            data: data,
            error: error
          }
        })
      }
      models.push(model)
    }
    return models
  }

}
