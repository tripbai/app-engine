import { inject, injectable } from "inversify";
import { ImageRepository } from "../image.repository";

@injectable()
export class ImageCreateService {
  constructor(
    @inject(ImageRepository) private imageRepository: ImageRepository
  ) {}
}
