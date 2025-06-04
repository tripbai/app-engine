import { describe, it } from "node:test";
import { BaseEntity } from "../../../../core/orm/entity/base-entity";
import { AbstractDatabaseProvider, DatabaseTransactionStep, FlatDatabaseRecord } from "../../../../core/providers/database/database.provider";
import { Core } from "../../../../core/module/module";
import { MockDatabaseProvider } from "../../../../core/providers/database/mock/mock-database.provider";
import { UserAssertions } from "../../user.assertions";
import { IdentityAuthority } from "../../../module/module.interface";


describe('UserCreateService', () => {
  describe('createUser()', () => {
    it('should throw an error when isUniqueEmailAddress throws an error', () => {
      class TestUserAssertion extends UserAssertions {
        async isUniqueEmailAddress(value: unknown): Promise<IdentityAuthority.Users.Fields.UniqueEmailAddress> {
          throw new Error('user already exists with the same email address')
        }
      }
    })
  })
})