import { inject, injectable } from "inversify";
import { ProfileModel } from "../profile.model";
import { ProfileRepository } from "../profile.repository";
import { UnitOfWork } from "../../../core/workflow/unit-of-work";
import * as IdentityAuthority from "../../module/types";
import * as Core from "../../../core/module/types";

@injectable()
export class ProfileCreateService {
  constructor(
    @inject(ProfileRepository)
    private profileRepository: ProfileRepository
  ) {}

  create(
    user_id: Core.Entity.Id,
    first_name: IdentityAuthority.Profile.Fields.FirstName,
    last_name: IdentityAuthority.Profile.Fields.LastName,
    profile_photo: IdentityAuthority.Profile.Fields.Image | null,
    cover_photo: IdentityAuthority.Profile.Fields.Image | null,
    about: string | null,
    unitOfWork: UnitOfWork
  ): ProfileModel {
    const data = {
      first_name: first_name,
      last_name: last_name,
      profile_photo: profile_photo,
      cover_photo: cover_photo,
      about: about,
    };
    const options = {
      useEntityId: user_id,
    };
    const profileModel = this.profileRepository.create(
      data,
      unitOfWork,
      options
    );
    return profileModel;
  }
}
