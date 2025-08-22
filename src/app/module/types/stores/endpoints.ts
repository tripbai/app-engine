import * as Organizations from "../organizations";
import * as Core from "../../../../core/module/types";
import * as Locations from "../locations";

export type CreateStore = {
  request: {
    path: "/tripbai/stores";
    method: "POST";
    data: {
      organization_id: Core.Entity.Id;
      name: string;
      about?: string;
      location_id: Locations.Id;
      profile_photo_src?: Core.Uploads.FilePath;
      cover_photo_src?: Core.Uploads.FilePath;
      status?: Organizations.Fields.Status;
    };
  };
  response: {
    entity_id: Core.Entity.Id;
    organization_id: Core.Entity.Id;
    name: string;
    about: string | null;
    location_id: Locations.Id | null;
    profile_photo_src: Core.Uploads.FilePath | null;
    cover_photo_src: Core.Uploads.FilePath | null;
    status: Organizations.Fields.Status;
  };
};
export type GetStore = {
  request: {
    path: "/tripbai/stores/:store_id";
    method: "GET";
  };
  response: {
    entity_id: Core.Entity.Id;
    organization_id: Core.Entity.Id;
    name: string;
    about: string | null;
    location_id: Locations.Id;
    profile_photo_src: Core.Uploads.FilePath | null;
    cover_photo_src: Core.Uploads.FilePath | null;
    status: Organizations.Fields.Status;
  };
};
export type UpdateStore = {
  request: {
    path: "/tripbai/stores/:store_id";
    method: "PUT";
    data: {
      name?: string;
      about?: string;
      location_id?: Locations.Id;
      profile_photo_src?: Core.Uploads.FilePath;
      cover_photo_src?: Core.Uploads.FilePath;
      status?: Organizations.Fields.Status;
    };
  };
  response: {};
};
