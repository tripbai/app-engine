import { inject, injectable } from "inversify";
import { UserCreateService } from "../services/user-create.service";
import { ProfileCreateService } from "../../profiles/services/profile-create.service";
import * as IdentityAuthority from "../../module/types";
import { UserModel } from "../user.model";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { UserRepository } from "../user.repository";
import { ProfileRepository } from "../../profiles/profile.repository";
import { RequesterTokenService } from "../../../core/requester/requester-token.service";
import { UserPermissionService } from "../services/user-permission.service";
import { AbstractEventManagerProvider } from "../../../core/providers/event/event-manager.provider";
import { UserCreateEvent } from "../user.events";
import { assertIsRawPassword } from "../user.assertions";
import { BadInputException } from "../../../core/exceptions/exceptions";

@injectable()
export class CreateUserCommand {
  constructor(
    @inject(UserCreateService)
    private userCreateService: UserCreateService,
    @inject(ProfileCreateService)
    private profileCreateService: ProfileCreateService,
    @inject(UnitOfWorkFactory)
    private unitOfWorkFactory: UnitOfWorkFactory,
    @inject(RequesterTokenService)
    private requesterTokenService: RequesterTokenService,
    @inject(UserPermissionService)
    private userPermissionService: UserPermissionService,
    @inject(AbstractEventManagerProvider)
    private abstractEventManagerProvider: AbstractEventManagerProvider
  ) {}

  async execute(params: {
    provider: IdentityAuthority.Providers.Identity;
    first_name: IdentityAuthority.Profile.Fields.FirstName;
    last_name: IdentityAuthority.Profile.Fields.LastName;
    username: IdentityAuthority.Users.Fields.Username;
    email_address: IdentityAuthority.Users.Fields.EmailAddress;
    password: IdentityAuthority.Users.Fields.RawPassword | null;
    type: IdentityAuthority.Users.Type;
    creation_context: UserModel["creation_context"];
    role: UserModel["role"];
    status: IdentityAuthority.Users.Status.Type;
  }): Promise<IdentityAuthority.Users.Endpoints.Create["response"]> {
    const unitOfWork = this.unitOfWorkFactory.create();
    const userModel = await this.userCreateService.createUser(
      params.provider,
      params.username,
      params.email_address,
      params.password,
      params.type,
      params.creation_context,
      params.role,
      params.status,
      unitOfWork
    );
    const profileModel = this.profileCreateService.create(
      userModel.entity_id,
      params.first_name,
      params.last_name,
      null,
      null,
      null,
      unitOfWork
    );
    await unitOfWork.commit();
    await this.abstractEventManagerProvider.dispatch(
      new UserCreateEvent(),
      userModel,
      profileModel
    );
    const token = this.requesterTokenService.generate({
      user: { id: userModel.entity_id, status: userModel.status },
      permissions: this.userPermissionService.addPermissionsByRole(
        [],
        userModel.entity_id,
        userModel.role
      ),
    });
    return {
      type: params.type,
      context: params.creation_context,
      provider: params.provider,
      role: params.role,
      user_id: userModel.entity_id,
      first_name: profileModel.first_name,
      last_name: profileModel.last_name,
      username: userModel.username,
      email_address: userModel.email_address,
      status: params.status,
      iauth_token: token,
    };
  }
}
