import { inject, injectable } from "inversify";
import { patch } from "../../../core/router/route-decorators";
import * as IdentityAuthority from "../../module/types";
import * as Core from "../../../core/module/types";
import { BadRequestException } from "../../../core/exceptions/exceptions";
import { UpdateEmailTemplateCommand } from "../commands/update-email-template.command";
import { assertNonEmptyString } from "../../../core/utilities/assertValid";
import { assertIsEmailTemplateDescription } from "../email-template.assertions";
import { assertValidEntityId } from "../../../core/utilities/entityToolkit";

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
      assertIsEmailTemplateDescription(params.data.description);
      assertValidEntityId(params.data.entity_id);
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
