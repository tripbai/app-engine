import { inject, injectable } from "inversify";
import { DeleteTourCommand } from "../commands/delete-tour.command";
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
export class TourDeleteController {
  constructor(
    @inject(DeleteTourCommand)
    private deleteTourCommand: DeleteTourCommand
  ) {}

  @del<TripBai.Tours.Endpoints.DeleteTour>("/trip-engine/tours/:tour_id")
  async deleteTour<T extends TripBai.Tours.Endpoints.DeleteTour>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T["response"]> {
    const commandDTO: Parameters<DeleteTourCommand["execute"]>[0] =
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
        controller_name: "TourDeleteController",
      },
    });
  }
}
