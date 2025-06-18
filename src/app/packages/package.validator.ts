export namespace PackageValidator {

  export const name = (name: string) => {
    if (typeof name !== 'string' || name.length === 0) {
      throw new Error('Package name must be a non-empty string.');
    }
    if (name.length > 32) {
      throw new Error('Package name must not exceed 32 characters.');
    }
  }

}