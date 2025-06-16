export namespace EmailTemplateValidator {
  export const template_type = (value: string) => {
    if (typeof value !== 'string') {
      throw new Error('email template key must be typeof string')
    }
    if (
      value !== 'password_reset_template' &&
      value !== 'account_verification_template' && 
      value !== 'email_confirmation_template' && 
      value !== 'login_link_template'
    ) {
      throw new Error('email template type must be one of the pre-defined keys')
    }
  }
  
  export const description = (value: string | null) => {
    if (value === null) return
    if (typeof value !== 'string') {
      throw new Error('email template description must be typeof string')
    }
    if (value.trim().length === 0) {
      throw new Error('email template description must not be empty')
    }
    if (value.length > 150 ) {
      throw new Error('email template description must not be more than 150 characters')
    }
  }
}