import { inject, injectable } from "inversify";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { TenantCreateService } from "../services/tenant-create.service";
import { TenantRepository } from "../tenant.repository";
import * as Core from "../../../core/module/types";
import { IAuthRequesterFactory } from "../../requester/iauth-requester.factory";
import {
  LogicException,
  ResourceAccessForbiddenException,
} from "../../../core/exceptions/exceptions";
import { TeamUsersService } from "../../teams/services/team-users.service";
import { UserRepository } from "../../users/user.repository";
import { AbstractEventManagerProvider } from "../../../core/providers/event/event-manager.provider";
import { TenantCreateEvent } from "../tenant.events";
import { UserAccessRegistry } from "../../teams/user-access.registry";

@injectable()
export class CreateTenantCommand {
  constructor(
    @inject(UnitOfWorkFactory)
    private unitOfWorkFactory: UnitOfWorkFactory,
    @inject(TenantCreateService)
    private tenantCreateService: TenantCreateService,
    @inject(TenantRepository)
    private tenantRepository: TenantRepository,
    @inject(IAuthRequesterFactory)
    private iAuthRequesterFactory: IAuthRequesterFactory,
    @inject(TeamUsersService)
    private teamUsersService: TeamUsersService,
    @inject(UserRepository) private userRepository: UserRepository,
    @inject(AbstractEventManagerProvider)
    private abstractEventManager: AbstractEventManagerProvider,
    @inject(UserAccessRegistry)
    private userAccessRegistry: UserAccessRegistry
  ) {}

  async execute(requester: Core.Authorization.Requester, name: string) {
    const iAuthRequester = this.iAuthRequesterFactory.create(requester);
    if (!iAuthRequester.isRegularUser()) {
      throw new ResourceAccessForbiddenException({
        message: "public users cannot create tenant",
        data: requester,
      });
    }
    const userId = iAuthRequester.get().user.entity_id;
    const userModel = await this.userRepository.getById(userId);
    const unitOfWork = this.unitOfWorkFactory.create();
    const createTenantResult =
      await this.tenantCreateService.createTenantIfNotExist(userModel, name);
    if (!createTenantResult.isNew) {
      const tenantId = await this.userAccessRegistry.getOwnedTenantIdOfUserId(
        iAuthRequester.get().user.entity_id
      );
      if (tenantId === null) {
        throw new LogicException({
          message: "should not happen, user should have a tenant if not new",
          data: { user_id: userId, tenant_name: name },
        });
      }
      const tenantModel = await this.tenantRepository.getById(tenantId);
      return {
        entity_id: tenantModel.entity_id,
        secret_key: tenantModel.secret_key,
        name: tenantModel.name,
        profile_photo: tenantModel.profile_photo,
        cover_photo: tenantModel.cover_photo,
        created_at: tenantModel.created_at,
        updated_at: tenantModel.updated_at,
      };
    }
    const tenantModel = createTenantResult.tenantModel;
    await this.teamUsersService.addUserToTenantTeamIfNotExist(
      iAuthRequester,
      unitOfWork,
      userModel,
      tenantModel
    );
    const transaction = this.tenantRepository.create(tenantModel.entity_id, {
      secret_key: tenantModel.secret_key,
      name: tenantModel.name,
      profile_photo: tenantModel.profile_photo,
      cover_photo: tenantModel.cover_photo,
      archived_at: null,
    });
    unitOfWork.addTransactionStep(transaction);
    await unitOfWork.commit();
    await this.abstractEventManager.dispatch(
      new TenantCreateEvent(),
      tenantModel
    );
    return {
      entity_id: tenantModel.entity_id,
      secret_key: tenantModel.secret_key,
      name: tenantModel.name,
      profile_photo: tenantModel.profile_photo,
      cover_photo: tenantModel.cover_photo,
      created_at: tenantModel.created_at,
      updated_at: tenantModel.updated_at,
    };
  }
}
