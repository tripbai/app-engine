export class InvalidPropertyType extends Error {
  constructor(property: string, required: string, given: unknown) {
    let message = 'Invalid data type given to property "' + property + '". ';
    message += "This property expects values type of " + required + ", ";
    message += given + " was given";
    super(message);
    this.message = message;
    this.name = this.constructor.name;
  }
}

export class LengthException extends Error {
  constructor(
    property: string,
    minimum: number,
    maximum: number,
    given: string
  ) {
    let message =
      'Value given to property "' +
      property +
      '" was beyond the character limit. ';
    message +=
      "This property expects a string with minimum (" +
      minimum +
      ") and maximum (" +
      maximum +
      ') length, "';
    message += given + '" was given';
    super(message);
    this.message = message;
    this.name = this.constructor.name;
  }
}