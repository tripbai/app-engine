import { inject, injectable } from "inversify";
import { UploadImageCommand } from "../commands/upload-image.command";
import {
  del,
  patch,
  post,
  put,
  get,
} from "../../../core/router/route-decorators";
import * as TripBai from "../../module/types";
import * as Core from "../../../core/module/types";
import {
  BadRequestException,
  LogicException,
} from "../../../core/exceptions/exceptions";

@injectable()
export class ImageUploadController {
  constructor(
    @inject(UploadImageCommand)
    private uploadImageCommand: UploadImageCommand
  ) {}

  @post<TripBai.Images.Endpoints.UploadImage>("/tripbai/images")
  async uploadImage<T extends TripBai.Images.Endpoints.UploadImage>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T["response"]> {
    const commandDTO: Parameters<UploadImageCommand["execute"]>[0] =
      Object.create(null);
    commandDTO.requester = params.requester;
    try {
    } catch (error) {
      throw new BadRequestException({
        message: "request failed due to invalid params",
        data: { error },
      });
    }
    throw new LogicException({
      message: "This controller is not implemented yet",
      data: {
        controller_name: "ImageUploadController",
      },
    });
  }
}
