import { describe, it } from "node:test";
import { assert, expect } from "chai";
import {
  assertValidEntityId,
  createEntityId,
  flattenEntity,
} from "../entityToolkit";
import { BaseEntity } from "../../orm/entity/base-entity";
import { int, varchar } from "../../orm/entity/entity-decorators";

describe("flattenEntity", () => {
  it("should flatten an entity class that extends BaseEntity", () => {
    class TestEntity extends BaseEntity {
      @varchar()
      firstName!: string;
      @varchar()
      _lastName!: string;
      @int()
      age!: number;
    }
    const testEntity = new TestEntity();
    testEntity.firstName = "John";
    testEntity._lastName = "Doe";
    testEntity.age = 30;
    const result = flattenEntity(testEntity);
    expect(result).to.deep.equal({
      firstName: "John",
      _lastName: "Doe",
      age: 30,
      archived_at: null,
    });
  });
  it("should not include function members", () => {
    class TestEntity extends BaseEntity {
      @varchar()
      firstName!: string;
      @varchar()
      _lastName!: string;
      @int()
      age!: number;
      someMethod() {
        // This method should not be included in the flattened entity
      }
    }
    const testEntity = new TestEntity();
    testEntity.firstName = "John";
    testEntity._lastName = "Doe";
    testEntity.age = 30;
    const result = flattenEntity(testEntity);
    expect(result).to.not.have.property("someMethod");
  });
});

describe("createEntityId", () => {
  it("should create a unique entity ID", () => {
    const entityId = createEntityId();
    expect(entityId).to.be.a("string");
    expect(entityId).to.have.lengthOf(32);
  });
  it("should create different IDs on each call", () => {
    const entityId1 = createEntityId();
    const entityId2 = createEntityId();
    expect(entityId1).to.not.equal(entityId2);
  });
  it("should pass assertValidEntityId validation", () => {
    const entityId = createEntityId();
    expect(() => assertValidEntityId(entityId)).to.not.throw();
  });
});
