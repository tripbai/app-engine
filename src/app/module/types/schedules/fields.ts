import * as Core from "../../../../core/module/types";

export type Item = {
  tour_id: Core.Entity.Id;
  date: string;
  reservations_count: number;
};
