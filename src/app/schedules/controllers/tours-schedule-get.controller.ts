import { inject, injectable } from "inversify";
import { GetToursScheduleQuery } from "../queries/get-tours-schedule.query";
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
export class ToursScheduleGetController {
  constructor(
    @inject(GetToursScheduleQuery)
    private getToursScheduleQuery: GetToursScheduleQuery
  ) {}

  @get<TripBai.Schedules.Endpoints.GetToursSchedule>(
    "/tripbai/schedules/tours?store_id=:store_id&from_date=:from_date&range=:range"
  )
  async getToursSchedule<
    T extends TripBai.Schedules.Endpoints.GetToursSchedule
  >(params: Core.Route.ControllerDTO<T>): Promise<T["response"]> {
    const commandDTO: Parameters<GetToursScheduleQuery["execute"]>[0] =
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
        controller_name: "ToursScheduleGetController",
      },
    });
  }
}
