import axios, { AxiosError, AxiosResponse } from 'axios'
import { JwtHelper } from '../../../helpers/jwt'
import { GenericServiceProviderException, ResourceAccessForbiddenException } from '../../../exceptions/exceptions'
import { handleAxiosError } from '../../axios/error.handler'
import { NotificationProviderInterface } from '../../notifications/interface'
import { Entity } from '../../../interface'
import { AppENV } from '../../../helpers/env'
import { Application } from '../../../application'
import { AppLogger } from '../../../helpers/logger'

export type MailmanTokenPayload<T extends {[key:string]:string}> = {
  /**
   * A human-readable ID that maps to a configuration in 
   * Mailman application instance, which determines the 
   * from email and credentials of the email account the 
   * email will be sent from. 
   */
  sender_id: string
  template_id: string,
  provider: 'local'
  to_email: string,
  ccs?: Array<string> | null
  variables: T
}

export namespace MailmanRoutes {
  export type Send = {
    request: {
      path: '/mailman/actions/send',
      data: { token: string }
    }
    response: {}
  }
}

export type MailmanNotificationMessagingInterface = {
  token: string
}

export type MailmanNotificationTopic = 'TOPIC_MAILMAN_SEND_EMAIL'

const fs = require('fs')


export class MailmanService {
  constructor(){

  }

  notify<T extends {[key:string]:string}>(provider:NotificationProviderInterface, payload: MailmanTokenPayload<T>){
    return new Promise(async (resolve,reject)=>{
      try {
        const secret = AppENV.get('JWT_SECRET')
        const token = JwtHelper.generate({
          secret: secret,
          untilMinutes: 60,
          data: payload,
          issuer: 'kernel.services.mailman',
          audience: 'app.mailman'
        })
        this.publish(provider, token)
        resolve({})
      } catch (error) {
        reject(new GenericServiceProviderException({
          message: 'mailman notify failed',
          severity: 2,
          data: {error: error}
        }))
      }
    })
  }
  
  parseToken(token:string){
    const parsed = JwtHelper.parse<MailmanTokenPayload<{[key:string]:any}>>(token)
    if (parsed.iss!=='kernel.services.mailman') {
      throw new ResourceAccessForbiddenException({
        message: 'invalid token issuer',
        data: {parsed: parsed}
      })
    }
    if (parsed.aud!=='app.mailman') {
      throw new ResourceAccessForbiddenException({
        message: 'invalid token audience',
        data: {parsed: parsed}
      })
    }
    return parsed.data
  }

  private publish(provider:NotificationProviderInterface, token:string){
    return new Promise(async (resolve,reject)=>{
      try {
        const message: MailmanNotificationMessagingInterface = {
          token: token
        }
        const topic: MailmanNotificationTopic = 'TOPIC_MAILMAN_SEND_EMAIL'
        await provider.publish(topic,message)
        if (Application.deployment()==='staging') {
          let message = `Successfully published [TOPIC_MAILMAN_SEND_EMAIL] topic to Notification provider`
          AppLogger.info(message)
        }
        resolve({})
      } catch (error) {
        reject(error)
      }
    })
  }

}