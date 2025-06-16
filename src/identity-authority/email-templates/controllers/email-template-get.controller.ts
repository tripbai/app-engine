import { inject, injectable } from "inversify";
import { get } from "../../../core/router/decorators";
import { IdentityAuthority } from "../../module/module.interface";
import { Core } from "../../../core/module/module";
import { IAuthRequesterFactory } from "../../requester/iauth-requester.factory";
import { EmailTemplateRepository } from "../email-template.repository";
import { ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";

@injectable()
export class EmailTemplateGetController {

  constructor(
    @inject(IAuthRequesterFactory) public readonly iAuthRequesterFactory: IAuthRequesterFactory,
    @inject(EmailTemplateRepository) public readonly emailTemplateRepository: EmailTemplateRepository
  ){}

  @get<IdentityAuthority.EmailTemplatesRegistry.Endpoints.GetAll>('/identity-authority/registry/email-templates')
  async getAllEmailTemplates<T extends IdentityAuthority.EmailTemplatesRegistry.Endpoints.GetAll>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T['response']>{
    const iAuthRequester = this.iAuthRequesterFactory.create(params.requester)
    if(!iAuthRequester.isWebAdmin()) {
      throw new ResourceAccessForbiddenException({
        message: 'only web admin is able to retrieve all email templates at this time',
        data: { requester: iAuthRequester }
      })
    }
    const models = await this.emailTemplateRepository.getAllActiveTemplates()
    const results: Array<{
      entity_id: Core.Entity.Id
      template_type: IdentityAuthority.EmailTemplatesRegistry.Fields.EmailType
      template_id: Core.Entity.Id
      description: string | null
      created_at: string
      updated_at: string
    }> = []
    for (let i = 0; i < models.length; i++) {
      const model = models[i]
      results.push({
        entity_id: model.entity_id,
        template_type: model.template_type,
        template_id: model.template_id,
        description: model.description,
        created_at: model.created_at,
        updated_at: model.updated_at
      })
    }
    return results
  }

}