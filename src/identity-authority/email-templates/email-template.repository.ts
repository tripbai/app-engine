import { inject, injectable } from "inversify";
import { BaseRepository } from "../../core/orm/repository/base-repository";
import { EmailTemplateModel } from "./email-template.model";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { AbstractCacheProvider } from "../../core/providers/cache/cache.provider";
import { IdentityAuthority } from "../module/module.interface";
import { DataIntegrityException } from "../../core/exceptions/exceptions";

@injectable()
export class EmailTemplateRepository extends BaseRepository<EmailTemplateModel> {

  protected collection: string = 'email_templates'

  constructor(
    @inject(AbstractDatabaseProvider) public readonly DatabaseProvider: AbstractDatabaseProvider,
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

}