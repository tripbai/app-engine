import { Core } from "../../module/module";

export abstract class AbstractObjectStorageProvider {

  abstract storeBuffer(buffer: Buffer, collection: string, filePath: Core.File.UploadPath): Promise<void>

  abstract storeText(text: string, collection: string, filePath: Core.File.UploadPath): Promise<void>

  abstract getObject(collection: string, filePath: Core.File.UploadPath): Promise<void>

  abstract deleteObject(collection: string, filePath: Core.File.UploadPath): Promise<void>

}