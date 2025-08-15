import { injectable } from "inversify";
import { EmailTemplateModel } from "../email-template.model";
import * as Core from "../../../core/module/types";
import { EmailTemplateValidator } from "../email-template.validator";
import { IAuthRequester } from "../../requester/iauth-requester";
import { ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";

@injectable()
export class EmailTemplateUpdateService {
  constructor() {}

  async update(
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
    EmailTemplateValidator.description(description);
    emailTemplateModel.description = description;
  }
}
