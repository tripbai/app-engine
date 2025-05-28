export namespace TestUserValidator {

  export const first_name = (value: string) => {
    if (value.length < 3) {
      throw new Error('first name should be more than 3 characters')
    }
  }

  export const age = (value: number) => {
    if (value < 18) {
      throw new Error('age should be more than 18')
    }
  }

  export const timestamp = (value: string) => {
    if (value < '2024-01-01') {
      throw new Error('enrolled_at value should not be before 2024')
    }
  }

  export const isValidAgeToDrink = (data: {citizenship: string}, params: { age: number }) => {
    if ('citizenship' in data && typeof data.citizenship === 'string') {
      if (params.age < 21 && data.citizenship === 'American') {
        throw new Error(`American citizens cannot drink beer when under 21 years old`)
      }
    } else {
      throw new Error('metadata must have citizenship field')
    }
    
  }

}