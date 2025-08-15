import { inject, injectable } from "inversify";
import { post } from "../../../core/router/route-decorators";
import { IdentityAuthority } from "../../module/module.interface";
import { Core } from "../../../core/module/module";
import { UserAccessReportService } from "../services/user-access-report.service";
import { BadRequestException } from "../../../core/exceptions/exceptions";
import { UserValidator } from "../user.validator";
import { IsValid } from "../../../core/helpers/isvalid";
import { UserAssertions } from "../user.assertions";

@injectable()
export class UserAccessReportController {
  constructor(
    @inject(UserAccessReportService)
    public readonly userAccessReportService: UserAccessReportService,
    @inject(UserAssertions) public readonly userAssertions: UserAssertions
  ) {}

  @post<IdentityAuthority.Users.Endpoints.AccessReport>(
    "/identity-authority/access-report"
  )
  async createAccess<T extends IdentityAuthority.Users.Endpoints.AccessReport>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T["response"]> {
    try {
      this.userAssertions.isEmailAddress(params.data.email_address);
      this.userAssertions.isRawPassword(params.data.password);
      this.userAssertions.isProvider(params.data.provider);
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
