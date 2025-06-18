import { inject, injectable } from "inversify";
import { ImageRepository } from "../image.repository";

@injectable()
export class ImageGetService {

  constructor(
    @inject(ImageRepository) public readonly imageRepository: ImageRepository
  ) {}

}