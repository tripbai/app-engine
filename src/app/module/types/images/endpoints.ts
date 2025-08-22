import * as Core from "../../../../core/module/types";
export type UploadImage = {
  request: {
    path: "/tripbai/images";
    method: "POST";
    data: {
      image: Blob | File;
      upload_for_entity_id: Core.Entity.Id;
      entity_type: "organization" | "store" | "tour";
    };
  };
  response: {
    image_path: Core.Uploads.FilePath;
    image_upload_token: string;
  };
};
