export namespace AssertEntity {
  
  /** Asserts that the value is an Entity ID */
  export function idIsValid(id: unknown): asserts id is string & { length: 32 } {
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