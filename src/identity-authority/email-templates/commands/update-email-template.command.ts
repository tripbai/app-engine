import { inject, injectable } from "inversify";
import { Core } from "../../../core/module/module";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { IAuthRequesterFactory } from "../../requester/iauth-requester.factory";
import { EmailTemplateUpdateService } from "../services/email-template-update.service";
import { EmailTemplateRepository } from "../email-template.repository";

@injectable()
export class UpdateEmailTemplateCommand {

  constructor(
    @inject(UnitOfWorkFactory) public readonly unitOfWorkFactory: UnitOfWorkFactory,
    @inject(IAuthRequesterFactory) public readonly iAuthRequesterFactory: IAuthRequesterFactory,
    @inject(EmailTemplateUpdateService) public readonly emailTemplateUpdateService: EmailTemplateUpdateService,
    @inject(EmailTemplateRepository) public readonly emailTemplateRepository: EmailTemplateRepository
  ){}

  async execute(params: {
    requester: Core.Authorization.Requester,
    entityId: Core.Entity.Id,
    templateId: Core.Entity.Id,
    description: string | null
  }){
    const iAuthRequester = this.iAuthRequesterFactory.create(params.requester)
    const unitOfWork = this.unitOfWorkFactory.create()
    const emailTemplateModel = await this.emailTemplateRepository.getById(params.entityId)
    await this.emailTemplateUpdateService.update(
      iAuthRequester, emailTemplateModel, params.templateId, params.description
    )
    unitOfWork.addTransactionStep(
      await this.emailTemplateRepository.update(emailTemplateModel)
    )
    await unitOfWork.commit()
    return
  }

}