import * as Core from "../../../../core/module/types";
export type CreatePackage = {
  request: {
    path: "/tripbai/packages";
    method: "POST";
    data: {
      name: string;
    };
  };
  response: {
    entity_id: Core.Entity.Id;
  };
};
export type GetPackage = {
  request: {
    path: "/tripbai/packages/:package_id";
    method: "GET";
    data: {};
  };
  response: {
    name: string;
    entity_id: Core.Entity.Id;
    created_at: string;
    updated_at: string;
    is_active: boolean;
    is_default: boolean;
  };
};
export type GetPackages = {
  request: {
    path: "/tripbai/packages";
    method: "GET";
  };
  response: Array<{
    entity_id: Core.Entity.Id;
    name: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
    is_default: boolean;
  }>;
};
export type UpdatePackage = {
  request: {
    path: "/tripbai/packages/:package_id";
    method: "PUT";
    data: {
      name?: string;
      is_active?: boolean;
      is_default?: boolean;
    };
  };
  response: {};
};
export type DeletePackage = {
  request: {
    path: "/tripbai/packages/:package_id";
    method: "DELETE";
  };
  response: {};
};
