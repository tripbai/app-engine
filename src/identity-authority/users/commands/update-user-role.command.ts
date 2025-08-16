import { inject, injectable } from "inversify";
import { UserRepository } from "../user.repository";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { IAuthRequesterFactory } from "../../requester/iauth-requester.factory";
import { UserUpdateService } from "../services/user-update.service";
import * as Core from "../../../core/module/types";
import * as IdentityAuthority from "../../module/types";
import { BadInputException } from "../../../core/exceptions/exceptions";

@injectable()
export class UpdateUserRoleCommand {
  constructor(
    @inject(UnitOfWorkFactory)
    private unitOfWorkFactory: UnitOfWorkFactory,
    @inject(IAuthRequesterFactory)
    private iAuthRequesterFactory: IAuthRequesterFactory,
    @inject(UserRepository) private userRepository: UserRepository,
    @inject(UserUpdateService)
    private userUpdateService: UserUpdateService
  ) {}

  async execute(
    requester: Core.Authorization.Requester,
    params: {
      user_id: Core.Entity.Id;
      newRole: "webadmin" | "user" | "moderator";
    }
  ): Promise<void> {
    const unitOfWork = this.unitOfWorkFactory.create();
    const iAuthRequester = this.iAuthRequesterFactory.create(requester);

    const userModel = await this.userRepository.getById(params.user_id);

    if (params.newRole === "webadmin") {
      await this.userUpdateService.setRoleAsWebadmin(iAuthRequester, userModel);
    } else if (params.newRole === "user") {
      await this.userUpdateService.setRoleAsUser(iAuthRequester, userModel);
    } else if (params.newRole === "moderator") {
      await this.userUpdateService.setRoleAsModerator(
        iAuthRequester,
        userModel
      );
    } else {
      throw new BadInputException({
        message: "Invalid role provided for user update",
        data: { user_id: params.user_id, role: params.newRole },
      });
    }
    await this.userRepository.update(userModel, unitOfWork);
    await unitOfWork.commit();
    return;
  }
}
