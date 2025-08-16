import { inject, injectable } from "inversify";
import { EmailTemplateCreateService } from "../services/email-template-create.service";
import * as Core from "../../../core/module/types";
import * as IdentityAuthority from "../../module/types";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { IAuthRequesterFactory } from "../../requester/iauth-requester.factory";

@injectable()
export class CreateEmailTeamplateCommand {
  constructor(
    @inject(EmailTemplateCreateService)
    private emailTemplateCreateService: EmailTemplateCreateService,
    @inject(UnitOfWorkFactory)
    private unitOfWorkFactory: UnitOfWorkFactory,
    @inject(IAuthRequesterFactory)
    private iAuthRequesterFactory: IAuthRequesterFactory
  ) {}

  async execute(
    requester: Core.Authorization.Requester,
    templateType: IdentityAuthority.EmailTemplatesRegistry.Fields.EmailType,
    templateId: Core.Entity.Id,
    description: string | null
  ) {
    const iAuthRequester = this.iAuthRequesterFactory.create(requester);
    const unitOfWork = this.unitOfWorkFactory.create();
    const emailTemplateModel =
      await this.emailTemplateCreateService.createEmailTemplate(
        unitOfWork,
        iAuthRequester,
        templateType,
        templateId,
        description
      );
    await unitOfWork.commit();
    return {
      entity_id: emailTemplateModel.entity_id,
      template_type: emailTemplateModel.template_type,
      template_id: emailTemplateModel.template_id,
      description: emailTemplateModel.description,
    };
  }
}
