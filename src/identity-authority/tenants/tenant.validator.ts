export namespace TenantValidator {
  export const name = (value: string) => {
    if (value.length === 0 || value.length > 64) {
      throw new Error('tenant name must not be empty or more than 64 characters')
    }
  }
  export const secret_key = (value: string) => {
    if (value.length !== 32) {
      throw new Error('tenant secret must not more than or less than 32 characters')
    }
  }
}