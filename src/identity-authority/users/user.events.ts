import { EventInterface } from "../../core/providers/event/event-manager.provider"
import { ProfileModel } from "../profiles/profile.model"
import { UserModel } from "./user.model"

export class UserCreateEvent implements EventInterface {
  id() {return '6edab822-6641-480f-917a-3831ecc6c084'}
  async handler(userModel: UserModel, profileModel: ProfileModel){}
}

export class UserUpdateEvent implements EventInterface {
  id() {return 'b1a093d6-5859-40c7-87d5-1044f60d19e2'}
  async handler(userModel: UserModel, profileModel: ProfileModel){}
}