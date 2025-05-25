import { BaseEntity } from "../entity/entity"
import { DataIntegrityException, LogicException } from "../../exceptions/exceptions"
import { Entity } from "../../interface"
import { DatabaseRecordDTO } from "../../services/database/interface"
import { EntityToolkit } from "../entity/toolkit"

export const RepositoryHelper = {

  isDateObject: (value: unknown) => {
    if (typeof value !== 'object') return false
    return value instanceof Date
  },

  toDatabaseRecordDTO: (model: ReturnType<typeof EntityToolkit.serialize>): DatabaseRecordDTO => {
    const transformed: DatabaseRecordDTO = Object.create(null)
    for (const key in model) {
      const value = model[key]
      if (
        typeof value === 'string' ||
        typeof value === 'boolean' || 
        typeof value === 'number'
      ) {
        transformed[key] = value
      }
    }
    return transformed
  },

  throwErrorWhen: {

    transaction: {
      isLocked: (state: null | 'create' | 'update') => {
        if (state !== null) {
          let message = `attempts to do another transaction `
          message += `when it is locked to a certain state`
          throw new LogicException({
            message: message,
            data: {state: state}
          })
        }
      }
    },

    data: {
      /**
       * Checks if a given data object contains no reserved filds
       * @param data - The data object
       */
      containsReservedFields: (data: {[key:string]: any}) => {
        const reserved: Array<Entity.ReservedFields> 
          = ['entity_id', 'created_at', 'updated_at', 'archived_at']
        for (const key in data) {
          if (reserved.includes(key as Entity.ReservedFields)) {
            let message = `passing ${key} field name to base `
            message += `repository model not allowed`
            throw new LogicException({
              message: message,
              data: data
            })
          }
        }
      },

      /**
       * Validates whether a data object contains 
       * reserved fields
       * @param data 
       */
      hasMissingReservedFields: (data: {[key:string]: any}) => {
        const reserved: Array<Entity.ReservedFields> 
          = ['entity_id', 'created_at', 'updated_at', 'archived_at']
        reserved.forEach(field => {
          let message = `missing field ${field} from data`
          if (!(field in data)) {
            throw new DataIntegrityException({
              message: message,
              data: data
            })
          }
        })
      }


    },

    model: {
      hasNotInitialized: (state: boolean) => {
        if (!state) {
          let message = `attempt to do action on controller when model `
          message += `is not yet initialized`
          throw new LogicException({
            message: message,
            data: {state: state}
          })
        }
      }
    }

  },

  

  has: {
    
  },

  model: {
    hasInitialized: (state: boolean) => {
      if (!state) {
        let message = `attempt to do action on controller `
        message += `when model is not yet initialized`
        throw new LogicException({
          message: message,
          data: {state: state}
        })
      }
    }
  }
}