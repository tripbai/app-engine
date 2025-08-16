import { inject, injectable } from "inversify";
import * as Core from "../../../core/module/types";
import * as IdentityAuthority from "../../module/types";
import { IAuthRequesterFactory } from "../../requester/iauth-requester.factory";
import { ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";
import { ProfileImageUploadService } from "../services/profile-image-upload.service";

@injectable()
export class UploadProfileImagesCommand {
  constructor(
    @inject(IAuthRequesterFactory)
    private iAuthRequesterFactory: IAuthRequesterFactory,
    @inject(ProfileImageUploadService)
    private profileImageUploadService: ProfileImageUploadService
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
    const uploaderUserId = requesterAuth.get().user.entity_id;
    return await this.profileImageUploadService.uploadPhoto(
      uploaderUserId,
      type,
      fileExtension,
      buffer
    );
  }
}
