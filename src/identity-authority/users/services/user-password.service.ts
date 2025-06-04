import { injectable } from "inversify";
import { IdentityAuthority } from "../../module/module.interface";
const bcrypt = require("bcryptjs")

@injectable()
export class UserPasswordService {
  
  async hashPassword(password: IdentityAuthority.Users.Fields.RawPassword): Promise<IdentityAuthority.Users.Fields.HashedPassword> {
    return await bcrypt.hash(password, 10)
  }

}