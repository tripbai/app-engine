import { inject, injectable } from "inversify";
import { BaseRepository } from "../../core/orm/repository/base-repository";
import { EmailTemplateModel } from "./email-template.model";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { AbstractCacheProvider } from "../../core/providers/cache/cache.provider";
import * as IdentityAuthority from "../module/types";
import { DataIntegrityException } from "../../core/exceptions/exceptions";
import { IAuthDatabaseProvider } from "../providers/iauth-database.provider";

@injectable()
export class EmailTemplateRepository extends BaseRepository<EmailTemplateModel> {
  protected collectionName: string = "email_templates";

  constructor(
    @inject(IAuthDatabaseProvider)
    private DatabaseProvider: AbstractDatabaseProvider,
    @inject(AbstractCacheProvider)
    private CacheProvider: AbstractCacheProvider
  ) {
    super("email_templates", EmailTemplateModel, {
      database: DatabaseProvider,
      cache: CacheProvider,
    });
  }

  async getTemplateByType(
    templateType: IdentityAuthority.EmailTemplatesRegistry.Fields.EmailType
  ) {
    const results = await this.DatabaseProvider.whereFieldHasValue(
      this.collectionName,
      "template_type",
      templateType
    );
    if (results.length > 1) {
      throw new DataIntegrityException({
        message: "multiple template instances is detected for template type",
        data: { template_type: templateType },
      });
    }
    if (results.length === 0) return null;
    const emailTemplateModel = new EmailTemplateModel();
    this.ingestIntoModel(emailTemplateModel, results[0]);
    return emailTemplateModel;
  }

  async getAllActiveTemplates() {
    const models: Array<EmailTemplateModel> = [];
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
      const Registry: EmailTemplateModel = new EmailTemplateModel();
      try {
        this.ingestIntoModel(Registry, data);
      } catch (error) {
        throw new DataIntegrityException({
          message: "one of email template records contains invalid data",
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
}
