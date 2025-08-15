import { inject, injectable } from "inversify";
import { post } from "../../../core/router/route-decorators";
import * as IdentityAuthority from "../../module/types";
import * as Core from "../../../core/module/types";
import { BadRequestException } from "../../../core/exceptions/exceptions";
import { IsValid } from "../../../core/helpers/isvalid";
import { EntityToolkit } from "../../../core/orm/entity/entity-toolkit";
import { ImageHelperService } from "../../services/image-helper.service";
import { UploadTenantImagesCommand } from "../commands/upload-tenant-images.command";

@injectable()
export class TenantImagesController {
  constructor(
    @inject(UploadTenantImagesCommand)
    private readonly uploadTenantImagesCommand: UploadTenantImagesCommand,
    @inject(ImageHelperService)
    private readonly imageAssertionService: ImageHelperService
  ) {}

  @post<IdentityAuthority.Tenants.Endpoints.UploadImage>(
    "/identity-authority/tenants/:tenant_id/images/upload"
  )
  async uploadTenantImage<
    T extends IdentityAuthority.Tenants.Endpoints.UploadImage
  >(params: Core.Route.ControllerDTO<T>): Promise<T["response"]> {
    try {
      assertNonEmptyString(params.data.tenant_id);
      assertValidEntityId(params.data.tenant_id);
      assertNonEmptyString(params.data.type);
      if (
        params.data.type !== "profile_photo" &&
        params.data.type !== "cover_photo"
      ) {
        throw new Error(
          `Invalid image type provided: ${params.data.type}. Expected 'profile_photo' or 'cover_photo'.`
        );
      }
      IsValid.FileObject(params.data.file);
    } catch (error) {
      throw new BadRequestException({
        message: "failed to upload tenant image due to invalid parameters",
        data: { error, tenant_id: params.data.tenant_id },
      });
    }
    const result = await this.uploadTenantImagesCommand.execute(
      params.requester,
      params.data.type,
      params.data.tenant_id,
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
