import { inject, injectable } from "inversify";
import * as Core from "../../../core/module/types";
import * as IdentityAuthority from "../../module/types";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { IAuthRequester } from "../../requester/iauth-requester";
import { IAuthRequesterFactory } from "../../requester/iauth-requester.factory";
import { UserStatusService } from "../services/user-status.service";
import { UserRepository } from "../user.repository";
import { ProfileRepository } from "../../profiles/profile.repository";
import { AbstractEventManagerProvider } from "../../../core/providers/event/event-manager.provider";
import { UserUpdateEvent } from "../user.events";

@injectable()
export class UpdateUserStatusCommand {
  constructor(
    @inject(UnitOfWorkFactory)
    private unitOfWorkFactory: UnitOfWorkFactory,
    @inject(IAuthRequesterFactory)
    private iAuthRequesterFactory: IAuthRequesterFactory,
    @inject(UserRepository) private userRepository: UserRepository,
    @inject(UserStatusService)
    private userStatusService: UserStatusService,
    @inject(ProfileRepository)
    private profileRepository: ProfileRepository,
    @inject(AbstractEventManagerProvider)
    private abstractEventManagerProvider: AbstractEventManagerProvider
  ) {}

  async execute(
    requester: Core.Authorization.Requester,
    params: {
      user_id: Core.Entity.Id;
      status: IdentityAuthority.Users.Status.Type;
      suspended_until?: string;
    }
  ): Promise<void> {
    const unitOfWork = this.unitOfWorkFactory.create();
    const iAuthRequester = this.iAuthRequesterFactory.create(requester);
    const userModel = await this.userRepository.getById(params.user_id);
    const profileModel = await this.profileRepository.getById(
      userModel.entity_id
    );
    if (params.status === "active") {
      this.userStatusService.reactivateUser(iAuthRequester, userModel);
    }
    if (params.status === "archived") {
      this.userStatusService.archiveUser(iAuthRequester, userModel);
    }
    if (params.status === "banned") {
      this.userStatusService.banUser(iAuthRequester, userModel);
    }
    if (params.status === "deactivated") {
      this.userStatusService.deactivateUser(iAuthRequester, userModel);
    }
    if (params.status === "suspended" && params.suspended_until) {
      this.userStatusService.suspendUser(
        iAuthRequester,
        userModel,
        params.suspended_until
      );
    }
    await this.userRepository.update(userModel, unitOfWork);
    await unitOfWork.commit();
    await this.abstractEventManagerProvider.dispatch(
      new UserUpdateEvent(),
      userModel,
      profileModel
    );
  }
}
