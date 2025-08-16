import { BaseEntity } from "../../entity/base-entity";
import { assert } from "chai";
import { createEntityId } from "../../../utilities/entityToolkit";
import { getTimestampNow } from "../../../utilities/timestamp";

class TestEntity extends BaseEntity {}

describe("BaseEntity", () => {
  it("should create an instance of TestEntity", () => {
    const entity = new TestEntity();
    assert.instanceOf(entity, TestEntity);
  });
  it("should have a valid constructor", () => {
    const entity = new TestEntity();
    assert.isObject(entity);
  });
  it("should accept only valid entity Id", () => {
    const entity = new TestEntity();
    try {
      // @ts-expect-error
      entity.entity_id = "invalid-id";
    } catch (error) {
      assert.instanceOf(error, Error);
      assert.equal(
        error.message,
        "entity_id value contains illegal characters"
      );
    }
  });
  it("should store BaseEntity field value in alias field", () => {
    const entity = new TestEntity();
    entity.entity_id = createEntityId();
    // @ts-expect-error - accessing private field
    assert.equal(entity._entity_id, entity.entity_id);
  });
  it("should not override entity_id once set", () => {
    const entity = new TestEntity();
    const actualEntityId = createEntityId();
    const overrideEntityId = createEntityId();
    entity.entity_id = actualEntityId;
    entity.entity_id = overrideEntityId;
    // @ts-expect-error - accessing private field
    assert.equal(entity._entity_id, entity.entity_id);
  });
  it("should accept valid created_at value", () => {
    const entity = new TestEntity();
    const createdAt = getTimestampNow();
    entity.created_at = createdAt;
    assert.equal(entity.created_at, createdAt);
  });
  it("should not accept any timestamp format value for created_at", () => {
    const entity = new TestEntity();
    try {
      // @ts-expect-error - timestamp format not accepted
      entity.created_at = new Date(Date.now()).toISOString();
    } catch (error) {
      assert.instanceOf(error, Error);
      assert.equal(
        error.message,
        "entity created_at value is not valid timestamp string"
      );
    }
  });
});
