import { inject } from "inversify";
import * as Core from "../../../module/types";
import { AbstractObjectStorageProvider } from "../object-storage.provider";
import { AmazonS3Service } from "../../../services/aws/s3/aws3.service";

export class AmazonS3StorageService implements AbstractObjectStorageProvider {
  constructor(
    @inject(AmazonS3Service) public readonly amazonS3Service: AmazonS3Service
  ) {}

  async storeBuffer(
    file: Buffer,
    collection: string,
    filePath: Core.Uploads.FilePath
  ) {
    const finalPath = `${collection}/${filePath}`;
    await this.amazonS3Service.uploadObjectAsBuffer(finalPath, file);
  }

  async storeText(
    text: string,
    collection: string,
    filePath: Core.Uploads.FilePath
  ) {
    const finalPath = `${collection}/${filePath}`;
    await this.amazonS3Service.uploadObjectAsText(finalPath, text);
  }

  async getObject(collection: string, filePath: Core.Uploads.FilePath) {
    const finalPath = `${collection}/${filePath}`;
    await this.amazonS3Service.getObject(finalPath);
  }

  async deleteObject(collection: string, filePath: Core.Uploads.FilePath) {
    const finalPath = `${collection}/${filePath}`;
    await this.amazonS3Service.deleteObject(finalPath);
  }
}
