import { inject, injectable } from "inversify";
import { AbstractObjectStorageProvider } from "../../core/providers/storage/object-storage.provider";
import { IdentityAuthority } from "../module/module.interface";
import { Core } from "../../core/module/module";
import { Pseudorandom } from "../../core/helpers/pseudorandom";
import { FileUploadPath } from "../../core/helpers/fileuploadpath";
import { AbstractJWTProvider } from "../../core/providers/jwt/jwt.provider";
import { AppENV } from "../../core/helpers/env";

export type IAuthImageTokenPayload = {
  type: 'profile_photo' | 'cover_photo'
  user_id: Core.Entity.Id 
}

@injectable()
export class IAuthImageUploadService {

  private issuer: string = 'identity-authority:images'
  private collection: string = 'identity-authority'
  private tokenExpiryInMinutes: number = 60

  constructor(
    @inject(AbstractObjectStorageProvider) public readonly abstractObjectStorageProvider: AbstractObjectStorageProvider
  ){}

  async uploadProfilePhoto(
    userId: Core.Entity.Id,
    fileExtension: IdentityAuthority.Images.SupportedExtensions,
    data: Buffer
  ): Promise<Core.File.UploadPath> {
    return this.uploadPhoto(
      'profile_photo',
      userId,
      fileExtension,
      data
    )
  }

  async uploadCoverPhoto(
    userId: Core.Entity.Id,
    fileExtension: IdentityAuthority.Images.SupportedExtensions,
    data: Buffer
  ): Promise<Core.File.UploadPath> {
    return this.uploadPhoto(
      'cover_photo',
      userId,
      fileExtension,
      data
    )
  }

  private async uploadPhoto(
    type: 'profile_photo' | 'cover_photo',
    userId: Core.Entity.Id,
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