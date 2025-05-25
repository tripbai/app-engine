import { boolean, int, json, timestamp, varchar } from "../../entity/decorators";
import { BaseEntity } from "../../entity/entity";
import { TestUserValidator } from "./test-user.validation";

export class TestUser extends BaseEntity<TestUser> {
  
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

}