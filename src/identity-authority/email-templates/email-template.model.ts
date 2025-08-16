import * as Core from "../../core/module/types";
import { BaseEntity } from "../../core/orm/entity/base-entity";
import {
  EntityId,
  collection,
  length,
  nullable,
  varchar,
} from "../../core/orm/entity/entity-decorators";
import * as IdentityAuthority from "../module/types";
import {
  assertIsEmailTemplateDescription,
  assertIsEmailTemplateType,
} from "./email-template.assertions";

@collection("email_templates")
export class EmailTemplateModel extends BaseEntity {
  @length(12)
  @varchar(assertIsEmailTemplateType)
  template_type!: IdentityAuthority.EmailTemplatesRegistry.Fields.EmailType;

  @EntityId()
  template_id!: Core.Entity.Id;

  @length(150)
  @nullable()
  @varchar(assertIsEmailTemplateDescription)
  description!: string | null;
}
