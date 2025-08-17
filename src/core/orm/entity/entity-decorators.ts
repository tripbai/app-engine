import "reflect-metadata";
import { BaseEntity } from "./base-entity";
import * as EntitySchemaRegistry from "./schema-registry";
import {
  assertValidEntityId,
  createPropAlias,
} from "../../utilities/entityToolkit";
import { isValidTimestamp } from "../../utilities/timestamp";
import { isParsableJSON } from "../../utilities/jsonHelper";

export const fixedMetaData = Symbol("fixed");
export const nullableMetaData = Symbol("nullable");

type ClassConstructor<T = any> = new (...args: any[]) => T;

/**
 * An Entity property decorator. This decorator asserts that
 * once a value is given to the property, it can no more be modified.
 */
export function fixed(): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    Reflect.defineMetadata(fixedMetaData, true, target, propertyKey);
  };
}

/**
 * An Entity property decorator. This decorator asserts that
 * a value can be null.
 */
export function nullable(): PropertyDecorator {
  return (target, propertyKey) => {
    EntitySchemaRegistry.registerNullableField(
      target.constructor as ClassConstructor,
      propertyKey
    );
    Reflect.defineMetadata(nullableMetaData, true, target, propertyKey);
  };
}

/**
 * A collection decorator for Entity classes.
 * @param name
 */
export function collection(name: string): ClassDecorator {
  return function (target) {
    EntitySchemaRegistry.registerCollection(target as any, name);
  };
}

/**
 * A length decorator for Entity properties.
 * @param value The length value to set.
 * @returns A property decorator.
 */
export function length(value: number): PropertyDecorator {
  return function (target, propertyKey) {
    EntitySchemaRegistry.registerFieldLength(
      target.constructor as ClassConstructor,
      propertyKey,
      value
    );
  };
}

/**
 * Register a reference to another entity.
 * @param value The entity constructor to reference.
 * @param field The field in the referenced entity to use.
 * @returns A property decorator.
 */
export function references<T extends ClassConstructor>(
  value: T,
  field: keyof InstanceType<T>
): PropertyDecorator {
  return function (target, property) {
    EntitySchemaRegistry.registerAsReferenceOf(
      target.constructor as ClassConstructor,
      property as string,
      value,
      field as string
    );
  };
}

/**
 * A property decorator that marks a field as unique.
 * @returns A property decorator.
 */
export function unique(): PropertyDecorator {
  return function (target, propertyKey) {
    EntitySchemaRegistry.registerAsUniqueField(
      target.constructor as ClassConstructor,
      propertyKey
    );
  };
}

/**
 * A property decorator that marks a field as the entity ID.
 * @returns A property decorator.
 */
export function EntityId(): PropertyDecorator {
  return function (target, propertyKey) {
    EntitySchemaRegistry.registerFieldType(
      target.constructor as ClassConstructor,
      propertyKey as string,
      "char"
    );
    EntitySchemaRegistry.registerFieldLength(
      target.constructor as ClassConstructor,
      propertyKey as string,
      32
    );
    if (typeof propertyKey !== "string") {
      throw new Error(`Property key must be a string`);
    }
    return {
      set: function (this: any, value: unknown) {
        /**
         * Checking whether a @fixed decorator has been applied to this
         * property. If so, we do not allow modifying this property
         * after it has been first set
         */
        let hasFixedMetaData = Reflect.getMetadata(
          fixedMetaData,
          target,
          propertyKey
        );
        if (hasFixedMetaData) return;

        /**
         * Checking whether a @nullable decorator has been applied to this
         * property. If so, we will just set the value as null and move on
         */
        let isNullableValue = Reflect.getMetadata(
          nullableMetaData,
          target,
          propertyKey
        );
        if (isNullableValue && value === null) {
          const propAlias = createPropAlias(propertyKey);
          this[propAlias] = null;
          return;
        }

        if (typeof value !== "string") {
          throw new Error(
            `Invalid type for property ${propertyKey}: expected string, got ${typeof value}`
          );
        }

        assertValidEntityId(value);

        const alias = createPropAlias(propertyKey);
        this[alias] = value;
      },
      get: function () {
        const alias = createPropAlias(propertyKey);
        return this[alias] ?? null;
      },
      enumerable: true,
      configurable: true,
    };
  };
}

