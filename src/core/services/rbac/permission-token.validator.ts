import { injectable } from "inversify"
import { Core } from "../../module/module"

@injectable()
export class PermissionTokenValidator  {
  isConcrete(token:string): asserts token is Core.Authorization.ConcreteToken {
    if (!token.includes(':')) {
      throw new Error('concrete permission token contain two or more fields')
    }
    if (token.includes('{') || token.includes('}')) {
      throw new Error('conrete permission token must not include placeholders')
    }
  }
  isAbstract(token:string): asserts token is Core.Authorization.AbstractToken {
    if (!token.includes(':')) {
      throw new Error('abstract permission token must contain two or more fields')
    }
    if (!token.includes('{') && !token.includes('}')) {
      throw new Error('abstract permission token must contain placeholders')
    }
  }
}
