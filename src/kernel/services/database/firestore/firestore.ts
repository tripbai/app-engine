import { LogicException } from "../../../exceptions/exceptions"
import { Entity } from "../../../interface"
import { DatabaseCreateOptions, DatabaseGetOptions, DatabaseProviderInterface, DatabaseSingleTransaction, DatabaseUpdateOptions, DatabaseWhereFieldOptions } from "../interface"
import { FirestoreHelper } from "./helper"
import { DocumentData, DocumentReference } from "@google-cloud/firestore"
import { FatalFirestoreConnectionError, GenericFirestoreException } from "./exceptions"

export class Firestore implements DatabaseProviderInterface {
  private client: FirebaseFirestore.Firestore
  connect(): Promise<boolean> {
    return new Promise(async (resolve,reject)=>{
      try {
        this.client = FirestoreHelper.getClient()
        resolve(true)
      } catch (error) {
        reject(new FatalFirestoreConnectionError({
          message: 'failed to connect with Firestore client',
          data: {
            error: error
          }
        }))
      }
    })
  }
  create(): DatabaseCreateOptions {
    return {
      collection:(query:string|null):void=>{
        throw new LogicException({
          message: 'method not yet implemented',
          data: {
            method: 'Firestore:create:collection'
          }
        })
      },
      entity:(collection, data)=>{
        return FirestoreHelper.transact(
          'document.create', 
          collection, 
          data
        )
      }
    }
  }
  beginTransaction(singleOperations: DatabaseSingleTransaction[]): Promise<null> {
    return new Promise(async (resolve,reject)=>{
      try {
        const batch = this.client.batch()
        for (let i = 0; i < singleOperations.length; i++) {
          const singleOperation = singleOperations[i]
          const transaction = FirestoreHelper.parseTrasanction(singleOperation.query)
          const entityId = singleOperation.data.entity_id as string
            const documentRef 
              = this.client.collection(transaction.collectionName).doc(entityId)
          if (transaction.firestoreQuery==='collection.create') {
            continue
          }
          if (transaction.firestoreQuery==='document.update') {
            batch.update(documentRef,singleOperation.data)
            continue
          }
          if (transaction.firestoreQuery==='document.create') {
            batch.create(documentRef,singleOperation.data)
            continue
          }
        }
        await batch.commit()
        resolve(null)
      } catch (error) {
        reject(new GenericFirestoreException({
          message: 'failed to complete transaction with Firestore',
          data: {
            error: error
          }
        }))
      }
    })
  }

  whereField(collection: string, fieldName: string): DatabaseWhereFieldOptions {
    return {
      hasValue: (fieldValue) => {
        return new Promise(async (resolve, reject)=>{
          try {
            const documentQuery = this.client.collection(collection).where(fieldName,'==', fieldValue)
            const snapShots   = await documentQuery.get()
            const result:Array<{[key:string]:any}> = []
            snapShots.forEach((snapShot)=>{
              const data = snapShot.data()
              result.push(data)
            })
            resolve(result) 
          } catch (error) {
            reject(new GenericFirestoreException({
              message: 'failed to retrieve document from Firestore with specific fields',
              data: {
                collection: collection, 
                field_name: fieldName,
                field_value: fieldValue,
                error: error
              }
            }))
          }
        })
      }
    }
  }

  get(): DatabaseGetOptions {
    return {
      entity:(collection, entityId)=>{
        return new Promise(async (resolve,reject)=>{
          try {
            const documentRef = this.client.collection(collection).doc(entityId)
            const docSnapshot = await documentRef.get()
            if (!docSnapshot.exists) {
              return resolve([])
            }
            const data = docSnapshot.data()
            if (data === undefined) {
              return resolve([])
            }
            resolve([data])
          } catch (error) {
            reject(new GenericFirestoreException({
              message: 'failed to retrieve document from Firestore',
              data: {
                collection: collection, 
                entity_id: entityId, 
                error: error
              }
            }))
          }
        })
      },
      entities: (collection, entityIds) => {
        return new Promise(async (resolve, reject) => {
          try {
            const refs = entityIds.map(entityId => {
              return this.client.collection(collection).doc(entityId)
            })
            const snapShots  = await this.client.getAll(...refs)
            const result:Array<DocumentData> = []
            snapShots.forEach((snapShot)=>{
              const data = snapShot.data()
              if (data === undefined) return
              result.push(data)
            })
            resolve(result) 
          } catch (error) {
            reject(new GenericFirestoreException({
              message: 'failed to retrieve multiple documents from Firestore',
              data: {
                collection: collection, 
                entity_ids: entityIds,
                error: error
              }
            }))
          }
        })
      },
      list:(collectionName,listName,value,limit)=>{
        throw new LogicException({
          message: 'method not yet implemented',
          data: {
            method: 'Firestore:get:list'
          }
        })
      }
    }
  }
  update(): DatabaseUpdateOptions {
    return {
      entity:(collection, data)=>{
        return FirestoreHelper.transact(
          'document.update', 
          collection, 
          data
        )
      }
    }
  }
  query(singleOperation: DatabaseSingleTransaction): Promise<{ [key: string]: any; }[]> {
    throw new LogicException({
      message: 'method not yet implemented',
      data: {
        method: 'Firestore:query'
      }
    })
  }

  getAll(){
    this.client.getAll()
  }
  
}