/**
 * An Entity property decorator. This decorator asserts that
 * only a value typeof string is given to this property, and that
 * the number of characters is within the min and max parameters given.
 *
 * When no max value is given, it is by default assumes that the maximum
 * number of characters are the same with minimum (min = max)
 *
 * @throws InvalidPropertyType when incorrect type is given to the property
 */
export function varchar(
  validator?: (value: string, params: { [key: string]: any }) => void
): PropertyDecorator {
  return function (target, propertyKey) {
    EntitySchemaRegistry.registerFieldType(
      target.constructor as ClassConstructor,
      propertyKey,
      "varchar"
    );
    if (typeof propertyKey !== "string") {
      throw new Error(`Property key must be a string`);
    }
    return {
      set: function (this: any, value: unknown) {
        /**
         * Checking whether a @fixed decorator has been applied to this
         * property. If so, we do not allow modifying this property
         * after it has been first set
         */
        let hasFixedMetaData = Reflect.getMetadata(
          fixedMetaData,
          target,
          propertyKey
        );
        if (hasFixedMetaData) return;

        /**
         * Checking whether a @nullable decorator has been applied to this
         * property. If so, we will just set the value as null and move on
         */
        let isNullableValue = Reflect.getMetadata(
          nullableMetaData,
          target,
          propertyKey
        );
        if (isNullableValue && value === null) {
          this[createPropAlias(propertyKey)] = null;
          return;
        }

        if (typeof value !== "string") {
          throw new TypeError(
            `Invalid type for property ${propertyKey}: expected string, got ${typeof value}`
          );
        }

        if (validator !== undefined) validator(value, this);

        const alias = createPropAlias(propertyKey);
        this[alias] = value;
      },
      get: function () {
        const alias = createPropAlias(propertyKey);
        return this[alias] ?? null;
      },
      enumerable: true,
      configurable: true,
    };
  };
}

/**
 * An Entity property decorator. This decorator asserts that only a value typeof
 * number can be given to this property.
 *
 * @throws InvalidPropertyType - when value with type other than number is given to the property
 */
export function int(
  validator?: (value: number, params: { [key: string]: any }) => void
): PropertyDecorator {
  return function (target, propertyKey) {
    EntitySchemaRegistry.registerFieldType(
      target.constructor as ClassConstructor,
      propertyKey,
      "int"
    );
    if (typeof propertyKey !== "string") {
      throw new Error(`Property key must be a string`);
    }
    return {
      set: function (this: any, value: number) {
        /**
         * Checking whether a @fixed decorator has been applied to this
         * property. If so, we do not allow modifying this property
         * after it has been first set
         */
        let hasFixedMetaData = Reflect.getMetadata(
          fixedMetaData,
          target,
          propertyKey
        );
        if (hasFixedMetaData) return;

        /**
         * Checking whether a @nullable decorator has been applied to this
         * property. If so, we will just set the value as null and move on
         */
        let isNullableValue = Reflect.getMetadata(
          nullableMetaData,
          target,
          propertyKey
        );
        if (isNullableValue && value === null) {
          this[createPropAlias(propertyKey)] = null;
          return;
        }

        if (typeof value !== "number") {
          throw new Error(
            `Invalid type for property ${propertyKey}: expected number, got ${typeof value}`
          );
        }

        if (validator !== undefined) validator(value, this);

        const alias = createPropAlias(propertyKey);
        this[alias] = value;
      },
      get: function () {
        const alias = createPropAlias(propertyKey);
        return this[alias] ?? null;
      },
      enumerable: true,
      configurable: true,
    };
  };
}

/**
 * An Entity property decorator. This decorator asserts that only a value that is
 * in the format of ISO string will be accepted
 *
 * @throws InvalidPropertyType - when value with type other than number is given to the property
 *
 */
