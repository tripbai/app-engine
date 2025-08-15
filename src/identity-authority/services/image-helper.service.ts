import { injectable } from "inversify";
import * as IdentityAuthority from "../module/types";

@injectable()
export class ImageHelperService {
  constructor() {}

  /**
   * Converts a MIME type to a supported file extension.
   * @param mimetype The MIME type of the image.
   * @returns The corresponding file extension.
   * @throws Error if the MIME type is unsupported.
   */
  convertMimeTypeToFileExtensionName(
    mimetype: string
  ): IdentityAuthority.Images.SupportedExtensions {
    switch (mimetype) {
      case "image/jpeg":
        return "jpeg";
      case "image/jpg":
        return "jpg";
      case "image/png":
        return "png";
      case "image/webp":
        return "webp";
      default:
        throw new Error(`Unsupported image MIME type: ${mimetype}`);
    }
  }
}
