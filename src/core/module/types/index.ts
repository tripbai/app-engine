export * as Entity from "./entity";
/**
 * Represents a valid timestamp format this application
 * should use.
 */
export type TimeStamp = string & { readonly brand: unique symbol };
