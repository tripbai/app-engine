import { inject, injectable } from "inversify";
import { UploadProfileImagesCommand } from "../commands/upload-profile-images.command";
import { post } from "../../../core/router/route-decorators";
import * as IdentityAuthority from "../../module/types";
import * as Core from "../../../core/module/types";
import { ImageHelperService } from "../../services/image-helper.service";
import { BadRequestException } from "../../../core/exceptions/exceptions";
import {
  assertFileObject,
  assertNonEmptyString,
} from "../../../core/utilities/assertValid";
import { assertValidEntityId } from "../../../core/utilities/entityToolkit";

@injectable()
export class ProfileImagesController {
  constructor(
    @inject(UploadProfileImagesCommand)
    private uploadProfileImagesCommand: UploadProfileImagesCommand,
    @inject(ImageHelperService)
    private imageAssertionService: ImageHelperService
  ) {}

  @post<IdentityAuthority.Users.Endpoints.UploadImage>(
    "/identity-authority/users/:user_id/images/upload"
  )
  async uploadProfileImage<
    T extends IdentityAuthority.Users.Endpoints.UploadImage
  >(params: Core.Route.ControllerDTO<T>): Promise<T["response"]> {
    try {
      assertValidEntityId(params.data.user_id);
      assertNonEmptyString(params.data.type);
      if (
        params.data.type !== "profile_photo" &&
        params.data.type !== "cover_photo"
      ) {
        throw new Error(
          `Invalid image type provided: ${params.data.type}. Expected 'profile_photo' or 'cover_photo'.`
        );
      }
      assertFileObject(params.data.file);
    } catch (error) {
      throw new BadRequestException({
        message: "failed to upload user image due to invalid parameters",
        data: { error, tenant_id: params.data.user_id },
      });
    }
    const result = await this.uploadProfileImagesCommand.execute(
      params.requester,
      params.data.type,
      this.imageAssertionService.convertMimeTypeToFileExtensionName(
        params.data.file.data.file.mimetype
      ),
      params.data.file.data.file.data
    );
    return {
      upload_token: result.upload_token,
      relative_path: result.file_path,
    };
  }
}
