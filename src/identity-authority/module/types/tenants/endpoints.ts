import * as Core from "../../../../core/module/types";

export type CreateTenant = {
  request: {
    path: "/identity-authority/tenants";
    method: "POST";
    data: {
      name: string;
    };
  };
  response: {
    entity_id: Core.Entity.Id;
    secret_key?: string;
    name: string;
    profile_photo: string | null;
    cover_photo: string | null;
    created_at: string;
    updated_at: string;
  };
};
export type GetTenant = {
  request: {
    path: "/identity-authority/tenants/:tenant_id";
    method: "GET";
    data: {};
  };
  response: {
    entity_id: Core.Entity.Id;
    name: string;
    profile_photo: string | null;
    cover_photo: string | null;
  };
};
export type CertifyAccess = {
  request: {
    path: "/identity-authority/tenants/:tenant_id/certify-access";
    method: "POST";
    data: {
      audience: string;
    };
  };
  response: {
    access_certification_token: string;
  };
};
/** @TODO */
export type CertifyUser = {
  request: {
    path: "/identity-authority/tenants/:tenant_id/certify-user";
    method: "POST";
    data: {
      user_id: string;
    };
  };
  response: {
    team_entity_id: string;
  };
};
export type UpdateTenant = {
  request: {
    path: "/identity-authority/tenants/:tenant_id";
    method: "PATCH";
    data: {
      name?: string;
      profile_photo?: {
        upload_token: string;
      };
      cover_photo?: {
        upload_token: string;
      };
    };
  };
  response: {};
};
export type UploadImage = {
  request: {
    path: "/identity-authority/tenants/:tenant_id/images/upload";
    method: "POST";
    data: {
      file: File;
      type: "profile_photo" | "cover_photo";
    };
  };
  response: {
    relative_path: Core.Uploads.FilePath;
    upload_token: string;
  };
};
export type AddUserToTeam = {
  request: {
    path: "/identity-authority/tenants/:tenant_id/team/users";
    method: "POST";
    data: {
      user_id: Core.Entity.Id;
    };
  };
  response: {};
};
export type RemoveUserFromTeam = {
  request: {
    path: "/identity-authority/tenants/:tenant_id/team/users/:user_id";
    method: "DELETE";
    data: {};
  };
  response: {};
};
