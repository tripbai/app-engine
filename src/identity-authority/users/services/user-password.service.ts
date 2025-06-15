import { injectable } from "inversify";
import { IdentityAuthority } from "../../module/module.interface";
const bcrypt = require("bcryptjs")

@injectable()
export class UserPasswordService {
  
  async hashPassword(password: IdentityAuthority.Users.Fields.RawPassword): Promise<IdentityAuthority.Users.Fields.HashedPassword> {
    return await bcrypt.hash(password, 10)
  }

  async verifyPassword(
    raw: IdentityAuthority.Users.Fields.RawPassword, 
    hashed: IdentityAuthority.Users.Fields.HashedPassword | null
  ): Promise<boolean> {
    if (hashed === null) return false
    return await new Promise((resolve, reject) => {
      bcrypt.compare(raw,hashed,(error, result)=>{
        if (error) return resolve(false)
        if (result) return resolve(true)
        resolve(false)
      })
    })
  }

  

}