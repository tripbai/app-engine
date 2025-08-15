import { inject, injectable } from "inversify";
import { patch } from "../../../core/router/route-decorators";
import * as IdentityAuthority from "../../module/types";
import * as Core from "../../../core/module/types";
import { BadRequestException } from "../../../core/exceptions/exceptions";
import { IsValid } from "../../../core/helpers/isvalid";
import { EmailTemplateValidator } from "../email-template.validator";
import { UpdateEmailTemplateCommand } from "../commands/update-email-template.command";
import { EntityToolkit } from "../../../core/orm/entity/entity-toolkit";

@injectable()
export class EmailTemplateUpdateController {
  constructor(
    @inject(UpdateEmailTemplateCommand)
    private emailTemplateUpdateService: UpdateEmailTemplateCommand
  ) {}

  @patch<IdentityAuthority.EmailTemplatesRegistry.Endpoints.Update>(
    "/identity-authority/registry/email-templates/:entity_id"
  )
  async updateEmailTemplate<
    T extends IdentityAuthority.EmailTemplatesRegistry.Endpoints.Update
  >(params: Core.Route.ControllerDTO<T>): Promise<T["response"]> {
    try {
      assertNonEmptyString(params.data.description);
      EmailTemplateValidator.description(params.data.description);
      assertNonEmptyString(params.data.entity_id);
      assertValidEntityId(params.data.entity_id);
      assertNonEmptyString(params.data.template_id);
      assertValidEntityId(params.data.template_id);
    } catch (error) {
      throw new BadRequestException({
        message: "Failed to update email template due to invalid input.",
        data: { error },
      });
    }
    const result = await this.emailTemplateUpdateService.execute({
      requester: params.requester,
      entityId: params.data.entity_id,
      templateId: params.data.template_id,
      description: params.data.description,
    });
    return {};
  }
}
