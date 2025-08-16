import { assert, expect } from "chai";
import { BaseEntity } from "../../entity/base-entity";
import { int, json } from "../../entity/entity-decorators";

const isValidAgeToDrink = (
  data: { citizenship: string },
  userData: { [key: string]: any }
) => {
  if ("citizenship" in data && typeof data.citizenship === "string") {
    if (userData === undefined || userData.age === undefined) {
      throw new Error("user data must have age field");
    }
    if (userData.age < 21 && data.citizenship === "American") {
      throw new Error(
        `American citizens cannot drink beer when under 21 years old`
      );
    }
  } else {
    throw new Error("metadata must have citizenship field");
  }
};

class UserModel extends BaseEntity {
  @int()
  age!: number;

  @json<{ citizenship: string }>(isValidAgeToDrink)
  metadata!: string;
}

describe("json decorator", () => {
  describe("type validation", () => {
    it("should throw an error when number is passed", () => {
      const TUserModel = new UserModel();
      TUserModel.age = 27;
      expect(() => {
        // @ts-expect-error
        TUserModel.metadata = 2;
      }).to.throw();
    });
    it("should throw an error when boolean is passed", () => {
      const TUserModel = new UserModel();
      TUserModel.age = 27;
      expect(() => {
        // @ts-expect-error
        TUserModel.metadata = true;
      }).to.throw();
    });
    it("should throw an error when object is passed", () => {
      const TUserModel = new UserModel();
      TUserModel.age = 27;
      expect(() => {
        // @ts-expect-error
        TUserModel.metadata = { prefix: "Mr" };
      }).to.throw();
    });
    it("should throw an error when invalid json is passed", () => {
      const TUserModel = new UserModel();
      TUserModel.age = 27;
      expect(() => {
        TUserModel.metadata = `{"citizenship:"American"}`;
      }).to.throw();
    });
    it("should accept valid json string value", () => {
      const TUserModel = new UserModel();
      TUserModel.age = 27;
      TUserModel.metadata = `{"citizenship":"American"}`;
      expect(TUserModel.metadata).to.equal(`{"citizenship":"American"}`);
    });
  });
  describe("satisfies hooks", () => {
    it("should execute validator", () => {
      const TUserModel = new UserModel();
      TUserModel.age = 20;
      expect(() => {
        TUserModel.metadata = `{"citizenship":"American"}`;
      }).to.throw(
        "American citizens cannot drink beer when under 21 years old"
      );
    });
  });
});
