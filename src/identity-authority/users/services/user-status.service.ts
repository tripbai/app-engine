import { inject, injectable } from "inversify";
import { IAuthRequester } from "../../requester/iauth-requester";
import { UserModel } from "../user.model";
import { RecordAlreadyExistsException, ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";

@injectable()
export class UserStatusService {
  
  constructor(
    
  ){}

  suspendUser(
    iAuthRequester: IAuthRequester,
    userModel: UserModel,
    suspendedUntil: string
  ){
    if (userModel.status === 'suspended') {
      throw new RecordAlreadyExistsException({
        message: 'user has already been suspended',
        data: { user_id: userModel.entity_id }
      })
    }
    if (userModel.status !== 'active' && userModel.status !== 'unverified') {
      throw new RecordAlreadyExistsException({
        message: 'only active and unverified users can be suspended',
        data: { user_id: userModel.entity_id }
      })
    }
    if (!iAuthRequester.isAModerator()) {
      throw new ResourceAccessForbiddenException({
        message: 'only web admin and moderators can suspend a user',
        data: { user_id: userModel.entity_id }
      })
    }
    if (iAuthRequester.get().user.entity_id === userModel.entity_id) {
      throw new ResourceAccessForbiddenException({
        message: 'user cannot suspend himself',
        data: { user_id: userModel.entity_id }
      })
    }
    userModel.suspended_until = suspendedUntil
    userModel.status = 'suspended'
  }

  banUser(
    iAuthRequester: IAuthRequester,
    userModel: UserModel,
  ){
    if (userModel.status === 'banned' || userModel.status === 'archived') {
      throw new RecordAlreadyExistsException({
        message: 'user has already been archived or banned',
        data: { user_id: userModel.entity_id }
      })
    }
    if (!iAuthRequester.isAModerator()) {
      throw new ResourceAccessForbiddenException({
        message: 'only web admin and moderators can ban a user',
        data: { user_id: userModel.entity_id }
      })
    }
    if (iAuthRequester.get().user.entity_id === userModel.entity_id) {
      throw new ResourceAccessForbiddenException({
        message: 'user cannot ban himself',
        data: { user_id: userModel.entity_id }
      })
    }
    userModel.status = 'banned'
  }

  deactivateUser(
    iAuthRequester: IAuthRequester,
    userModel: UserModel,
  ){
    if (userModel.status === 'deactivated') {
      throw new RecordAlreadyExistsException({
        message: 'user has already been deactivated',
        data: { user_id: userModel.entity_id }
      })
    }
    if (userModel.status !== 'active' && userModel.status !== 'unverified') {
      throw new RecordAlreadyExistsException({
        message: 'only active and unverified users can be deactivaed',
        data: { user_id: userModel.entity_id }
      })
    }
    if (iAuthRequester.get().user.entity_id !== userModel.entity_id) {
      throw new ResourceAccessForbiddenException({
        message: 'only the user himself can deactivate himself',
        data: { user_id: userModel.entity_id }
      })
    }
    userModel.status = 'deactivated'
  }

  reactivateUser(
    iAuthRequester: IAuthRequester,
    userModel: UserModel,
  ){
    if (userModel.status === 'active' || userModel.status === 'unverified') {
      throw new RecordAlreadyExistsException({
        message: 'user has already been re-activated',
        data: { user_id: userModel.entity_id }
      })
    }
    if (userModel.status === 'banned') {
      throw new ResourceAccessForbiddenException({
        message: 'banned users cannot be reactivated',
        data: { user_id: userModel.entity_id }
      })
    }
    /**
     * Depending on whether the email is verified or not, the status on
     * activation will be determined.
     */
    const isUserVerified = userModel.is_email_verified
    const statusOnActivation = isUserVerified ? 'active' : 'unverified'

    if (userModel.status === 'deactivated') {
      if (iAuthRequester.get().user.entity_id !== userModel.entity_id) {
        throw new ResourceAccessForbiddenException({
          message: 'only the user himself can re-activate himself',
          data: { user_id: userModel.entity_id }
        })
      }
      userModel.status = statusOnActivation
      return
    }

    if (userModel.status === 'suspended') {
      if (iAuthRequester.get().user.entity_id === userModel.entity_id) {
        throw new ResourceAccessForbiddenException({
          message: 'user cannot un-suspend himself',
          data: { user_id: userModel.entity_id }
        })
      }
      if (!iAuthRequester.isAModerator()) {
        throw new ResourceAccessForbiddenException({
          message: 'only web admin and moderators can un-suspend a user',
          data: { user_id: userModel.entity_id }
        })
      }
      userModel.suspended_until = null
      userModel.status = statusOnActivation
      return
    }

    if (userModel.status === 'archived') {
      throw new ResourceAccessForbiddenException({
        message: 'archived users cannot be reactivated',
        data: { user_id: userModel.entity_id }
      })
    }

    const never: never = userModel.status

  }



}