import * as Organizations from "../organizations";
import * as Core from "../../../../core/module/types";
import * as Locations from "../locations";

export type Snippet = {
  name: string;
  about: string | null;
  organization_id: Core.Entity.Id;
  location_id: Locations.Id | null;
  profile_photo_src: Core.Uploads.FilePath | null;
  cover_photo_src: Core.Uploads.FilePath | null;
  status: Organizations.Fields.Status;
};