export function timestamp(
  validator?: (value: string, params: { [key: string]: any }) => void
): PropertyDecorator {
  return function (target, propertyKey) {
    EntitySchemaRegistry.registerFieldType(
      target.constructor as ClassConstructor,
      propertyKey,
      "timestamp"
    );
    if (typeof propertyKey !== "string") {
      throw new Error(`Property key must be a string`);
    }
    return {
      set: function (this: any, value: string) {
        /**
         * Checking whether a @fixed decorator has been applied to this
         * property. If so, we do not allow modifying this property
         * after it has been first set
         */
        let hasFixedMetaData = Reflect.getMetadata(
          fixedMetaData,
          target,
          propertyKey
        );
        if (hasFixedMetaData) return;

        /**
         * Checking whether a @nullable decorator has been applied to this
         * property. If so, we will just set the value as null and move on
         */
        let isNullableValue = Reflect.getMetadata(
          nullableMetaData,
          target,
          propertyKey
        );
        if (isNullableValue && value === null) {
          this[createPropAlias(propertyKey)] = null;
          return;
        }

        if (typeof value !== "string") {
          throw new Error(
            `Invalid type for property ${propertyKey}: expected string, got ${typeof value}`
          );
        }

        if (!isValidTimestamp(value)) {
          throw new Error(
            `Invalid timestamp format for property ${propertyKey}`
          );
        }

        if (validator !== undefined) {
          validator(value, this);
        }

        const alias = createPropAlias(propertyKey);
        this[alias] = value;
      },
      get: function () {
        const alias = createPropAlias(propertyKey);
        return this[alias] ?? null;
      },
      enumerable: true,
      configurable: true,
    };
  };
}

/**
 * An Entity property decorator. This decorator asserts that only a value typeof
 * boolean can be given to this property.
 *
 * @throws InvalidPropertyType - when a value with type other than boolean is set to the property
 *
 */
export function boolean(
  validator?: (value: boolean, params: { [key: string]: any }) => void
): PropertyDecorator {
  return function (target, propertyKey) {
    EntitySchemaRegistry.registerFieldType(
      target.constructor as ClassConstructor,
      propertyKey,
      "boolean"
    );
    if (typeof propertyKey !== "string") {
      throw new Error(`Property key must be a string`);
    }
    return {
      set: function (this: any, value: boolean) {
        if (typeof value === "number") {
          if (value < 0 || value > 1) {
            throw new Error(
              `Invalid type for property ${propertyKey}: expected boolean, got ${typeof value}`
            );
          }
          value = 1 === value;
        }

        if (typeof value !== "boolean") {
          throw new Error(
            `Invalid type for property ${propertyKey}: expected boolean, got ${typeof value}`
          );
        }

        /**
         * Checking whether a @fixed decorator has been applied to this
         * property. If so, we do not allow modifying this property
         * after it has been first set
         */
        let hasFixedMetaData = Reflect.getMetadata(
          fixedMetaData,
          target,
          propertyKey
        );
        if (hasFixedMetaData) return;

        if (validator !== undefined) {
          validator(value, this);
        }

        const alias = createPropAlias(propertyKey);
        this[alias] = value;
      },
      get: function () {
        const alias = createPropAlias(propertyKey);
        return this[alias] ?? null;
      },
      enumerable: true,
      configurable: true,
    };
  };
}

/**
 * An Entity property decorator. This decorator asserts that only a string value
 * that can be parsed by JSON.parse can be given to this property.
 *
 * @throws InvalidPropertyType - when a value with type other than boolean is set to the property
 *
 */
export function json<T extends { [key: string]: any }>(
  validator?: (value: T, params: { [key: string]: any }) => void
): PropertyDecorator {
  return function (target, propertyKey) {
    EntitySchemaRegistry.registerFieldType(
      target.constructor as ClassConstructor,
      propertyKey,
      "json"
    );
    if (typeof propertyKey !== "string") {
      throw new Error(`Property key must be a string`);
    }
    return {
      set: function (this: any, value: string) {
        if (typeof value !== "string") {
          throw new Error(
            `Invalid type for property ${propertyKey}: expected string, got ${typeof value}`
          );
        }

        /**
         * Checking whether a @fixed decorator has been applied to this
         * property. If so, we do not allow modifying this property
         * after it has been first set
         */
        let hasFixedMetaData = Reflect.getMetadata(
          fixedMetaData,
          target,
          propertyKey
        );
        if (hasFixedMetaData) return;

        if (!isParsableJSON(value)) {
          throw new Error(
            `invalid JSON string given to property ${propertyKey}`
          );
        }

        const parsed = JSON.parse(value);

        if (validator !== undefined) {
          validator(parsed, this);
        }

        const alias = createPropAlias(propertyKey);
        this[alias] = value;
      },
      get: function () {
        const alias = createPropAlias(propertyKey);
        return this[alias] ?? null;
      },
      enumerable: true,
      configurable: true,
    };
  };
}
