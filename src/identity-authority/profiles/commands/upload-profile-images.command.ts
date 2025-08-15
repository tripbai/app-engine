import { inject, injectable } from "inversify";
import * as Core from "../../../core/module/types";
import * as IdentityAuthority from "../../module/types";
import { IAuthRequester } from "../../requester/iauth-requester";
import { IAuthRequesterFactory } from "../../requester/iauth-requester.factory";
import {
  BadRequestException,
  ResourceAccessForbiddenException,
} from "../../../core/exceptions/exceptions";
import { UserRepository } from "../../users/user.repository";
import { ProfileRepository } from "../profile.repository";
import { IAuthImageUploadService } from "../../services/image-upload.service";
import { IAuthImageTokenService } from "../../services/image-token.service";

@injectable()
export class UploadProfileImagesCommand {
  constructor(
    @inject(IAuthRequesterFactory)
    private readonly iAuthRequesterFactory: IAuthRequesterFactory,
    @inject(UserRepository) private readonly userRepository: UserRepository,
    @inject(ProfileRepository)
    private readonly profileRepository: ProfileRepository,
    @inject(IAuthImageUploadService)
    private readonly iAuthImageUploadService: IAuthImageUploadService,
    @inject(IAuthImageTokenService)
    private readonly iAuthImageTokenService: IAuthImageTokenService
  ) {}

  async execute(
    requester: Core.Authorization.Requester,
    type: "profile_photo" | "cover_photo",
    fileExtension: IdentityAuthority.Images.SupportedExtensions,
    buffer: Buffer
  ) {
    const requesterAuth = this.iAuthRequesterFactory.create(requester);
    if (!requesterAuth.isRegularUser()) {
      throw new ResourceAccessForbiddenException({
        message: "public users cannot invoke this command",
        data: requester,
      });
    }
    const userId = requesterAuth.get().user.entity_id;
    const userModel = await this.userRepository.getById(userId);
    if (userModel.status !== "active" && userModel.status !== "unverified") {
      throw new ResourceAccessForbiddenException({
        message: "only active or unverified users can upload profile images",
        data: { user_id: userId, status: userModel.status },
      });
    }
    if (type === "profile_photo") {
      const uploadPath = await this.iAuthImageUploadService.uploadProfilePhoto(
        fileExtension,
        buffer
      );
      const uploadToken = this.iAuthImageTokenService.generate(
        type,
        userModel.entity_id,
        uploadPath
      );
      return {
        file_path: uploadPath,
        upload_token: uploadToken,
      };
    }
    if (type === "cover_photo") {
      const uploadPath = await this.iAuthImageUploadService.uploadCoverPhoto(
        fileExtension,
        buffer
      );
      const uploadToken = this.iAuthImageTokenService.generate(
        type,
        userModel.entity_id,
        uploadPath
      );
      return {
        file_path: uploadPath,
        upload_token: uploadToken,
      };
    }
    throw new BadRequestException({
      message: "invalid image type provided for upload",
      data: { type, tenant_id: userModel.entity_id },
    });
  }
}
