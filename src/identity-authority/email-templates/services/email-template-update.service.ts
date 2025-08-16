import { inject, injectable } from "inversify";
import { EmailTemplateModel } from "../email-template.model";
import * as Core from "../../../core/module/types";
import { IAuthRequester } from "../../requester/iauth-requester";
import { ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";
import { assertIsEmailTemplateDescription } from "../email-template.assertions";
import { EmailTemplateRepository } from "../email-template.repository";
import { UnitOfWork } from "../../../core/workflow/unit-of-work";

@injectable()
export class EmailTemplateUpdateService {
  constructor(
    @inject(EmailTemplateRepository)
    private emailTemplateRepository: EmailTemplateRepository
  ) {}

  async update(
    unitOfWork: UnitOfWork,
    iAuthRequester: IAuthRequester,
    emailTemplateModel: EmailTemplateModel,
    templateId: Core.Entity.Id,
    description: string | null
  ) {
    if (!iAuthRequester.isWebAdmin()) {
      throw new ResourceAccessForbiddenException({
        message: "only web admin is able to update email template at this time",
        data: { requester: iAuthRequester },
      });
    }
    emailTemplateModel.template_id = templateId;
    assertIsEmailTemplateDescription(description);
    emailTemplateModel.description = description;
    this.emailTemplateRepository.update(emailTemplateModel, unitOfWork);
  }
}
