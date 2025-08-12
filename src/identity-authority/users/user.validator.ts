export namespace UserValidator {

  export const identity_provider = (value: string) => {
    if (value !== 'fireauth' && value !== 'google' && value !== 'iauth') {
      throw new Error('invalid identity provider')
    }
  }

  export const email_address = (value: string) => {
    /**
     * @TODO A more comprehensive email format validation
     */
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!regex.test(value)) {
      throw new Error('invalid or unsupported email address format')
    }
    if (value.length < 8 || value.length > 64) {
      throw new Error('email address must be within 8 - 64 characters long')
    }
  }

  export const username = (value: string) => {
    const regex = /^[a-zA-Z0-9_]+$/
    if (!regex.test(value)) {
      throw new Error('invalid or unsupported username format')
    }
    if (value.length < 3 || value.length > 32) {
      throw new Error('username must be within 3 to 32 characters long')
    }
  }

  export const creation_context = (value: string) => {
    if (value !== 'internal' && value !== 'external') {
      throw new Error('invalid creation_context value')
    }
  }

  export const role = (value: string) => {
    if (value !== 'webadmin' && value !== 'moderator' && value !== 'user') {
      throw new Error('invalid user role value')
    }
  }

  export const status = (value: string) => {
    if (
      value !== 'active' && 
      value !== 'unverified' && 
      value !== 'banned' && 
      value !== 'deactivated' && 
      value !== 'suspended' && 
      value !== 'archived'
    ) {
      throw new Error('invalid user status')
    }
  }

  export const type = (value: string) => {
    if (value !== 'concrete' && value !== 'abstract') {
      throw new Error('invalid user type')
    }
  }

  export const password = (value: string) => {
    if (value.length < 8 || value.length > 64 ){
      throw new Error('insufficient or unsupported password length')
    }
  }

}