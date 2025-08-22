import { assert, expect } from "chai";
import { BaseEntity } from "../../entity/base-entity";
import { boolean } from "../../entity/entity-decorators";

class UserModel extends BaseEntity {
  @boolean()
  isVerified!: boolean;
}

describe("boolean decorator", () => {
  describe("type validation", () => {
    it("should throw an error when string is passed", () => {
      const TUserModel = new UserModel();
      expect(() => {
        // @ts-expect-error
        TUserModel.isVerified = "2";
      }).to.throw();
    });
    it("should throw an error when any number except 1 and 0 is passed", () => {
      const TUserModel = new UserModel();
      expect(() => {
        // @ts-expect-error
        TUserModel.isVerified = 3;
      }).to.throw();
    });
    it("should throw an error when object is passed", () => {
      const TUserModel = new UserModel();
      expect(() => {
        // @ts-expect-error
        TUserModel.isVerified = { verified: true };
      }).to.throw();
    });
    it("should accept boolean value", () => {
      const TUserModel = new UserModel();
      TUserModel.isVerified = true;
      expect(TUserModel.isVerified).to.equal(true);
    });
    it("should accept 1 and 0 as value", () => {
      const TUserModel = new UserModel();
      // @ts-expect-error
      TUserModel.isVerified = 0;
      expect(TUserModel.isVerified).to.equal(false);
    });
  });
});
