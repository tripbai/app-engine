import { inject, injectable } from "inversify";
import { UserRepository } from "../user.repository";
import * as Core from "../../../core/module/types";
import { IAuthRequesterFactory } from "../../requester/iauth-requester.factory";
import { UnauthorizedAccessException } from "../../../core/exceptions/exceptions";
import { UserUpdateEvent } from "../user.events";
import { AbstractEventManagerProvider } from "../../../core/providers/event/event-manager.provider";
import { ProfileRepository } from "../../profiles/profile.repository";

@injectable()
export class BackfillUserSnippetCommand {
  constructor(
    @inject(UserRepository)
    private userRepository: UserRepository,
    @inject(IAuthRequesterFactory)
    private iAuthRequesterFactory: IAuthRequesterFactory,
    @inject(AbstractEventManagerProvider)
    private abstractEventManagerProvider: AbstractEventManagerProvider,
    @inject(ProfileRepository)
    private profileRepository: ProfileRepository
  ) {}

  async execute(
    userId: Core.Entity.Id,
    requester: Core.Authorization.Requester
  ): Promise<void> {
    const iAuthRequester = this.iAuthRequesterFactory.create(requester);
    if (!iAuthRequester.isWebAdmin()) {
      throw new UnauthorizedAccessException({
        message: "User is not authorized to backfill user snippets",
        data: { userId, requester },
      });
    }
    const userModel = await this.userRepository.getById(userId);
    const profileModel = await this.profileRepository.getById(userId);
    await this.abstractEventManagerProvider.dispatch(
      new UserUpdateEvent(),
      userModel,
      profileModel
    );
    return;
  }
}
