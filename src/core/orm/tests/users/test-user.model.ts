import { injectable } from "inversify";
import { Core } from "../../../module/module";
import { BaseEntity } from "../../entity/base-entity";
import { boolean, int, json, timestamp, varchar } from "../../entity/decorators";
import { EntityToolkit } from "../../entity/entity-toolkit";
import { TestUserValidator } from "./test-user-validator";

@injectable()
export class TestUserModel extends BaseEntity<TestUserModel> {

  @varchar(TestUserValidator.first_name)
  first_name: string

  @int(TestUserValidator.age)
  age: number

  @boolean()
  is_verified: boolean

  @timestamp(TestUserValidator.timestamp)
  enrolled_at: string

  @json<{citizenship: string}>(TestUserValidator.isValidAgeToDrink)
  metadata: string

  @varchar(EntityToolkit.Assert.idIsValid)
  group_id: Core.Entity.Id

}