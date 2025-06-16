import { inject, injectable } from "inversify";
import { IAuthRequester } from "../../requester/iauth-requester";
import { IdentityAuthority } from "../../module/module.interface";
import { Core } from "../../../core/module/module";
import { RecordAlreadyExistsException, ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";
import { EmailTemplateRepository } from "../email-template.repository";
import { EmailTemplateModel } from "../email-template.model";
import { Pseudorandom } from "../../../core/helpers/pseudorandom";
import { TimeStamp } from "../../../core/helpers/timestamp";

@injectable()
export class EmailTemplateCreateService {

  constructor(
    @inject(EmailTemplateRepository) public readonly emailTemplateRepository: EmailTemplateRepository
  ){}

  async createEmailTemplate(
    iAuthRequester: IAuthRequester,
    templateType: IdentityAuthority.EmailTemplatesRegistry.Fields.EmailType,
    templateId: Core.Entity.Id,
    description: string | null
  ){
    if(!iAuthRequester.isWebAdmin()) {
      throw new ResourceAccessForbiddenException({
        message: 'only web admin is able to create email template at this time',
        data: { requester: iAuthRequester }
      })
    }
    const existingTemplateModel 
      = await this.emailTemplateRepository.getTemplateByType(templateType)
    if (existingTemplateModel !== null) {
      throw new RecordAlreadyExistsException({
        message: 'email template already exist for template type',
        data: { template_type: templateType, template_id: existingTemplateModel.template_id }
      })
    }
    const emailTemplateModel: EmailTemplateModel = {
      entity_id: Pseudorandom.alphanum32(),
      template_type: templateType,
      template_id: templateId,
      description: description,
      created_at: TimeStamp.now(),
      updated_at: TimeStamp.now(),
      archived_at: null
    }
    return emailTemplateModel
  }

}