import { inject, injectable } from "inversify";
import { GetTourScheduleQuery } from "../queries/get-tour-schedule.query";
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
export class TourScheduleGetController {
  constructor(
    @inject(GetTourScheduleQuery)
    private getTourScheduleQuery: GetTourScheduleQuery
  ) {}

  @get<TripBai.Schedules.Endpoints.GetTourSchedule>(
    "/tripbai/schedules/tour?tour_id=:tour_id&from_date=:from_date&range=:range"
  )
  async getTourSchedule<T extends TripBai.Schedules.Endpoints.GetTourSchedule>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T["response"]> {
    const commandDTO: Parameters<GetTourScheduleQuery["execute"]>[0] =
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
        controller_name: "TourScheduleGetController",
      },
    });
  }
}
