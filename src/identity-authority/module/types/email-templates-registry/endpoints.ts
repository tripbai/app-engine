import * as Fields from "./fields";
import * as Core from "../../../../core/module/types";

export type Create = {
  request: {
    path: "/identity-authority/registry/email-templates";
    method: "POST";
    data: {
      template_type: Fields.EmailType;
      template_id: Core.Entity.Id;
      description?: string;
    };
  };
  response: {
    entity_id: Core.Entity.Id;
    template_type: Fields.EmailType;
    template_id: Core.Entity.Id;
    description: string | null;
  };
};
export type GetAll = {
  request: {
    path: "/identity-authority/registry/email-templates";
    method: "GET";
  };
  response: Array<{
    entity_id: Core.Entity.Id;
    template_type: Fields.EmailType;
    template_id: Core.Entity.Id;
    description: string | null;
    created_at: string;
    updated_at: string;
  }>;
};
export type Update = {
  request: {
    path: "/identity-authority/registry/email-templates/:entity_id";
    method: "PATCH";
    data: {
      description: string;
      template_id: Core.Entity.Id;
    };
  };
  response: {};
};
