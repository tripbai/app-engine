import { inject, injectable } from "inversify";
import { get } from "../../../core/router/route-decorators";
import * as IdentityAuthority from "../../module/types";
import * as Core from "../../../core/module/types";
import { UserPermissionService } from "../services/user-permission.service";
import { UserRepository } from "../user.repository";
import { ProfileRepository } from "../../profiles/profile.repository";
import {
  BadRequestException,
  RecordNotFoundException,
  ResourceAccessForbiddenException,
} from "../../../core/exceptions/exceptions";
import { IAuthRequesterFactory } from "../../requester/iauth-requester.factory";
import { IAuthForbiddenAccessException } from "../../requester/iauth-requester.exceptions";
import { assertNonEmptyString } from "../../../core/utilities/assertValid";
import { assertValidEntityId } from "../../../core/utilities/entityToolkit";
import { assertIsEmailAddress, assertIsUsername } from "../user.assertions";

@injectable()
export class UserGetController {
  constructor(
    @inject(IAuthRequesterFactory)
    private iAuthRequesterFactory: IAuthRequesterFactory,
    @inject(UserRepository) private userRepository: UserRepository,
    @inject(ProfileRepository)
    private profileRepository: ProfileRepository
  ) {}

  @get<IdentityAuthority.Users.Endpoints.GetSelf>("/identity-authority/user/me")
  async me<T extends IdentityAuthority.Users.Endpoints.GetSelf>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T["response"]> {
    const iAuthRequester = this.iAuthRequesterFactory.create(params.requester);
    if (!iAuthRequester.isRegularUser()) {
      throw new IAuthForbiddenAccessException(params.requester);
    }
    const userId = iAuthRequester.get().user.entity_id;
    const userModel = await this.userRepository.getById(userId);
    const profileModel = await this.profileRepository.getById(userId);
    return {
      entity_id: userModel.entity_id,
      first_name: profileModel.first_name,
      last_name: profileModel.last_name,
      profile_photo: profileModel.profile_photo,
      cover_photo: profileModel.cover_photo,
      about: profileModel.about,
      username: userModel.username,
      email_address: userModel.email_address,
      is_email_verified: userModel.is_email_verified,
      user_type: userModel.type,
      status: userModel.status,
      verified_since: userModel.verified_since,
      role: userModel.role,
    };
  }

  @get<IdentityAuthority.Users.Endpoints.GetModel>(
    "/identity-authority/users/:user_id"
  )
  async getUserModel<T extends IdentityAuthority.Users.Endpoints.GetModel>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T["response"]> {
    try {
      assertNonEmptyString(params.data.user_id);
      assertValidEntityId(params.data.user_id);
    } catch (error) {
      throw new BadRequestException({
        message: "invalid user id",
        data: { user_id: params.data.user_id },
      });
    }
    const iAuthRequester = this.iAuthRequesterFactory.create(params.requester);
    if (!iAuthRequester.hasAllowedAccess())
      throw new IAuthForbiddenAccessException(params.requester);
    if (!iAuthRequester.isRegularUser())
      throw new IAuthForbiddenAccessException(params.requester);
    if (!iAuthRequester.canOperateThisUser(params.data.user_id))
      throw new IAuthForbiddenAccessException(params.requester);
    const userIdToRetrieve = params.data.user_id;
    const userModel = await this.userRepository.getById(userIdToRetrieve);
    const profileModel = await this.profileRepository.getById(userIdToRetrieve);
    return {
      id: userModel.entity_id,
      first_name: profileModel.first_name,
      last_name: profileModel.last_name,
      profile_photo: profileModel.profile_photo,
      cover_photo: profileModel.cover_photo,
      about: profileModel.about,
      identity_provider: userModel.identity_provider,
      email_address: userModel.email_address,
      username: userModel.username,
      is_email_verified: userModel.is_email_verified,
      verified_since: userModel.verified_since,
      suspended_until: userModel.suspended_until,
      creation_context: userModel.creation_context,
      role: userModel.role,
      status: userModel.status,
      type: userModel.type,
      created_at: userModel.created_at,
      updated_at: userModel.updated_at,
      archived_at: userModel.archived_at,
    };
  }

  @get<IdentityAuthority.Users.Endpoints.GetByEmailOrUsername>(
    "/identity-authority/user/get/snippet?type=:type&value=:value"
  )
  async getByEmailOrUsername<
    T extends IdentityAuthority.Users.Endpoints.GetByEmailOrUsername
  >(params: Core.Route.ControllerDTO<T>): Promise<T["response"]> {
    try {
      assertNonEmptyString(params.data.type);
      assertNonEmptyString(params.data.value);
      if (!["email_address", "username"].includes(params.data.type)) {
        throw new BadRequestException({
          message: "invalid type, must be email_address or username",
          data: { type: params.data.type },
        });
      }
    } catch (error) {
      throw new BadRequestException({
        message: "invalid get params",
        data: {},
      });
    }

    if (params.data.type === "email_address") {
      assertIsEmailAddress(params.data.value);
      const userModel = await this.userRepository.getByEmailAddress(
        params.data.value
      );
      if (userModel === null) {
        throw new RecordNotFoundException({
          message: "user not found",
          data: { email_address: params.data.value },
        });
      }
      const profileModel = await this.profileRepository.getById(
        userModel.entity_id
      );
      return {
        id: userModel.entity_id,
        first_name: profileModel.first_name,
        last_name: profileModel.last_name,
        email_address: userModel.email_address,
        username: userModel.username,
        is_email_verified: userModel.is_email_verified,
        status: userModel.status,
        profile_photo: profileModel.profile_photo,
        cover_photo: profileModel.cover_photo,
        user_type: userModel.type,
      };
    }

    if (params.data.type === "username") {
      assertIsUsername(params.data.value);
      const userModel = await this.userRepository.getByUsername(
        params.data.value
      );
      if (userModel === null) {
        throw new RecordNotFoundException({
          message: "user not found",
          data: { username: params.data.value },
        });
      }
      const profileModel = await this.profileRepository.getById(
        userModel.entity_id
      );
      return {
        id: userModel.entity_id,
        first_name: profileModel.first_name,
        last_name: profileModel.last_name,
        email_address: userModel.email_address,
        username: userModel.username,
        is_email_verified: userModel.is_email_verified,
        status: userModel.status,
        profile_photo: profileModel.profile_photo,
        cover_photo: profileModel.cover_photo,
        user_type: userModel.type,
      };
    }

    throw new BadRequestException({
      message: "invalid type, must be email_address or username",
      data: { type: params.data.type },
    });
  }
}
