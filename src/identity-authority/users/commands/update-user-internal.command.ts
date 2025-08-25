import { inject, injectable } from "inversify";
import * as IdentityAuthority from "../../module/types";
import * as Core from "../../../core/module/types";
import { IAuthRequesterFactory } from "../../requester/iauth-requester.factory";
import { UserRepository } from "../user.repository";
import { ProfileRepository } from "../../profiles/profile.repository";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";
import { ProfileUpdateService } from "../../profiles/services/profile-update.service";
import { UserUpdateService } from "../services/user-update.service";
import { AbstractEventManagerProvider } from "../../../core/providers/event/event-manager.provider";
import { UserUpdateEvent } from "../user.events";

@injectable()
export class UpdateUserInternalCommand {
  constructor(
    @inject(IAuthRequesterFactory)
    private iAuthRequesterFactory: IAuthRequesterFactory,
    @inject(UnitOfWorkFactory) private unitOfWorkFactory: UnitOfWorkFactory,
    @inject(UserRepository) private userRepository: UserRepository,
    @inject(ProfileRepository) private profileRepository: ProfileRepository,
    @inject(ProfileUpdateService)
    private profileUpdateService: ProfileUpdateService,
    @inject(UserUpdateService)
    private userUpdateService: UserUpdateService,
    @inject(AbstractEventManagerProvider)
    private abstractEventManagerProvider: AbstractEventManagerProvider
  ) {}

  async execute(
    userId: Core.Entity.Id,
    requester: Core.Authorization.Requester,
    params: {
      first_name?: IdentityAuthority.Profile.Fields.FirstName;
      last_name?: IdentityAuthority.Profile.Fields.LastName;
      about?: string;
      username?: IdentityAuthority.Users.Fields.Username;
      email_address?: IdentityAuthority.Users.Fields.EmailAddress;
      is_email_verified?: boolean;
    }
  ) {
    const unitOfWork = this.unitOfWorkFactory.create();
    const userModel = await this.userRepository.getById(userId);
    const profileModel = await this.profileRepository.getById(userId);
    const iAuthRequester = this.iAuthRequesterFactory.create(requester);
    if (
      !iAuthRequester.isAModerator() ||
      !iAuthRequester.canOperateThisUser(userModel.entity_id)
    ) {
      throw new ResourceAccessForbiddenException({
        message: "insufficient permission to operate this user",
        data: { user_id: userId, requester: requester },
      });
    }
    if (params.first_name) {
      this.profileUpdateService.updateFirstName(
        profileModel,
        params.first_name
      );
    }
    if (params.last_name) {
      this.profileUpdateService.updateLastName(profileModel, params.last_name);
    }
    if (params.about) {
      this.profileUpdateService.updateAbout(profileModel, params.about);
    }
    if (params.email_address) {
      await this.userUpdateService.forceUpdateEmail(
        iAuthRequester,
        userModel,
        params.email_address
      );
    }
    if (params.username) {
      await this.userUpdateService.updateUsername(userModel, params.username);
    }
    if (params.is_email_verified) {
      this.userUpdateService.forceVerifyUser(iAuthRequester, userModel);
    }
    await this.profileRepository.update(profileModel, unitOfWork);
    await this.userRepository.update(userModel, unitOfWork);
    await unitOfWork.commit();
    await this.abstractEventManagerProvider.dispatch(
      new UserUpdateEvent(),
      userModel,
      profileModel
    );
    return;
  }
}
