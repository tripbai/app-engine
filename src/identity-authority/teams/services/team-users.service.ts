import { inject, injectable } from "inversify";
import * as Core from "../../../core/module/types";
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
    @inject(UserAccessRegistry)
    private userAccessRegistry: UserAccessRegistry,
    @inject(TenantUsersRegistry)
    private tenantUsersRegistry: TenantUsersRegistry,
    @inject(TeamRepository) private teamRepository: TeamRepository
  ) {}

  async addUserToTenantTeamIfNotExist(
    iAuthRequester: IAuthRequester,
    unitOfWork: UnitOfWork,
    userModel: UserModel,
    tenantModel: TenantModel
  ): Promise<void> {
    if (userModel.status !== "active" && userModel.status !== "unverified") {
      throw new ResourceAccessForbiddenException({
        message: "unable to add user to tenant team due to user status",
        data: {
          user_id: userModel.entity_id,
          tenant_id: tenantModel.entity_id,
        },
      });
    }

    if (tenantModel.archived_at !== null) {
      throw new ResourceAccessForbiddenException({
        message:
          "unable to add user to tenant team due to tenant status status",
        data: {
          user_id: userModel.entity_id,
          tenant_id: tenantModel.entity_id,
        },
      });
    }

    const userId = userModel.entity_id;
    const tenantId = tenantModel.entity_id;

    const teamModel =
      await this.userAccessRegistry.getTeamModelOfUserAccessToTenant({
        userId: userId,
        tenantId: tenantId,
      });

    /**
     * This means that there is no record of user ever being added to
     * this tenant's team.
     */
    if (teamModel === null) {
      let shouldUserOwnTenant = true;

      /**
       * Tells if the tenant has teams registry or not.
       * If it does, then the user cannot be the owner of the tenant
       * because there can only be one owner of the tenant, and that
       * the tenant owner themselves.
       */
      if (
        await this.tenantUsersRegistry.doesTenantHaveTeamsRegistry(tenantId)
      ) {
        shouldUserOwnTenant = false;

        /**
         * Requester must be tenant owner in order to add user to the tenant team
         */
        const isRequesterTheOwnerOfTenant =
          this.userAccessRegistry.isUserOwnerOfTenant({
            userId: iAuthRequester.get().user.entity_id,
            tenantId: tenantModel.entity_id,
          });

        if (!isRequesterTheOwnerOfTenant) {
          throw new ResourceAccessForbiddenException({
            message: "only tenant owner can add user to the tenant teams",
            data: { user_id: userId, tenant_id: tenantId },
          });
        }
      }

      const teamEntityId = createEntityId();

      unitOfWork.addTransactionStep(
        this.teamRepository.create(teamEntityId, {
          user_id: userId,
          tenant_id: tenantId,
          is_active: true,
          is_owner: shouldUserOwnTenant,
          role_id: null,
          archived_at: null,
        })
      );

      return;
    }

    /**
     * When there is record of this user previously added to tenant's team,
     * but is no more active, this activates the record back
     */
    if (!teamModel.is_active) {
      teamModel.is_active = true;
      unitOfWork.addTransactionStep(
        await this.teamRepository.update(teamModel)
      );
    }
  }

  async removeUserFromTenantTeam(
    iAuthRequester: IAuthRequester,
    userModel: UserModel,
    tenantModel: TenantModel
  ) {
    if (tenantModel.archived_at !== null) {
      throw new ResourceAccessForbiddenException({
        message:
          "unable to remove user from tenant team due to tenant status status",
        data: {
          user_id: userModel.entity_id,
          tenant_id: tenantModel.entity_id,
        },
      });
    }

    const userId = userModel.entity_id;
    const tenantId = tenantModel.entity_id;

    const isRequesterTheOwnerOfTenant =
      this.userAccessRegistry.isUserOwnerOfTenant({
        userId: iAuthRequester.get().user.entity_id,
        tenantId: tenantModel.entity_id,
      });

    /**
     * The tenant owner has all the rights to remove any user from the tenant team,
     * however if the requester is not the owner of the tenant, then they can only
     * remove themselves from the tenant team.
     */
    if (
      !isRequesterTheOwnerOfTenant &&
      userId !== iAuthRequester.get().user.entity_id
    ) {
      throw new ResourceAccessForbiddenException({
        message:
          "only tenant owner or the user themselves can remove user from tenant team",
        data: { user_id: userId, tenant_id: tenantId },
      });
    }

    const teamModel =
      await this.userAccessRegistry.getTeamModelOfUserAccessToTenant({
        userId: userId,
        tenantId: tenantId,
      });

    if (teamModel === null) {
      throw new ResourceAccessForbiddenException({
        message: "user is not a member of the tenant team",
        data: { user_id: userId, tenant_id: tenantId },
      });
    }

    if (teamModel.is_owner) {
      throw new ResourceAccessForbiddenException({
        message: "unable to remove tenant owner from tenant team",
        data: { user_id: userId, tenant_id: tenantId },
      });
    }

    teamModel.is_active = false;
  }
}
