import { injectable } from "inversify";
import { IsValid } from "../../core/helpers/isvalid";
import { Core } from "../../core/module/module";
import { IdentityAuthority } from "../module/module.interface";
import { ProfileValidator } from "./profile.validator";

@injectable()
export class ProfileAssertions {

  isFirstName(value: unknown): asserts value is IdentityAuthority.Profile.Fields.FirstName {
    IsValid.NonEmptyString(value)
    ProfileValidator.first_name(value)
  }

  isLastName(value: unknown): asserts value is IdentityAuthority.Profile.Fields.LastName {
    IsValid.NonEmptyString(value)
    ProfileValidator.last_name(value)
  }

}