import * as Core from "../../../../core/module/types";
export type GetUserAccessLibrary = {
  request: {
    path: "/tripbai/access-directory/users/:user_id";
    method: "GET";
  };
  response: Array<{
    organization_id: Array<Core.Entity.Id>;
    store_ids: Array<Core.Entity.Id>;
  }>;
};
export type AddUserToStore = {
  request: {
    path: "/tripbai/access-directory/tenants/:tenant_id/add-to-stores";
    method: "POST";
    data: {
      user_id: Core.Entity.Id;
      store_ids: Array<Core.Entity.Id>;
      tenant_user_added_cert_token: string;
    };
  };
  response: {};
};
export type RemoveUserFromStore = {
  request: {
    path: "/tripbai/access-directory/tenants/:tenant_id/remove-from-stores";
    method: "POST";
    data: {
      user_id: Core.Entity.Id;
      store_ids: Array<Core.Entity.Id>;
      tenant_user_removed_cert_token: string;
    };
  };
  response: {};
};
