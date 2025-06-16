import { inject, injectable } from "inversify";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { TenantCreateService } from "../services/tenant-create.service";
import { TenantRepository } from "../tenant.repository";
import { Core } from "../../../core/module/module";
import { IAuthRequesterFactory } from "../../requester/iauth-requester.factory";
import { ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";
import { TeamUsersService } from "../../teams/services/team-users.service";
import { UserRepository } from "../../users/user.repository";

@injectable()
export class CreateTenantCommand {

  constructor(
    @inject(UnitOfWorkFactory) public readonly unitOfWorkFactory: UnitOfWorkFactory,
    @inject(TenantCreateService) public readonly tenantCreateService: TenantCreateService,
    @inject(TenantRepository) public readonly tenantRepository: TenantRepository,
    @inject(IAuthRequesterFactory) public readonly iAuthRequesterFactory: IAuthRequesterFactory,
    @inject(TeamUsersService) public readonly teamUsersService: TeamUsersService,
    @inject(UserRepository) public readonly userRepository: UserRepository
  ){}

  async execute(
    requester: Core.Authorization.Requester,
    name: string
  ){
    const iAuthRequester = this.iAuthRequesterFactory.create(requester)
    if (!iAuthRequester.isRegularUser()) {
      throw new ResourceAccessForbiddenException({
        message: 'public users cannot create tenant',
        data: requester
      })
    }
    const userId = iAuthRequester.get().user.entity_id
    const userModel = await this.userRepository.getById(userId)
    const unitOfWork = this.unitOfWorkFactory.create()
    const createTenantResult 
      = await this.tenantCreateService.createTenantIfNotExist(
        userModel, name
      )
    if (!createTenantResult.isNew) {
      return
    }
    const tenantModel = createTenantResult.tenantModel
    await this.teamUsersService.addUserToTenantTeamIfNotExist(
      iAuthRequester, unitOfWork, userModel, tenantModel
    )
    const transaction = this.tenantRepository.create(
      tenantModel.entity_id, tenantModel
    )
    unitOfWork.addTransactionStep(transaction)
    await unitOfWork.commit()
    return {}
  }

}