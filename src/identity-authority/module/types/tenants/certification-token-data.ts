import * as Core from "../../../../core/module/types";

export type Issuer = "identity-authority:tenant-access-certifier";
export type Data = {
  tenant_id: Core.Entity.Id;
  user_id: Core.Entity.Id;
  is_owner: boolean;
  tenant_permissions: Array<Core.Authorization.ConcreteToken>;
};
