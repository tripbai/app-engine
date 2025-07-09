import FirebaseFirestore = require("@google-cloud/firestore");
import { injectable } from "inversify";
import { AppENV } from "../../../helpers/env";
import { AppLogger } from "../../../helpers/logger";
import { Application } from "../../../application";
import { FirestoreQueryType } from "./types";
import { DatabaseTransactionStep } from "../database.provider";
import { FirestoreService } from "./firestore.service";

const FirestoreClientsPool: {[key: string]: FirebaseFirestore.Firestore} = {}

@injectable()
export class FirestoreHelper {

  createOrGetClient(projectId: string, configPath: string){
    if (!(projectId in FirestoreClientsPool)) {
      FirestoreClientsPool[projectId] = new FirebaseFirestore.Firestore({
        projectId: projectId, keyFilename: configPath
      })
      AppLogger.info(`Firestore client created for project with id: ${configPath}`)
    }
    return FirestoreClientsPool[projectId]
  }

  createTransactionStep(
    executor: FirestoreService,
    qtype: FirestoreQueryType, 
    collection: string, 
    data: {[key:string]:any}
  ): DatabaseTransactionStep {
    return {
      executor: executor,
      type: (qtype === 'document.create') ? 'create' : 'update',
      query: `${qtype} ${collection}`, 
      data: data
    }
  }

  parseTransactionStep(query: string){
    const tokens = query.split(' ')
    if (tokens[1]===undefined||tokens[1]===null) {
      throw new Error('invalid Firestore single database transaction format: ' + query)
    }
    return {
      firestoreQuery: tokens[0],
      collectionName: tokens[1]
    }
  }

}