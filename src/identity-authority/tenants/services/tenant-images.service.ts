import { inject, injectable } from "inversify";
import { IAuthImageTokenService } from "../../services/image-token.service";
import * as Core from "../../../core/module/types";
import { ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";

/**
 * Service for managing tenant images, specifically for generating and parsing upload tokens.
 */
@injectable()
export class TenantImagesService {
  constructor(
    @inject(IAuthImageTokenService)
    private iAuthImageTokenService: IAuthImageTokenService
  ) {}

  /**
   * Generates an upload token for a tenant's image.
   * @param tenantId
   * @param type
   * @param imagePath
   * @returns
   */
  generateUploadToken(
    tenantId: Core.Entity.Id,
    type: "profile_photo" | "cover_photo",
    imagePath: Core.Uploads.FilePath
  ): string {
    return this.iAuthImageTokenService.generate(type, tenantId, imagePath);
  }

  /**
   * Parses an upload token for a tenant's image.
   * @param tenantId
   * @param uploadToken
   * @returns
   */
  parseUploadToken(
    tenantId: Core.Entity.Id,
    uploadToken: string
  ): {
    type: "profile_photo" | "cover_photo";
    tenant_id: Core.Entity.Id;
    image_path: Core.Uploads.FilePath;
  } {
    const tokenPayload = this.iAuthImageTokenService.parse(
      tenantId,
      uploadToken
    );
    if (
      tokenPayload.type !== "profile_photo" &&
      tokenPayload.type !== "cover_photo"
    ) {
      throw new ResourceAccessForbiddenException({
        message: "invalid upload token type",
        data: { tenant_id: tenantId, type: tokenPayload.type },
      });
    }
    if (tokenPayload.upload_for_entity_id !== tenantId) {
      throw new ResourceAccessForbiddenException({
        message: "upload token does not match tenant",
        data: {
          tenant_id: tenantId,
          user_id: tokenPayload.upload_for_entity_id,
        },
      });
    }
    return {
      type: tokenPayload.type,
      tenant_id: tokenPayload.upload_for_entity_id,
      image_path: tokenPayload.image_path,
    };
  }
}
