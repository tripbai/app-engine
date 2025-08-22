import { inject, injectable } from "inversify";
import { post } from "../../../core/router/route-decorators";
import * as IdentityAuthority from "../../module/types";
import * as Core from "../../../core/module/types";
import { UserAccessReportService } from "../services/user-access-report.service";
import { BadRequestException } from "../../../core/exceptions/exceptions";
import {
  assertIsEmailAddress,
  assertIsIdentityProvider,
  assertIsRawPassword,
} from "../user.assertions";

@injectable()
export class UserAccessReportController {
  constructor(
    @inject(UserAccessReportService)
    private userAccessReportService: UserAccessReportService
  ) {}

  @post<IdentityAuthority.Users.Endpoints.AccessReport>(
    "/identity-authority/access-report"
  )
  async createAccess<T extends IdentityAuthority.Users.Endpoints.AccessReport>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T["response"]> {
    try {
      assertIsEmailAddress(params.data.email_address);
      assertIsRawPassword(params.data.password);
      assertIsIdentityProvider(params.data.provider);
    } catch (error) {
      throw new BadRequestException({
        message: "invalid generate auth token params",
        data: { params: params },
      });
    }
    return await this.userAccessReportService.createAccessReport({
      provider: params.data.provider,
      email_address: params.data.email_address,
      password: params.data.password,
    });
  }
}
