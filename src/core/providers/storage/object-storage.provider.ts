import * as Core from "../../module/types";

export abstract class AbstractObjectStorageProvider {
  abstract storeBuffer(
    buffer: Buffer,
    collection: string,
    filePath: Core.Uploads.FilePath
  ): Promise<void>;

  abstract storeText(
    text: string,
    collection: string,
    filePath: Core.Uploads.FilePath
  ): Promise<void>;

  abstract getObject(
    collection: string,
    filePath: Core.Uploads.FilePath
  ): Promise<void>;

  abstract deleteObject(
    collection: string,
    filePath: Core.Uploads.FilePath
  ): Promise<void>;
}
