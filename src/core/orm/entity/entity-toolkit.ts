import { Core } from "../../core.types";

export namespace EntityToolkit {

  export namespace PropAlias {
    export const create = (prop: string): Core.Entity.PropAlias => {
      return `_${prop}`
    }
  }

  export namespace Assert {
    
    /** Asserts that the value is an Entity ID */
    export function idIsValid(id: unknown): asserts id is Core.Entity.Id {
      const regex = /^[a-zA-Z0-9]+$/
      if (typeof id !== 'string') {
        throw new Error('entity_id must be type of string')
      }
      if (!regex.test(id)) {
        throw new Error('entity_id value contains illegal characters')
      }
      if (id.length !== 32) {
        throw new Error('entity_id value length is incorrect')
      }
    }
  }

  export const serialize = <TModel>(data: TModel) => {
    const serialized: Record<keyof TModel, TModel[keyof TModel]> = Object.create(null)
    for (const alias in data) {
      /** Function members must not be exported */
      if (typeof data[alias] === 'function') continue
      if (alias[0] !== '_') continue
      const key = alias.slice(1)
      serialized[key] = data[alias]
    }
    return serialized
  }



}