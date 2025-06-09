import { inject, injectable } from "inversify";
import { ProfileModel } from "../profile.model";
import { ProfileRepository } from "../profile.repository";
import { UnitOfWork } from "../../../core/workflow/unit-of-work";
import { IdentityAuthority } from "../../module/module.interface";
import { Core } from "../../../core/module/module";
import { UserModel } from "../../users/user.model";
import { TimeStamp } from "../../../core/helpers/timestamp";

@injectable()
export class ProfileCreateService {

  constructor(
    @inject(ProfileRepository) public readonly profileRepository: ProfileRepository
  ){}
  
  create(
    user_id: Core.Entity.Id,
    first_name: IdentityAuthority.Profile.Fields.FirstName,
    last_name: IdentityAuthority.Profile.Fields.LastName,
    profile_photo: IdentityAuthority.Profile.Fields.Image | null,
    cover_photo: IdentityAuthority.Profile.Fields.Image | null,
    about: string | null
  ): ProfileModel {
    const profileModel: ProfileModel = {
      entity_id: user_id,
      first_name: first_name,
      last_name: last_name,
      profile_photo: profile_photo,
      cover_photo: cover_photo,
      about: about,
      created_at: TimeStamp.now(),
      updated_at: TimeStamp.now(),
      archived_at: null
    }
    return profileModel
  }

}