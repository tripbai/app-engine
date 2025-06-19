export namespace OrganizationValidator {

  export const business_name = (value: string) => {
    if (value.length < 5 || value.length > 120) {
      throw new Error('organization business name must be within 5 - 120 characters')
    }
  }

  export const status = (value: string) => {
    if (
      value !== 'active' && 
      value !== 'deactivated' && 
      value !== 'suspended' && 
      value !== 'pending' && 
      value !== 'archived' 
    ) {
      throw new Error('invalid organization status value')
    }
  }

}