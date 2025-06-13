import { inject, injectable } from "inversify";
import { UserPermissionService } from "../users/services/user-permission.service";
import { Core } from "../../core/module/module";
import { IAuthRequester } from "./iauth-requester";
import { AppAuthService } from "../../core/auth/services/app-auth-service";

@injectable()
export class IAuthRequesterFactory {

  constructor(
    @inject(UserPermissionService) public readonly userPermissionService: UserPermissionService,
    @inject(AppAuthService) public readonly appAuthService: AppAuthService
  ){}

  create(requesterContext: Core.Authorization.Requester){
    return new IAuthRequester(
      requesterContext, 
      this.userPermissionService,
      this.appAuthService
    )
  }

}