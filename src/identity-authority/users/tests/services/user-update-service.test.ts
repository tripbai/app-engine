import { expect } from "chai";
import * as IdentityAuthority from "../../../module/types";
import { UserUpdateService } from "../../services/user-update.service";
import { createMock } from "../../../../core/utilities/mockup";
import { UserPasswordService } from "../../services/user-password.service";
import { UserActionTokenService } from "../../services/user-action-token.service";
import { UserRepository } from "../../user.repository";
import { UserConstraintService } from "../../services/user-constraint.service";
import { UserModel } from "../../user.model";
import { ResourceAccessForbiddenException } from "../../../../core/exceptions/exceptions";

describe("UserUpdateService", () => {
  describe("updateUsername", () => {
    it("should throw an error when the user is not active or unverified", async () => {
      const userPasswordService = createMock(UserPasswordService);
      const userActionTokenService = createMock(UserActionTokenService);
      const userRepository = createMock(UserRepository);
      const userConstraintService = createMock(UserConstraintService);
      const userUpdateService = new UserUpdateService(
        userPasswordService,
        userActionTokenService,
        userRepository,
        userConstraintService
      );
      const SuspendedJohn = new UserModel();
      SuspendedJohn.status = "suspended";
      try {
        await userUpdateService.updateUsername(
          SuspendedJohn,
          "newusername" as IdentityAuthority.Users.Fields.Username
        );
        throw new Error("the above did not throw an error");
      } catch (error) {
        expect(error).to.be.instanceOf(ResourceAccessForbiddenException);
        expect((error as ResourceAccessForbiddenException).message).to.equal(
          "cannot update user when user is not active or unverified"
        );
      }
      const BannedJohn = new UserModel();
      BannedJohn.status = "banned";
      try {
        await userUpdateService.updateUsername(
          BannedJohn,
          "newusername" as IdentityAuthority.Users.Fields.Username
        );
        throw new Error("the above did not throw an error");
      } catch (error) {
        expect(error).to.be.instanceOf(ResourceAccessForbiddenException);
        expect((error as ResourceAccessForbiddenException).message).to.equal(
          "cannot update user when user is not active or unverified"
        );
      }
    });
  });
});
