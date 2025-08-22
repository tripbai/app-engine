import { inject, injectable } from "inversify";
import * as Core from "../../../core/module/types";
import { IAuthRequesterFactory } from "../../requester/iauth-requester.factory";
import { ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";
import { UserRepository } from "../../users/user.repository";
import { TenantRepository } from "../tenant.repository";
import { TeamUsersService } from "../../teams/services/team-users.service";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { AbstractEventManagerProvider } from "../../../core/providers/event/event-manager.provider";
import { TenantTeamAccessEvent } from "../tenant.events";

@injectable()
export class AddTenantUserCommand {
  constructor(
    @inject(UnitOfWorkFactory)
    private unitOfWorkFactory: UnitOfWorkFactory,
    @inject(IAuthRequesterFactory)
    private iAuthRequesterFactory: IAuthRequesterFactory,
    @inject(UserRepository) private userRepository: UserRepository,
    @inject(TenantRepository)
    private tenantRepository: TenantRepository,
    @inject(TeamUsersService)
    private teamUsersService: TeamUsersService,
    @inject(AbstractEventManagerProvider)
    private eventManager: AbstractEventManagerProvider
  ) {}

  async execute(params: {
    requester: Core.Authorization.Requester;
    userId: Core.Entity.Id;
    tenantId: Core.Entity.Id;
  }) {
    const unitOfWork = this.unitOfWorkFactory.create();
    const iAuthRequester = this.iAuthRequesterFactory.create(params.requester);
    if (!iAuthRequester.isRegularUser()) {
      throw new ResourceAccessForbiddenException({
        message: "public users cannot invoke this command",
        data: params.requester,
      });
    }
    const userModelToAdd = await this.userRepository.getById(params.userId);
    const tenantModel = await this.tenantRepository.getById(params.tenantId);
    await this.teamUsersService.addUserToTenantTeamIfNotExist(
      iAuthRequester,
      unitOfWork,
      userModelToAdd,
      tenantModel
    );
    await unitOfWork.commit();
    await this.eventManager.dispatch(
      new TenantTeamAccessEvent(),
      "add:user",
      userModelToAdd,
      tenantModel
    );
    return;
  }
}
