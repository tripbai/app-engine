import { inject, injectable } from "inversify";
import { BaseRepository } from "../../core/orm/repository/base-repository";
import { EmailTemplateModel } from "./email-template.model";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { AbstractCacheProvider } from "../../core/providers/cache/cache.provider";
import { IdentityAuthority } from "../module/module.interface";
import { DataIntegrityException } from "../../core/exceptions/exceptions";
import { RegistryRepository } from "../../core/orm/repository/registry-repository";
import { TimeStamp } from "../../core/helpers/timestamp";
import { IAuthDatabaseProvider } from "../providers/iauth-database.provider";

@injectable()
export class EmailTemplateRepository extends BaseRepository<EmailTemplateModel> {

  protected collection: string = 'email_templates'

  constructor(
    @inject(IAuthDatabaseProvider) public readonly DatabaseProvider: AbstractDatabaseProvider,
    @inject(AbstractCacheProvider) public readonly CacheProvider: AbstractCacheProvider
  ){
    super(
      EmailTemplateModel,
      DatabaseProvider,
      CacheProvider
    )
  }

  async getTemplateByType(templateType: IdentityAuthority.EmailTemplatesRegistry.Fields.EmailType){
    const results = await this.DatabaseProvider.whereFieldHasValue(
      this.collection, 'template_type', templateType
    )
    if (results.length > 1) {
      throw new DataIntegrityException({
        message: 'multiple template instances is detected for template type',
        data: { template_type: templateType }
      })
    }
    if (results.length === 0) return null
    const emailTemplateModel = new EmailTemplateModel()
    this.ingest(emailTemplateModel, results[0])
    return emailTemplateModel
  }

  async getAllActiveTemplates(){
    const models: Array<EmailTemplateModel> = []
    const results = await this.DatabaseProvider.whereFieldHasValue(
      this.collection,'archived_at', null
    )
    if (results.length === 0) {
      return models
    }
    for (let i = 0; i < results.length; i++) {
      const data = results[i]
      const Registry: EmailTemplateModel = new EmailTemplateModel
      try {
        for (const key in data) {
          if (BaseRepository.isDateObject(data[key])) {
            // @ts-expect-error the above check will determine if the value is Date object
            Registry[key] = TimeStamp.normalize(data[key])
          } else {
            Registry[key] = data[key]
          }
        }
      } catch (error) {
        throw new DataIntegrityException({
          message: 'one of email template records contains invalid data',
          data: {
            email_template: data,
            error: error
          }
        })
      }
      models.push(Registry)
    }
    return models
  }

}