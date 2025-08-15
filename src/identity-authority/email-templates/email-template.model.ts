import { Core } from "../../core/module/module";
import { BaseEntity } from "../../core/orm/entity/base-entity";
import {
  EntityId,
  collection,
  length,
  nullable,
  varchar,
} from "../../core/orm/entity/entity-decorators";
import { EntityToolkit } from "../../core/orm/entity/entity-toolkit";
import * as IdentityAuthority from "../module/types";
import { EmailTemplateValidator } from "./email-template.validator";

@collection("email_templates")
export class EmailTemplateModel extends BaseEntity<EmailTemplateModel> {
  @length(12)
  @varchar(EmailTemplateValidator.template_type)
  template_type: IdentityAuthority.EmailTemplatesRegistry.Fields.EmailType;

  @EntityId()
  template_id: Core.Entity.Id;

  @length(150)
  @nullable()
  @varchar(EmailTemplateValidator.description)
  description: string | null;
}
