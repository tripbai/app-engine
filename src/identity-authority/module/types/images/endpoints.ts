import * as Core from "../../../../core/module/types";

export type Upload = {
  request: {
    path: "/identity-authority/images/upload";
    method: "POST";
    data: {
      audience: string;
      file: File;
      uploadedForEntityId: string;
    };
  };
  response: {
    relativePath: Core.Uploads.FilePath;
    image_token: string;
  };
};
