import { inject, injectable } from "inversify";
import { UserPermissionService } from "../users/services/user-permission.service";
import { Core } from "../../core/module/module";
import { IAuthRequester } from "./iauth-requester";

@injectable()
export class IAuthRequesterFactory {

  constructor(
    @inject(UserPermissionService) public readonly userPermissionService: UserPermissionService
  ){}

  create(requester: Core.Authorization.Requester){
    return new IAuthRequester(
      requester, this.userPermissionService
    )
  }

}