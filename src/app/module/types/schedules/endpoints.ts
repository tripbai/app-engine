import * as Core from "../../../../core/module/types";
import * as Fields from "./fields";
export type GetTourSchedule = {
  request: {
    path: "/tripbai/schedules/tour?tour_id=:tour_id&from_date=:from_date&range=:range";
    method: "GET";
  };
  response: {
    tour_id: string;
    from_date: string;
    schedules: Array<Fields.Item>;
  };
};
export type GetToursSchedule = {
  request: {
    path: "/tripbai/schedules/tours?store_id=:store_id&from_date=:from_date&range=:range";
    method: "GET";
  };
  response: {
    store_id: Core.Entity.Id;
    from_date: string;
    schedules: Array<Fields.Item>;
  };
};
