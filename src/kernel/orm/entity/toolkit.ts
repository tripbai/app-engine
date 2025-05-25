import { Entity } from "../../interface";

export namespace EntityToolkit {

  export namespace PropAlias {
    export const create = (prop: string): Entity.PropAlias => {
      return `_${prop}`
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