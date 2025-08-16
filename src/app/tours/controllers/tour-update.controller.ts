import { inject, injectable } from "inversify";
import { UpdateTourCommand } from "../commands/update-tour.command";
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
export class TourUpdateController {
  constructor(
    @inject(UpdateTourCommand)
    private updateTourCommand: UpdateTourCommand
  ) {}

  @patch<TripBai.Tours.Endpoints.UpdateTour>("/trip-engine/tours/:tour_id")
  async updateTour<T extends TripBai.Tours.Endpoints.UpdateTour>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T["response"]> {
    const commandDTO: Parameters<UpdateTourCommand["execute"]>[0] =
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
        controller_name: "TourUpdateController",
      },
    });
  }
}
