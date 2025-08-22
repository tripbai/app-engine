import { injectable } from "inversify";
import * as IdentityAuthority from "../../module/types";
const bcrypt = require("bcryptjs");

@injectable()
export class UserPasswordService {
  async hashPassword(
    password: IdentityAuthority.Users.Fields.RawPassword
  ): Promise<IdentityAuthority.Users.Fields.HashedPassword> {
    return await bcrypt.hash(password, 10);
  }

  async verifyPassword(
    raw: IdentityAuthority.Users.Fields.RawPassword,
    hashed: IdentityAuthority.Users.Fields.HashedPassword | null
  ): Promise<boolean> {
    if (hashed === null) return false;
    return await new Promise((resolve, reject) => {
      bcrypt.compare(raw, hashed, (error: Error | undefined, same: boolean) => {
        if (error) return resolve(false);
        if (same) return resolve(true);
        resolve(false);
      });
    });
  }
}
