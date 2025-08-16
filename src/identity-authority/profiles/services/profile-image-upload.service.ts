import { inject, injectable } from "inversify";
import { IAuthImageTokenService } from "../../services/image-token.service";
import { IAuthImageUploadService } from "../../services/image-upload.service";
import { IAuthRequester } from "../../requester/iauth-requester";
import {
  BadInputException,
  ResourceAccessForbiddenException,
} from "../../../core/exceptions/exceptions";
import { UserRepository } from "../../users/user.repository";
import * as IdentityAuthority from "../../module/types";
import * as Core from "../../../core/module/types";

@injectable()
export class ProfileImageUploadService {
  constructor(
    @inject(IAuthImageUploadService)
    private iAuthImageUploadService: IAuthImageUploadService,
    @inject(IAuthImageTokenService)
    private iAuthImageTokenService: IAuthImageTokenService,
    @inject(UserRepository)
    private userRepository: UserRepository
  ) {}

  async uploadPhoto(
    uploaderUserId: Core.Entity.Id,
    type: "profile_photo" | "cover_photo",
    fileExtension: IdentityAuthority.Images.SupportedExtensions,
    buffer: Buffer
  ) {
    const userModel = await this.userRepository.getById(uploaderUserId);
    if (userModel.status !== "active" && userModel.status !== "unverified") {
      throw new ResourceAccessForbiddenException({
        message: "only active or unverified users can upload profile images",
        data: { user_id: uploaderUserId, status: userModel.status },
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
    throw new BadInputException({
      message: "invalid image type provided for upload",
      data: { type, tenant_id: userModel.entity_id },
    });
  }
}
