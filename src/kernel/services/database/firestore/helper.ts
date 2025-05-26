import * as fs from 'fs'
import * as FirebaseFirestore from '@google-cloud/firestore'
import { Vaulter } from '../../../helpers/vaulter'
import { LogicException } from '../../../exceptions/exceptions'
import { DatabaseSingleTransaction } from '../interface'
import { AppENV } from '../../../helpers/env'
import { AppLogger } from '../../../helpers/logger'
import { Application } from '../../../application'

export type FirestoreQuery = 'collection.create' | 'document.create' | 'document.update'

let FirebaseClient: FirebaseFirestore.Firestore | null = null

export type FirestoreVaultConfig = {
  project_id: string
}

export namespace FirestoreHelper {
  
  export const getClient = function(): FirebaseFirestore.Firestore{
    const projectId = AppENV.get('FIREBASE_PROJECT_ID')
    if (FirebaseClient === null) {
      FirebaseClient = new FirebaseFirestore.Firestore({
        projectId: projectId, keyFilename: getConfigPath()
      })
      AppLogger.info('FirestoreHelper Client connected')
    }
    return FirebaseClient
  }

  export const transact = (query:FirestoreQuery,collectionName: string, data:{[key:string]:any}):DatabaseSingleTransaction=>{
    return {
      query: query+' '+collectionName,
      data: data
    }
  }

  export const parseTrasanction = (query:string)=>{
    const tokens = query.split(' ')
    if (tokens[1]===undefined||tokens[1]===null) {
      throw new Error('invalid Firestore single database transaction format: '+query)
    }
    return {
      firestoreQuery: tokens[0],
      collectionName: tokens[1]
    }
  }

  export const getConfigPath = ()=>{
    const deployment = Application.deployment()
    const filename   = `${deployment}.firebase.config.json`
    const vaultDir   = Vaulter.getDir()
    return `${vaultDir}/${filename}`
  }
}