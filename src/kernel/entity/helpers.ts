import { Entity } from "../interface"

export namespace EntityHelper {
  export const createPropAlias = (prop: string): Entity.PropAlias => {
    return `_${prop}`
  }
}