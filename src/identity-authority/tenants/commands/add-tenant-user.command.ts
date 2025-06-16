import { inject, injectable } from "inversify";
import { Core } from "../../../core/module/module";
import { IAuthRequesterFactory } from "../../requester/iauth-requester.factory";
import { ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";
import { UserRepository } from "../../users/user.repository";
import { TenantRepository } from "../tenant.repository";
import { TeamUsersService } from "../../teams/services/team-users.service";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";

@injectable()
export class AddTenantUserCommand {

  constructor(
    @inject(UnitOfWorkFactory) public readonly unitOfWorkFactory: UnitOfWorkFactory,
    @inject(IAuthRequesterFactory) public readonly iAuthRequesterFactory: IAuthRequesterFactory,
    @inject(UserRepository) public readonly userRepository: UserRepository,
    @inject(TenantRepository) public readonly tenantRepository: TenantRepository,
    @inject(TeamUsersService) public readonly teamUsersService: TeamUsersService
  ){}

  async execute(params: {
    requester: Core.Authorization.Requester,
    userId: Core.Entity.Id,
    tenantId: Core.Entity.Id
  }){
    const unitOfWork = this.unitOfWorkFactory.create()
    const iAuthRequester = this.iAuthRequesterFactory.create(params.requester)
    if (!iAuthRequester.isRegularUser()) {
      throw new ResourceAccessForbiddenException({
        message: 'public users cannot invoke this command',
        data: params.requester
      })
    }
    const userModelToAdd 
      = await this.userRepository.getById(params.userId)
    const tenantModel 
      = await this.tenantRepository.getById(params.tenantId) 
    await this.teamUsersService.addUserToTenantTeamIfNotExist(
      iAuthRequester, unitOfWork, userModelToAdd, tenantModel
    )
    await unitOfWork.commit()
    return
  }

}