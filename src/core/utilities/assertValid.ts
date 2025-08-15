export function assertValidRecord(
  value: unknown
): asserts value is { [key: string]: any } {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError("Expected an object with string keys and any values");
  }
}

/**
 * Asserts that the given value is neither `undefined` nor `null`.
 * Throws an error if the value is `undefined` or `null`.
 *
 * @template T - The expected type of the value, extending string, boolean, number, or null.
 * @param {T|null|undefined} value - The value to validate.
 * @throws {Error} If the value is `undefined` or `null`.
 */
export function assertNotUndefinedNorNull<
  T extends string | boolean | number | null
>(value: T | null | undefined): asserts value is T {
  if (value === undefined || value === null) {
    throw new Error("value should not be undefined nor null");
  }
}

/**
 * Asserts that the provided value is a non-empty string.
 * Throws an error if the value is not a string or if it is empty.
 *
 * @param {unknown} value - The value to validate.
 * @throws {Error} If the value is not a string or is empty.
 */
export function assertNonEmptyString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("value should be of type string");
  }
  if (value.trim() === "") {
    throw new Error("value should not be empty");
  }
}

/**
 * Asserts that the provided value is of boolean type.
 * Throws an error if the value is not a boolean.
 *
 * @param {unknown} value - The value to validate.
 * @throws {Error} If the value is not a boolean.
 */
export function assertBooleanValue(value: unknown): asserts value is boolean {
  if (typeof value !== "boolean") {
    throw new Error("value should be of type boolean");
  }
}

/**
 * Asserts that the provided value is an alphanumeric string.
 * Throws an error if the value is not a string or if it contains non-alphanumeric characters.
 *
 * @param {unknown} value - The value to validate.
 * @throws {Error} If the value is not a string or is not alphanumeric.
 */
export function assertAlphaNumeric(
  value: unknown
): asserts value is string & { regex: "/^[a-zA-Z0-9]+$/" } {
  if (typeof value !== "string") {
    throw new Error("value should be of type string");
  }
  if (!/^[a-zA-Z0-9]+$/.test(value)) {
    throw new Error("value should be alphanumeric");
  }
}

/**
 * Asserts that the provided value is a non-zero positive integer.
 * Throws an error if the value is not a number, zero, or negative.
 *
 * @param {unknown} value - The value to validate.
 * @throws {Error} If the value is not a number, zero, or negative.
 */
export function assertNonZeroInteger(value: unknown): asserts value is number {
  assertTypeOfInteger(value);
  if (value === 0 || value < 0) {
    throw new Error("value must be greater than zero");
  }
}

/**
 * Asserts that the provided value is type of number.
 * Throws an error if the value is not a number.
 *
 * @param {unknown} value - The value to validate.
 * @throws {Error} If the value is not a number, zero, or negative.
 */
export function assertTypeOfInteger(value: unknown): asserts value is number {
  if (typeof value !== "number") {
    throw new Error("value should be of type number");
  }
}

/**
 * Asserts that the provided `params` object contains a valid file object,
 * typically passed via JavaScript using express-fileupload.
 *
 * @param params - The input to validate
 * @throws Will throw an error if the validation fails
 */
export function assertFileObject(params: unknown): asserts params is {
  data: {
    file: {
      name: string;
      data: Buffer;
      size: number;
      mimetype: string;
    };
  };
} {
  if (typeof params !== "object" || params === null) {
    throw new Error("Expected `params` to be a non-null object.");
  }

  const data = (params as any).data;
  if (typeof data !== "object" || data === null) {
    throw new Error("Expected `params.data` to be a non-null object.");
  }

  const file = (data as any).file;
  if (typeof file !== "object" || file === null) {
    throw new Error("Expected `params.data.file` to be a non-null object.");
  }

  const { name, data: fileData, size, mimetype } = file;

  if (typeof name !== "string" || name.trim() === "") {
    throw new Error("Invalid `file.name`: expected a non-empty string.");
  }

  if (!(fileData instanceof Buffer)) {
    throw new Error("Invalid `file.data`: expected a Buffer instance.");
  }

  if (typeof size !== "number" || size <= 0) {
    throw new Error("Invalid `file.size`: expected a number greater than 0.");
  }

  if (typeof mimetype !== "string" || mimetype.trim() === "") {
    throw new Error("Invalid `file.mimetype`: expected a non-empty string.");
  }
}
