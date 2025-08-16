import * as Fields from "./fields";

export type Snippet = {
  entity_id: string;
  external_resource_id: string | null;
  name: Fields.Name;
  duration: Fields.Duration;
  joiners_slot: number;
  price: number;
  reservation_fee: number;
  frequency: Fields.Frequency;
  pay_days_before_trip: number;
  pickup_dropoff: Array<Fields.PickUpAndDropOffItem>;
  allow_propose_pickup_dropoff: boolean;
  hotel_accomondation: Array<Fields.HotelAndAccomondation>;
  about: string;
  is_cancellable: boolean;
  cancel_before_days: number;
  is_refundable: boolean;
  refund_policies: Array<string>;
  store_id: string;
  itineraries: Array<Array<Fields.Itinerary>>;
  status: Fields.Status;
};
