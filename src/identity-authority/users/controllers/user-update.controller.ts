import { injectable } from "inversify";
import { patch } from "../../../core/router/decorators";
import { IdentityAuthority } from "../../module/module.interface";

@injectable()
export class UserUpdateController {

  // @patch<IdentityAuthority.Users.Endpoints.UpdateUserModel>('identity-authority/users/:user_id')
  async updateUserModel(){

  }

}