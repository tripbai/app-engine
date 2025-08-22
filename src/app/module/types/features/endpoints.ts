import * as Core from "../../../../core/module/types";

export type RegisterDefaultFeature = {
  request: {
    path: "/tripbai/features";
    method: "POST";
    data: {
      key: string;
      value: string;
      package_id: Core.Entity.Id;
    };
  };
  response: {
    entity_id: Core.Entity.Id;
    key: string;
    value: string;
  };
};
export type CreateFeatureOverride = {
  request: {
    path: "/tripbai/features/overrides";
    method: "POST";
    data: {
      key: string;
      value: string;
      package_id: Core.Entity.Id;
      organization_id: Core.Entity.Id;
      override_for_entity_id: Core.Entity.Id;
      override_for_entity_type: "organization" | "store";
    };
  };
  response: {};
};
