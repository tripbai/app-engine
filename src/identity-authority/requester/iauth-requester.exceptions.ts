import { logError } from "../../core/application/appLogger";
import * as Core from "../../core/module/types";

export class IAuthForbiddenAccessException extends Error {
  code: number;
  constructor(requester: Core.Authorization.Requester) {
    let generic = `You do not have the neccessary permissions to access this resource. `;
    generic += `Please refer to  your provider's documentation for more information.`;
    const message = generic;
    super(message);
    logError({
      severity: 5,
      message: "requester did not pass validation",
      data: requester,
    });
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = 403;
  }
}
