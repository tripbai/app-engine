import * as Locations from "../locations";

export type Status = "active" | "draft" | "archived";
export type Name = string & { min_length: 5; max_length: 120 };
export type DayNightNotation = string & { type: "duration_notation" };
export type Duration = DayNightNotation & { valid: true };
export type Time = string & { type: "time_notation" };
export type Frequency = {
  type: "daily" | "weekly" | "specific";
  days: Array<"SU" | "MO" | "TU" | "WE" | "TH" | "FR" | "SA">;
  weeks: Array<"1" | "2" | "3" | "4" | "5" | "6" | "7">;
};
export type PickUpAndDropOffItem = {
  location: string;
  time: string;
  day: string;
  notes: Array<string>;
};
export type HotelAndAccomondation = {
  all_nights: boolean;
  night_no: number;
  hotel_name: string;
  line_address: string | null;
  location_id: Locations.Id;
  notes: Array<string>;
};
export type Itinerary =
  | {
      type: "food";
      name: "breakfast" | "lunch" | "dinner" | "break";
      time: Time;
      is_free: boolean;
      location: string;
      notes: Array<string>;
    }
  | {
      type: "destination";
      name: string;
      time: Time;
      image_paths: Array<string>;
      image_tokens: Array<string>;
      is_free_entrance: boolean;
      activities: Array<string>;
      notes: Array<string>;
    };
