import { inject, injectable } from "inversify";
import { AbstractObjectStorageProvider } from "../../core/providers/storage/object-storage.provider";
import * as IdentityAuthority from "../module/types";
import * as Core from "../../core/module/types";
import { createEntityId } from "../../core/utilities/entityToolkit";
import { generateFileUploadPath } from "../../core/utilities/fileupath";

@injectable()
export class IAuthImageUploadService {
  private collection: string = "identity-authority";

  constructor(
    @inject(AbstractObjectStorageProvider)
    private abstractObjectStorageProvider: AbstractObjectStorageProvider
  ) {}

  async uploadProfilePhoto(
    fileExtension: IdentityAuthority.Images.SupportedExtensions,
    data: Buffer
  ): Promise<Core.Uploads.FilePath> {
    return this.uploadPhoto(fileExtension, data);
  }

  async uploadCoverPhoto(
    fileExtension: IdentityAuthority.Images.SupportedExtensions,
    data: Buffer
  ): Promise<Core.Uploads.FilePath> {
    return this.uploadPhoto(fileExtension, data);
  }

  private async uploadPhoto(
    fileExtension: IdentityAuthority.Images.SupportedExtensions,
    data: Buffer
  ): Promise<Core.Uploads.FilePath> {
    const fileName = createEntityId();
    const uploadPath = generateFileUploadPath(fileName, fileExtension);
    await this.abstractObjectStorageProvider.storeBuffer(
      data,
      this.collection,
      uploadPath
    );
    return uploadPath;
  }
}
