import { inject, injectable } from "inversify";
import { EmailTemplateCreateService } from "../services/email-template-create.service";
import { Core } from "../../../core/module/module";
import { IdentityAuthority } from "../../module/module.interface";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { IAuthRequesterFactory } from "../../requester/iauth-requester.factory";
import { EmailTemplateRepository } from "../email-template.repository";

@injectable()
export class CreateEmailTeamplateCommand {
  
  constructor(
    @inject(EmailTemplateCreateService) public readonly emailTemplateCreateService: EmailTemplateCreateService,
    @inject(UnitOfWorkFactory) public readonly unitOfWorkFactory: UnitOfWorkFactory,
    @inject(IAuthRequesterFactory) public readonly iAuthRequesterFactory: IAuthRequesterFactory,
    @inject(EmailTemplateRepository) public readonly emailTemplateRepository: EmailTemplateRepository
  ){}

  async execute(
    requester: Core.Authorization.Requester,
    templateType: IdentityAuthority.EmailTemplatesRegistry.Fields.EmailType,
    templateId: Core.Entity.Id,
    description: string | null
  ){
    const iAuthRequester = this.iAuthRequesterFactory.create(requester)
    const unitOfWork = this.unitOfWorkFactory.create()
    const emailTemplateModel = await this.emailTemplateCreateService.createEmailTemplate(
      iAuthRequester, templateType,templateId, description
    )
    unitOfWork.addTransactionStep(
      this.emailTemplateRepository.create(emailTemplateModel.entity_id, {
        template_id: emailTemplateModel.template_id,
        template_type: emailTemplateModel.template_type,
        description: emailTemplateModel.description,
        archived_at: null
      })
    )
    await unitOfWork.commit()
    return {
      entity_id: emailTemplateModel.entity_id,
      template_type: emailTemplateModel.template_type,
      template_id: emailTemplateModel.template_id,
      description: emailTemplateModel.description
    }
  }

}