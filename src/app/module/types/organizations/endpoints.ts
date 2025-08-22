import * as Core from "../../../../core/module/types";
import * as Fields from "./fields";

export type CreateOrganization = {
  request: {
    path: "/tripbai/organizations";
    method: "POST";
    data: {
      business_name: string;
      package_id: Core.Entity.Id;
      // A token that certifies the user has access to the tenant
      tenant_access_certification_token: string;
      type: Fields.Type;
    };
  };
  response: {
    // The unique identifier of the organization
    organization_id: Core.Entity.Id;
  };
};
export type GenerateAuthToken = {
  request: {
    path: "/tripbai/organizations/:organization_id/tokens";
    method: "POST";
    data: {
      // A token that certifies the user has access to the tenant
      tenant_access_certification_token: string;
    };
  };
  response: {
    upgraded_token: string;
  };
};
export type UpdateOrganization = {
  request: {
    path: "/tripbai/organizations/:organization_id";
    method: "PATCH";
    data: {
      business_name?: string;
      package_id?: Core.Entity.Id;
      status?: Fields.Status;
      type?: Fields.Type;
    };
  };
  response: {};
};
