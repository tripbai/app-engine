import { inject, injectable } from "inversify";
import * as Core from "../../../core/module/types";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { IAuthRequesterFactory } from "../../requester/iauth-requester.factory";
import { EmailTemplateUpdateService } from "../services/email-template-update.service";
import { EmailTemplateRepository } from "../email-template.repository";
import { ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";

@injectable()
export class UpdateEmailTemplateCommand {
  constructor(
    @inject(UnitOfWorkFactory)
    private unitOfWorkFactory: UnitOfWorkFactory,
    @inject(IAuthRequesterFactory)
    private iAuthRequesterFactory: IAuthRequesterFactory,
    @inject(EmailTemplateUpdateService)
    private emailTemplateUpdateService: EmailTemplateUpdateService,
    @inject(EmailTemplateRepository)
    private emailTemplateRepository: EmailTemplateRepository
  ) {}

  async execute(params: {
    requester: Core.Authorization.Requester;
    entityId: Core.Entity.Id;
    templateId: Core.Entity.Id;
    description: string | null;
  }) {
    const iAuthRequester = this.iAuthRequesterFactory.create(params.requester);
    const unitOfWork = this.unitOfWorkFactory.create();
    const emailTemplateModel = await this.emailTemplateRepository.getById(
      params.entityId
    );
    await this.emailTemplateUpdateService.update(
      unitOfWork,
      iAuthRequester,
      emailTemplateModel,
      params.templateId,
      params.description
    );
    await unitOfWork.commit();
    return;
  }
}
