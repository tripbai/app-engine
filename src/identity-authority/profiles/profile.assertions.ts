import { injectable } from "inversify";
import { IsValid } from "../../core/helpers/isvalid";
import { Core } from "../../core/module/module";
import * as IdentityAuthority from "../module/types";
import { ProfileValidator } from "./profile.validator";

@injectable()
export class ProfileAssertions {
  isFirstName(
    value: unknown
  ): asserts value is IdentityAuthority.Profile.Fields.FirstName {
    assertNonEmptyString(value);
    ProfileValidator.first_name(value);
  }

  isLastName(
    value: unknown
  ): asserts value is IdentityAuthority.Profile.Fields.LastName {
    assertNonEmptyString(value);
    ProfileValidator.last_name(value);
  }
}
