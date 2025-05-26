import { KryptolibIndexTask } from './helper'
import { NotificationProviderInterface } from '../notifications/interface'
import { AppENV } from '../../helpers/env'
import { AppLogger } from '../../helpers/logger'
import { Application } from '../../application'
const crypto = require('crypto')

const fs = require('fs')

type KrypolibIndexerServiceConfig = {
  JWT_SECRET: string
}

const loadConfiguration = () => {
  return {
    jwtSecret: AppENV.get('JWT_SECRET')
  }
}

export class KryptolibIndexerService {
  private jwtSecret: string

  constructor(){
    const configurations = loadConfiguration()
    this.jwtSecret = configurations.jwtSecret
  }
  
  enqueue(provider:NotificationProviderInterface, tasks: Array<KryptolibIndexTask>){
    return new Promise(async (resolve,reject)=>{
      try {
        let taskstring = ''
        for (let i = 0; i < tasks.length; i++) {
          const task = tasks[i]
          taskstring += JSON.stringify(task)
        }
        const deduplicationHash = crypto.createHash('md5').update(JSON.stringify(taskstring)).digest('hex').toString()
        await this.publish(
          provider,
          deduplicationHash,
          tasks
        )
        resolve({})
      } catch (error) {
        AppLogger.error({
          severity: 3,
          message: 'indexer enqueue failed due to an error',
          data: {error: error }
        })
        let message = 'This exception was thrown due to an issue encountered by '
        message += 'your indexer provider. Please refer to your application logs '
        message += 'for more details'
        reject(message)
      }
    })
  }

  private publish(provider:NotificationProviderInterface, deduplicationHash: string, tasks: Array<KryptolibIndexTask> ){
    return new Promise(async (resolve,reject)=>{
      try {
        const message = JSON.stringify(tasks)
        /**
         * @NOTE We are passing the entity_collection value as the Message Group ID.
         * This is to ensure that the order of tasks is consistent in a given collection.
         */
        await provider.publishAsFifo('KRYPTOLIB_INDEXER_FIFO','index_group',deduplicationHash,message)
        if (Application.deployment() === 'staging') {
          let message = `Successfully published [KRYPTOLIB_INDEXER_FIFO] topic to Notification provider`
          AppLogger.info(message)
        }
        resolve({})
      } catch (error) {
        AppLogger.error({
          severity: 3,
          message: 'indexer publish failed due to an error',
          data: {error: error}
        })
        reject(error)
      }
    })
  }

}