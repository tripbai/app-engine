export namespace FeatureValidator {

  export function key (value: string) {
    if (!(/^[a-z]+(_[a-z]+)*$/.test(value))) {
      throw new Error(
        'invalid feature key format'
      )
    }
  }

  export const category = (value: string) => {
    if (value.length < 2 || value.length > 64) {
      throw new Error(
        'feature category value must be within 2 - 64 characters'
      )
    }
  }

  export const description = (value: string) => {
    if (value.length === 0 || value.length > 256) {
      throw new Error(
        'feature category value must be within 0 - 256 characters'
      )
    }
  }
}