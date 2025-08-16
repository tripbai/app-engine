import { inject, injectable } from "inversify";
import { CreateTourCommand } from "../commands/create-tour.command";
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
export class TourCreateController {
  constructor(
    @inject(CreateTourCommand)
    private createTourCommand: CreateTourCommand
  ) {}

  @post<TripBai.Tours.Endpoints.CreateTour>("/trip-engine/tours")
  async createTour<T extends TripBai.Tours.Endpoints.CreateTour>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T["response"]> {
    const commandDTO: Parameters<CreateTourCommand["execute"]>[0] =
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
        controller_name: "TourCreateController",
      },
    });
  }
}
