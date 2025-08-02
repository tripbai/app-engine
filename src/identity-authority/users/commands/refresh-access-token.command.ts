import { inject, injectable } from "inversify";
import { Core } from "../../../core/module/module";
import { IAuthRequesterFactory } from "../../requester/iauth-requester.factory";
import { UserRepository } from "../user.repository";
import { IdentityAuthority } from "../../module/module.interface";
import { ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";
import { RequesterTokenService } from "../../../core/requester/requester-token.service";

@injectable()
export class RefreshAccessTokenCommand {

  constructor(
    @inject(IAuthRequesterFactory) private requesterFactory: IAuthRequesterFactory,
    @inject(UserRepository) private userRepository: UserRepository,
    @inject(RequesterTokenService) private requesterTokenService: RequesterTokenService
  ) {}

  async execute(
    requester: Core.Authorization.Requester
  ) {
    const iAuthRequester = this.requesterFactory.create(requester)
    const userId = iAuthRequester.get().user.entity_id
    const userModel = await this.userRepository.getById(userId)
    if (userModel.status === 'banned' || userModel.status === 'suspended' ) {
      const prohibited: IdentityAuthority.Users.ApplicationAccess.Prohibited = userModel.status 
      throw new ResourceAccessForbiddenException({
        message: 'user is not allowed to refresh access token',
        data: { user_id: userModel.entity_id, prohibited_status: prohibited }
      })
    }
    const accessToken = this.requesterTokenService.generate({
      user: { id: userModel.entity_id, status: userModel.status },
      permissions: requester.permissions
    })
    return accessToken
  }

}