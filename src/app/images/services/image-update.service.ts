import { inject, injectable } from "inversify";
import { ImageRepository } from "../image.repository";

@injectable()
export class ImageUpdateService {

  constructor(
    @inject(ImageRepository) public readonly imageRepository: ImageRepository
  ) {}

}