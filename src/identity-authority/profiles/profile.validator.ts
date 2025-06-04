export namespace ProfileValidator {

  export const first_name = (value: string) => {
    if (value.length < 2 || value.length > 32) {
      throw new Error('first name must be within 2 - 32 characters long')
    }
  }

  export const last_name = (value: string) => {
    if (value.length < 2 || value.length > 32) {
      throw new Error('last name must be within 2 - 32 characters long')
    }
  }

  export const image = (value: string | null) => {

  }

  export const about = (value: string) => {

  }

}