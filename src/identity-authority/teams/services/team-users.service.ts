import { inject, injectable } from "inversify";
import { Core } from "../../../core/module/module";
import { UserAccessRegistry } from "../user-access.registry";
import { TeamModel } from "../team.model";
import { UnitOfWork } from "../../../core/workflow/unit-of-work";
import { Pseudorandom } from "../../../core/helpers/pseudorandom";
import { TenantUsersRegistry } from "../tenant-users.registry";
import { TimeStamp } from "../../../core/helpers/timestamp";
import { TeamRepository } from "../team.repository";
import { UserModel } from "../../users/user.model";
import { TenantModel } from "../../tenants/tenant.model";
import { ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";
import { IAuthRequester } from "../../requester/iauth-requester";

@injectable()
export class TeamUsersService {

  constructor(
    @inject(UserAccessRegistry) public readonly userAccessRegistry: UserAccessRegistry,
    @inject(TenantUsersRegistry) public readonly tenantUsersRegistry: TenantUsersRegistry,
    @inject(TeamRepository) public readonly teamRepository: TeamRepository
  ){}

  async addUserToTenantTeamIfNotExist(
    iAuthRequester: IAuthRequester,
    unitOfWork: UnitOfWork,
    userModel: UserModel,
    tenantModel: TenantModel,
  ): Promise<void>{

    if (userModel.status !== 'active' && userModel.status !== 'unverified') {
      throw new ResourceAccessForbiddenException({
        message: 'unable to add user to tenant team due to user status',
        data: { user_id: userModel.entity_id, tenant_id: tenantModel.entity_id }
      })
    }

    if (tenantModel.archived_at !== null) {
      throw new ResourceAccessForbiddenException({
        message: 'unable to add user to tenant team due to tenant status status',
        data: { user_id: userModel.entity_id, tenant_id: tenantModel.entity_id }
      })
    }

    const userId = userModel.entity_id
    const tenantId = tenantModel.entity_id

    const teamModel 
      = await this.userAccessRegistry.getTeamModelOfUserAccessToTenant({
        userId: userId,
        tenantId: tenantId
      })
    
    /**
     * This means that there is no record of user ever being added to 
     * this tenant's team.
     */
    if (teamModel === null) {

      let shouldUserOwnTenant = true

      /** 
       * Tells whether the tenant have existing records in the teams registry.
       * When this is true, it means that it isn't the first user of the tenant,
       * and that means, the user shouldn't be an admin.
       */
      if (await this.tenantUsersRegistry.doesTenantHaveTeamsRegistry(tenantId)) {

        shouldUserOwnTenant = false

        /**
         * Requester must be tenant owner in order to add user to the tenant team
         */
        const isRequesterTheOwnerOfTenant = this.userAccessRegistry.isUserOwnerOfTenant({
          userId: iAuthRequester.get().user.entity_id,
          tenantId: tenantModel.entity_id
        })

        if (!isRequesterTheOwnerOfTenant) {
          throw new ResourceAccessForbiddenException({
            message: 'only tenant owner can add user to the tenant teams',
            data: { user_id: userId, tenant_id: tenantId }
          })
        }

      }

      const newTeamModel: TeamModel = {
        entity_id: Pseudorandom.alphanum32(),
        user_id: userId,
        tenant_id: tenantId,
        is_active: true,
        is_owner: shouldUserOwnTenant,
        role_id: null,
        created_at: TimeStamp.now(),
        updated_at: TimeStamp.now(),
        archived_at: null
      }

      unitOfWork.addTransactionStep(
        this.teamRepository.create(
          newTeamModel.entity_id, newTeamModel
        )
      )

      return
      
    }

    /**
     * When there is record of this user previously added to tenant's team,
     * but is no more active, this activates the record back
     */
    if (!teamModel.is_active) {
      teamModel.is_active = true
      unitOfWork.addTransactionStep(
        await this.teamRepository.update(
          teamModel
        )
      )
    }
    
  }

}