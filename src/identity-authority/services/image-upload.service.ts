import { inject, injectable } from "inversify";
import { AbstractObjectStorageProvider } from "../../core/providers/storage/object-storage.provider";
import { IdentityAuthority } from "../module/module.interface";
import { Core } from "../../core/module/module";
import { Pseudorandom } from "../../core/helpers/pseudorandom";
import { FileUploadPath } from "../../core/helpers/fileuploadpath";

@injectable()
export class IAuthImageUploadService {

  private collection: string = 'identity-authority'

  constructor(
    @inject(AbstractObjectStorageProvider) public readonly abstractObjectStorageProvider: AbstractObjectStorageProvider
  ){}

  async uploadProfilePhoto(
    fileExtension: IdentityAuthority.Images.SupportedExtensions,
    data: Buffer
  ): Promise<Core.File.UploadPath> {
    return this.uploadPhoto(
      fileExtension,
      data
    )
  }

  async uploadCoverPhoto(
    fileExtension: IdentityAuthority.Images.SupportedExtensions,
    data: Buffer
  ): Promise<Core.File.UploadPath> {
    return this.uploadPhoto(
      fileExtension,
      data
    )
  }

  private async uploadPhoto(
    fileExtension: IdentityAuthority.Images.SupportedExtensions,
    data: Buffer
  ): Promise<Core.File.UploadPath> {
    const fileName = Pseudorandom.alphanum32()
    const uploadPath = FileUploadPath.generate(fileName, fileExtension)
    await this.abstractObjectStorageProvider.storeBuffer(
      data, this.collection, uploadPath
    )
    return uploadPath
  }

}