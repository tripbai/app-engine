import * as Core from "../module/types";
import { BaseEntity } from "../orm/entity/base-entity";
import { assertFlatDatabaseRecord } from "../orm/repository/assertions";
const crypto = require("crypto");

export function createPropAlias<T extends string>(
  prop: T
): Core.Entity.PropAlias<T> {
  return `_${prop}`;
}

export function assertValidEntityId(id: unknown): asserts id is Core.Entity.Id {
  const regex = /^[a-zA-Z0-9]+$/;
  if (typeof id !== "string") {
    throw new Error("entity_id must be type of string");
  }
  if (!regex.test(id)) {
    throw new Error("entity_id value contains illegal characters");
  }
  if (id.length !== 32) {
    throw new Error("entity_id value length is incorrect");
  }
}

export const createEntityId = (): Core.Entity.Id => {
  return crypto.randomUUID().split("-").join("");
};

export const flattenEntity = (data: BaseEntity) => {
  const flattenedEntity = Object.create(null);
  for (const alias in data) {
    const typedKey = alias as keyof BaseEntity;
    /** Function members must not be exported */
    if (typeof data[typedKey] === "function") continue;
    if (alias[0] !== "_") continue;
    const key = alias.slice(1);
    const value = data[key as keyof BaseEntity];
    if (
      typeof value === "string" ||
      typeof value === "boolean" ||
      typeof value === "number" ||
      value === null
    ) {
      flattenedEntity[key] = value;
    }
  }
  assertFlatDatabaseRecord(flattenedEntity);
  return flattenedEntity;
};
