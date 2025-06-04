import { injectable } from "inversify";
const authenticator = require('authenticator')

@injectable()
export class UserOTPService {

  generateOtpSecret(): string {
    return authenticator.generateKey().replace(/\W/g, '').toLowerCase()
  }

}