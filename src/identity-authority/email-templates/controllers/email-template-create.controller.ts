import { inject, injectable } from "inversify";
import { post } from "../../../core/router/route-decorators";
import { IdentityAuthority } from "../../module/module.interface";
import { Core } from "../../../core/module/module";
import { BadRequestException } from "../../../core/exceptions/exceptions";
import { IsValid } from "../../../core/helpers/isvalid";
import { EntityToolkit } from "../../../core/orm/entity/entity-toolkit";
import { EmailTemplateValidator } from "../email-template.validator";
import { CreateEmailTeamplateCommand } from "../commands/create-email-template.command";

@injectable()
export class EmailTemplateCreateController {
  constructor(
    @inject(CreateEmailTeamplateCommand)
    public readonly createEmailTeamplateCommand: CreateEmailTeamplateCommand
  ) {}

  @post<IdentityAuthority.EmailTemplatesRegistry.Endpoints.Create>(
    "/identity-authority/registry/email-templates"
  )
  async registerEmailTemplate<
    T extends IdentityAuthority.EmailTemplatesRegistry.Endpoints.Create
  >(params: Core.Route.ControllerDTO<T>): Promise<T["response"]> {
    const templateType = params.data.template_type;
    let description: string | null = null;
    try {
      IsValid.NonEmptyString(templateType);
      if (
        templateType !== "password_reset_template" &&
        templateType !== "account_verification_template" &&
        templateType !== "email_confirmation_template" &&
        templateType !== "login_link_template"
      ) {
        throw new Error(
          "email template type must be one of the pre-defined keys"
        );
      }
      IsValid.NonEmptyString(params.data.template_id);
      EntityToolkit.Assert.idIsValid(params.data.template_id);
      if (params.data.description !== null) {
        IsValid.NonEmptyString(params.data.description);
        EmailTemplateValidator.description(params.data.description);
        description = params.data.description.trim();
      }
    } catch (error) {
      throw new BadRequestException({
        message: "Failed to create email template due to invalid input.",
        data: { error },
      });
    }
    const result = await this.createEmailTeamplateCommand.execute(
      params.requester,
      templateType,
      params.data.template_id,
      description
    );
    return {
      entity_id: result.entity_id,
      template_type: result.template_type,
      template_id: result.template_id,
      description: result.description,
    };
  }
}
