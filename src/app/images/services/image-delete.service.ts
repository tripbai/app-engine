import { inject, injectable } from "inversify";
import { ImageRepository } from "../image.repository";

@injectable()
export class ImageDeleteService {

  constructor(
    @inject(ImageRepository) public readonly imageRepository: ImageRepository
  ) {}

}