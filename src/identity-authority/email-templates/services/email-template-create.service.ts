import { inject, injectable } from "inversify";
import { IAuthRequester } from "../../requester/iauth-requester";
import * as IdentityAuthority from "../../module/types";
import * as Core from "../../../core/module/types";
import {
  RecordAlreadyExistsException,
  ResourceAccessForbiddenException,
} from "../../../core/exceptions/exceptions";
import { EmailTemplateRepository } from "../email-template.repository";
import { EmailTemplateModel } from "../email-template.model";
import { Pseudorandom } from "../../../core/helpers/pseudorandom";
import { TimeStamp } from "../../../core/helpers/timestamp";

@injectable()
export class EmailTemplateCreateService {
  constructor(
    @inject(EmailTemplateRepository)
    private emailTemplateRepository: EmailTemplateRepository
  ) {}

  async createEmailTemplate(
    iAuthRequester: IAuthRequester,
    templateType: IdentityAuthority.EmailTemplatesRegistry.Fields.EmailType,
    templateId: Core.Entity.Id,
    description: string | null
  ) {
    if (!iAuthRequester.isWebAdmin()) {
      throw new ResourceAccessForbiddenException({
        message: "only web admin is able to create email template at this time",
        data: { requester: iAuthRequester },
      });
    }
    const existingTemplateModel =
      await this.emailTemplateRepository.getTemplateByType(templateType);
    if (existingTemplateModel !== null) {
      throw new RecordAlreadyExistsException({
        message: "email template already exist for template type",
        data: {
          template_type: templateType,
          template_id: existingTemplateModel.template_id,
        },
      });
    }
    const emailTemplateModel: EmailTemplateModel = {
      entity_id: createEntityId(),
      template_type: templateType,
      template_id: templateId,
      description: description,
      created_at: TimeStamp.now(),
      updated_at: TimeStamp.now(),
      archived_at: null,
    };
    return emailTemplateModel;
  }
}
