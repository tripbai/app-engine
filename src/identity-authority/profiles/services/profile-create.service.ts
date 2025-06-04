import { inject, injectable } from "inversify";
import { ProfileModel } from "../profile.model";
import { TransactionManager } from "../../../core/transaction/transaction.manager";
import { ProfileRepository } from "../profile.repository";

@injectable()
export class ProfileCreateService {

  constructor(
    @inject(ProfileRepository) public readonly profileRepository: ProfileRepository
  ){}
  
  create(
    profileModel: ProfileModel,
    transactions: TransactionManager
  ){
    const transaction = this.profileRepository.create(
      profileModel.entity_id,
      {
        first_name: profileModel.first_name,
        last_name: profileModel.last_name,
        profile_photo: profileModel.profile_photo,
        cover_photo: profileModel.cover_photo,
        about: profileModel.about,
        archived_at: null
      }
    )
    transactions.stage(transaction)
  }

}