import { expect } from "chai";
import * as IdentityAuthority from "../../../module/types";
import { UserAccessReportService } from "../../services/user-access-report.service";
import { createMock } from "../../../../core/utilities/mockup";
import { UserRepository } from "../../user.repository";
import { UserAuthService } from "../../services/user-auth.service";
import { UserPermissionService } from "../../services/user-permission.service";
import { RequesterTokenService } from "../../../../core/requester/requester-token.service";
import { UserModel } from "../../user.model";
import { ResourceAccessForbiddenException } from "../../../../core/exceptions/exceptions";
import { createEntityId } from "../../../../core/utilities/entityToolkit";

describe("Access User Integration", async () => {
  it("should return is_user_registered=false when the email address does not exist", async () => {
    const userRepository = createMock(UserRepository, {
      getByEmailAddress: async () => null,
    });
    const userAuthService = createMock(UserAuthService);
    const userPermissionService = createMock(UserPermissionService);
    const requesterTokenService = createMock(RequesterTokenService);
    const userAccessReportService = new UserAccessReportService(
      userRepository,
      userAuthService,
      userPermissionService,
      requesterTokenService
    );
    const result = await userAccessReportService.createAccessReport({
      provider: "iauth",
      email_address:
        "nonexistent@example.com" as IdentityAuthority.Users.Fields.EmailAddress,
      password: "helloworld143!" as IdentityAuthority.Users.Fields.RawPassword,
    });
    expect(result).to.deep.include({
      is_user_registered: false,
    });
  });

  it("should throw an error for fireauth hosted users", async () => {
    const userModel = new UserModel();
    userModel.identity_provider = "fireauth";
    const userRepository = createMock(UserRepository, {
      getByEmailAddress: async () => userModel,
    });
    const userAuthService = createMock(UserAuthService, {
      assertAssignedIdentityProvider: () => {},
    });
    const userPermissionService = createMock(UserPermissionService);
    const requesterTokenService = createMock(RequesterTokenService);
    const userAccessReportService = new UserAccessReportService(
      userRepository,
      userAuthService,
      userPermissionService,
      requesterTokenService
    );
    try {
      await userAccessReportService.createAccessReport({
        provider: "fireauth",
        email_address:
          "nonexistent@example.com" as IdentityAuthority.Users.Fields.EmailAddress,
        password:
          "helloworld143!" as IdentityAuthority.Users.Fields.RawPassword,
      });
      throw new Error("the above did not throw an error");
    } catch (error) {
      expect(error).to.be.instanceOf(ResourceAccessForbiddenException);
      expect((error as ResourceAccessForbiddenException).message).to.equal(
        "fireauth hosted users cannot use this method"
      );
    }
  });

  it("should throw an error for google hosted users", async () => {
    const userModel = new UserModel();
    userModel.identity_provider = "google";
    const userRepository = createMock(UserRepository, {
      getByEmailAddress: async () => userModel,
    });
    const userAuthService = createMock(UserAuthService, {
      assertAssignedIdentityProvider: () => {},
    });
    const userPermissionService = createMock(UserPermissionService);
    const requesterTokenService = createMock(RequesterTokenService);
    const userAccessReportService = new UserAccessReportService(
      userRepository,
      userAuthService,
      userPermissionService,
      requesterTokenService
    );
    try {
      await userAccessReportService.createAccessReport({
        provider: "google",
        email_address:
          "nonexistent@example.com" as IdentityAuthority.Users.Fields.EmailAddress,
        password:
          "helloworld143!" as IdentityAuthority.Users.Fields.RawPassword,
      });
      throw new Error("the above did not throw an error");
    } catch (error) {
      expect(error).to.be.instanceOf(ResourceAccessForbiddenException);
      expect((error as ResourceAccessForbiddenException).message).to.equal(
        "google hosted users cannot use this method"
      );
    }
  });

  it("should return access_type=prohibited for suspended user", async () => {
    const userRepository = createMock(UserRepository);
    const userAuthService = createMock(UserAuthService);
    const userPermissionService = createMock(UserPermissionService);
    const requesterTokenService = createMock(RequesterTokenService);
    const userAccessReportService = new UserAccessReportService(
      userRepository,
      userAuthService,
      userPermissionService,
      requesterTokenService
    );
    const userId = createEntityId();
    const userModel = new UserModel();
    userModel.entity_id = userId;
    userModel.status = "suspended";
    const report = userAccessReportService.generateStatusBasedReport(
      userModel,
      ""
    );
    expect(report).to.deep.include({
      access_type: "prohibited",
      is_user_registered: true,
      user_id: userId,
      user_status: "suspended",
    });
  });

  it("should return access_type=limited for deactivated user", async () => {
    const userRepository = createMock(UserRepository);
    const userAuthService = createMock(UserAuthService);
    const userPermissionService = createMock(UserPermissionService);
    const requesterTokenService = createMock(RequesterTokenService);
    const userAccessReportService = new UserAccessReportService(
      userRepository,
      userAuthService,
      userPermissionService,
      requesterTokenService
    );
    const userId = createEntityId();
    const userModel = new UserModel();
    userModel.entity_id = userId;
    userModel.status = "deactivated";
    const report = userAccessReportService.generateStatusBasedReport(
      userModel,
      "<access_token>"
    );
    expect(report).to.deep.include({
      access_type: "limited",
      is_user_registered: true,
      user_status: "deactivated",
      token: "<access_token>",
      user_id: userId,
    });
  });

  it("should return access_type=allowed for active user", async () => {
    const userRepository = createMock(UserRepository);
    const userAuthService = createMock(UserAuthService);
    const userPermissionService = createMock(UserPermissionService);
    const requesterTokenService = createMock(RequesterTokenService);
    const userAccessReportService = new UserAccessReportService(
      userRepository,
      userAuthService,
      userPermissionService,
      requesterTokenService
    );
    const userId = createEntityId();
    const userModel = new UserModel();
    userModel.entity_id = userId;
    userModel.status = "active";
    const report = userAccessReportService.generateStatusBasedReport(
      userModel,
      "<access_token>"
    );
    expect(report).to.deep.include({
      is_user_registered: true,
      user_id: userModel.entity_id,
      user_status: "active",
      token: "<access_token>",
      access_type: "allowed",
    });
  });
});
