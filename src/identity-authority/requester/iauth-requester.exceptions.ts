import { Application } from "../../core/application";
import { AppLogger } from "../../core/helpers/logger";
import { Core } from "../../core/module/module";

export class IAuthForbiddenAccessException extends Error {
  code: number;
  constructor(requester: Core.Authorization.Requester) {
    let generic = `You do not have the neccessary permissions to access this resource. `;
    generic += `Please refer to  your provider's documentation for more information.`;
    const message = generic
    super(message)
    AppLogger.error(
      { severity: 5, message: 'requester did not pass validation', data: requester }
    )
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = 403;
  }
}