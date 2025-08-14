import { describe, it } from "node:test";
import { assert, expect } from "chai";
import { BaseEntity } from "../../entity/base-entity";
import { timestamp } from "../../entity/entity-decorators";

const isBefore2024 = (value: string) => {
  if (value < "2024-01-01") {
    throw new Error("enrolledAt value should not be before 2024");
  }
};

class UserModel extends BaseEntity {
  @timestamp(isBefore2024)
  enrolledAt!: string;
}

describe("timestamp decorator", () => {
  describe("type validation", () => {
    it("should throw an error when number is passed", () => {
      const TUserModel = new UserModel();
      expect(() => {
        // @ts-expect-error
        TUserModel.enrolledAt = 2;
      }).to.throw();
    });
    it("should throw an error when boolean is passed", () => {
      const TUserModel = new UserModel();
      expect(() => {
        // @ts-expect-error
        TUserModel.enrolledAt = true;
      }).to.throw();
    });
    it("should throw an error when object is passed", () => {
      const TUserModel = new UserModel();
      expect(() => {
        // @ts-expect-error
        TUserModel.enrolledAt = { prefix: "Mr" };
      }).to.throw();
    });
    it("should throw an error when just any string is passed", () => {
      const TUserModel = new UserModel();
      expect(() => {
        TUserModel.enrolledAt = "21-ajd-21";
      }).to.throw();
    });
    it("should throw an error incorrect timestamp string is passed", () => {
      const TUserModel = new UserModel();
      expect(() => {
        TUserModel.enrolledAt = "2024-15-03 11:59:32";
      }).to.throw();
    });
    it("should accept valid timestamp value", () => {
      const TUserModel = new UserModel();
      TUserModel.enrolledAt = "2024-12-03 11:59:32";
      expect(TUserModel.enrolledAt).to.equal("2024-12-03 11:59:32");
    });
  });
  describe("validator hooks", () => {
    it("should execute validator", () => {
      const TUserModel = new UserModel();
      expect(() => {
        TUserModel.enrolledAt = "2022-12-03 11:59:32";
      }).to.throw("enrolledAt value should not be before 2024");
    });
  });
});
