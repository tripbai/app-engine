import { expect } from "chai";
import { BaseEntity } from "../../entity/base-entity";
import { int } from "../../entity/entity-decorators";

const validator = (age: number) => {
  if (age < 18) {
    throw new Error("age should be more than 18");
  }
};

class UserModel extends BaseEntity {
  @int(validator)
  age!: number;
}

describe("int decorator", () => {
  describe("type validation", () => {
    it("should throw an error when string is passed", () => {
      const TUserModel = new UserModel();
      expect(() => {
        // @ts-expect-error
        TUserModel.age = "2";
      }).to.throw();
    });
    it("should throw an error when boolean is passed", () => {
      const TUserModel = new UserModel();
      expect(() => {
        // @ts-expect-error
        TUserModel.age = true;
      }).to.throw();
    });
    it("should throw an error when object is passed", () => {
      const TUserModel = new UserModel();
      expect(() => {
        // @ts-expect-error
        TUserModel.age = { isOver18: true };
      }).to.throw();
    });
    it("should accept number value", () => {
      const TUserModel = new UserModel();
      TUserModel.age = 18;
      expect(TUserModel.age).to.equal(18);
    });
  });
  describe("validator hooks", () => {
    it("should execute validator", () => {
      const TUserModel = new UserModel();
      expect(() => {
        TUserModel.age = 14;
      }).to.throw("age should be more than 18");
    });
  });
});
