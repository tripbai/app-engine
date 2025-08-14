import { describe, it } from "node:test";
import { assert, expect } from "chai";
import { BaseEntity } from "../../entity/base-entity";
import { varchar } from "../../entity/entity-decorators";

const validator = (firstName: string) => {
  if (firstName.length < 3) {
    throw new Error("first name should be more than 3 characters");
  }
};

class UserModel extends BaseEntity {
  @varchar(validator)
  firstName!: string;
}

describe("varchar decorator", () => {
  describe("type validation", () => {
    it("should throw an error when number is passed", () => {
      const TUserModel = new UserModel();
      expect(() => {
        // @ts-expect-error
        TUserModel.firstName = 2;
      }).to.throw();
    });
    it("should throw an error when boolean is passed", () => {
      const TUserModel = new UserModel();
      expect(() => {
        // @ts-expect-error
        TUserModel.firstName = true;
      }).to.throw();
    });
    it("should throw an error when object is passed", () => {
      const TUserModel = new UserModel();
      expect(() => {
        // @ts-expect-error
        TUserModel.firstName = { prefix: "Mr" };
      }).to.throw();
    });
    it("should accept string value", () => {
      const TUserModel = new UserModel();
      TUserModel.firstName = "John";
      expect(TUserModel.firstName).to.equal("John");
    });
  });
  describe("validator hooks", () => {
    it("should execute validator", () => {
      const TUserModel = new UserModel();
      expect(() => {
        TUserModel.firstName = "Ty";
      }).to.throw("first name should be more than 3 characters");
    });
  });
});
