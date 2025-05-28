export namespace thisJSON {
  export function isParsable(value: string) {
    try {
      JSON.parse(value)
      return true
    } catch (error) {
      return false
    }
  }
}