// /**
//  * Namespace for validation functions ensuring values meet specific criteria.
//  */
// export namespace IsValid {

//   /**
//    * Asserts that the given value is neither `undefined` nor `null`.
//    * Throws an error if the value is `undefined` or `null`.
//    *
//    * @template T - The expected type of the value, extending string, boolean, number, or null.
//    * @param {T|null|undefined} value - The value to validate.
//    * @throws {Error} If the value is `undefined` or `null`.
//    */
//   export function NotUndefinedNorNull<T extends string | boolean | number | null>(value: T | null | undefined): asserts value is T {
//     if (value === undefined || value === null) {
//       throw new Error('value should not be undefined nor null');
//     }
//   }

//   /**
//    * Asserts that the provided value is a non-empty string.
//    * Throws an error if the value is not a string or if it is empty.
//    *
//    * @param {unknown} value - The value to validate.
//    * @throws {Error} If the value is not a string or is empty.
//    */
//   export function NonEmptyString(value: unknown): asserts value is string {
//     if (typeof value !== 'string') {
//       throw new Error('value should be of type string');
//     }
//     if (value.trim() === '') {
//       throw new Error('value should not be empty');
//     }
//   }

//   /**
//    * Asserts that the provided value is of boolean type.
//    * Throws an error if the value is not a boolean.
//    *
//    * @param {unknown} value - The value to validate.
//    * @throws {Error} If the value is not a boolean.
//    */
//   export function BooleanValue(value: unknown): asserts value is boolean {
//     if (typeof value !== 'boolean') {
//       throw new Error('value should be of type boolean');
//     }
//   }

//   /**
//    * Asserts that the provided value is an alphanumeric string.
//    * Throws an error if the value is not a string or if it contains non-alphanumeric characters.
//    *
//    * @param {unknown} value - The value to validate.
//    * @throws {Error} If the value is not a string or is not alphanumeric.
//    */
//   export function AlphaNumeric(value: unknown): asserts value is string & { regex: '/^[a-zA-Z0-9]+$/' } {
//     if (typeof value !== 'string') {
//       throw new Error('value should be of type string');
//     }
//     if (!(/^[a-zA-Z0-9]+$/.test(value))) {
//       throw new Error('value should be alphanumeric');
//     }
//   }

//   /**
//    * Asserts that the provided value is a non-zero positive integer.
//    * Throws an error if the value is not a number, zero, or negative.
//    *
//    * @param {unknown} value - The value to validate.
//    * @throws {Error} If the value is not a number, zero, or negative.
//    */
//   export function NonZeroInteger(value: unknown): asserts value is number {
//     TypeOfInteger(value)
//     if (value === 0 || value < 0) {
//       throw new Error('value must be greater than zero');
//     }
//   }

//   /**
//    * Asserts that the provided value is type of number.
//    * Throws an error if the value is not a number.
//    *
//    * @param {unknown} value - The value to validate.
//    * @throws {Error} If the value is not a number, zero, or negative.
//    */
//   export function TypeOfInteger(value: unknown): asserts value is number {
//     if (typeof value !== 'number') {
//       throw new Error('value should be of type number');
//     }
//   }

  



// }