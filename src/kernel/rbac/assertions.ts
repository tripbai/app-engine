import { ConcretePermissionToken, AbstractPermissionToken } from "../interface";

export class PermissionTokenAsserter {
  static message = () => {
    return 'We have encountered invalid permission token that was '
      + 'provided by you or by an entity within the application'
  }
  static isConcrete(token:string): asserts token is ConcretePermissionToken {
    if (!token.includes(':')) {
      throw new Error('concrete permission token contain two or more fields')
    }
    if (token.includes('{') || token.includes('}')) {
      throw new Error('conrete permission token must not include placeholders')
    }
  }
  static isAbstract(token:string): asserts token is AbstractPermissionToken {
    if (!token.includes(':')) {
      throw new Error('abstract permission token must contain two or more fields')
    }
    if (!token.includes('{') && !token.includes('}')) {
      throw new Error('abstract permission token must contain placeholders')
    }
  }
}
