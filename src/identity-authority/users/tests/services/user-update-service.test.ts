import { describe, it } from "node:test";
import { expect } from "chai";
import { Container } from "inversify";
import { bindDummyProviders } from "../integrations/dummy-providers";
import { bind } from "../../../../bindings";
import { UserAssertions } from "../../user.assertions";
import * as IdentityAuthority from "../../../module/types";
import { UserUpdateService } from "../../services/user-update.service";
import { getJohnUserModel } from "../integrations/dummy-users";

const container = new Container();
bindDummyProviders(container);
bind(container);

class TestUserAssertions extends UserAssertions {
  async isUniqueUsername(
    value: unknown
  ): Promise<IdentityAuthority.Users.Fields.UniqueUsername> {
    return value as IdentityAuthority.Users.Fields.UniqueUsername;
  }
}

describe("UserUpdateService", () => {
  describe("updateUsername", () => {
    it("should throw an error when the user is not active or unverified", async () => {
      const userAssertionsRebind = await container.rebind(UserAssertions);
      userAssertionsRebind.to(TestUserAssertions);
      const userUpdateService = container.get(UserUpdateService);
      const SuspendedJohn = await getJohnUserModel();
      SuspendedJohn.status = "suspended";
      try {
        await userUpdateService.updateUsername(
          SuspendedJohn,
          "newusername" as IdentityAuthority.Users.Fields.Username
        );
      } catch (error) {
        expect(error.message).to.equal(
          "cannot update user when user is not active or unverified"
        );
      }
      const BannedJohn = await getJohnUserModel();
      try {
        await userUpdateService.updateUsername(
          BannedJohn,
          "newusername" as IdentityAuthority.Users.Fields.Username
        );
      } catch (error) {
        expect(error.message).to.equal(
          "cannot update user when user is not active or unverified"
        );
      }
    });
  });
});
