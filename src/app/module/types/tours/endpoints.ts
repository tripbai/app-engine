import { Snippet } from "./snippet";
import * as Core from "../../../../core/module/types";
export type CreateTour = {
  request: {
    path: "/trip-engine/tours";
    method: "POST";
    data: Omit<Snippet, "entity_id" | "external_resource_id">;
  };
  response: {
    entity_id: Core.Entity.Id;
    external_resource_id: string | null;
  };
};
export type GetTour = {
  request: {
    path: "/trip-engine/tours/:tour_id";
    method: "GET";
  };
  response: Snippet & {
    created_at: string;
    updated_at: string;
    archived_at: string | null;
  };
};
export type UpdateTour = {
  request: {
    path: "/trip-engine/tours/:tour_id";
    method: "PATCH";
    data: Partial<
      Omit<Snippet, "entity_id" | "external_resource_id" | "store_id">
    >;
  };
  response: {};
};
export type DeleteTour = {
  request: {
    path: "/trip-engine/tours/:tour_id";
    method: "DELETE";
  };
  response: {};
};
