/**
 * The Entity ID of an object. This value can only be provided once,
 * and cannot be overriden. This property only accepts value typeof string,
 * with characters not lesser than 1 and not more than 32.
 */
export type Id = string & { length: 32 };
/**
 * The external id representation of the Entity Object.
 * Please know that this value is not universally unique,
 * and it's only unique within the type of entity
 */
export type ExternalId = number;
export type PropAlias<T extends string> = `_${T}`;
export type ReservedFields =
  | "id"
  | "entity_id"
  | "created_at"
  | "updated_at"
  | "archived_at";
