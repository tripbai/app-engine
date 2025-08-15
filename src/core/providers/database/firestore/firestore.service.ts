import { inject, injectable } from "inversify";
import { FirestoreHelper } from "./firestore.helper";
import {
  FatalFirestoreConnectionError,
  GenericFirestoreException,
} from "./exceptions";
import {
  AbstractDatabaseProvider,
  DatabaseTransactionStep,
  FlatDatabaseRecord,
} from "../database.provider";
import * as Core from "../../../module/types";
import { DocumentData } from "@google-cloud/firestore";
import { FirebaseEnvBasedProjectService } from "../../../services/firebase/firebase-env-based-project.service";
import { FirebaseProjectInterface } from "../../../services/firebase/firebase-project.interface";
import { LogicException } from "../../../exceptions/exceptions";

@injectable()
export class FirestoreService implements AbstractDatabaseProvider {
  private client!: FirebaseFirestore.Firestore;

  constructor(
    @inject(FirestoreHelper) public readonly FirestoreHelper: FirestoreHelper,
    @inject(FirebaseEnvBasedProjectService)
    public readonly FirebaseProject: FirebaseProjectInterface
  ) {}

  async connect(): Promise<boolean> {
    try {
      this.client = this.FirestoreHelper.createOrGetClient(
        this.FirebaseProject.getProjectId(),
        this.FirebaseProject.getConfPath()
      );
    } catch (error) {
      throw new FatalFirestoreConnectionError({
        message: "failed to connect with the Firebase client",
        data: { error: error },
      });
    }
    return true;
  }

  createRecord(
    collectionName: string,
    record: FlatDatabaseRecord
  ): DatabaseTransactionStep {
    return this.FirestoreHelper.createTransactionStep(
      this,
      "document.create",
      collectionName,
      record
    );
  }

  async beginTransaction(
    transactionSteps: DatabaseTransactionStep[]
  ): Promise<void> {
    try {
      const batch = this.client.batch();
      for (let i = 0; i < transactionSteps.length; i++) {
        const transactionStep = transactionSteps[i];
        const transaction = this.FirestoreHelper.parseTransactionStep(
          transactionStep.query
        );
        const entityId = transactionStep.data.entity_id as string;
        const documentRef = this.client
          .collection(transaction.collectionName)
          .doc(entityId);
        if (transaction.firestoreQuery === "collection.create") {
          continue;
        }
        if (transaction.firestoreQuery === "document.update") {
          batch.update(documentRef, transactionStep.data);
          continue;
        }
        if (transaction.firestoreQuery === "document.create") {
          batch.create(documentRef, transactionStep.data);
          continue;
        }
      }
      await batch.commit();
      return;
    } catch (error) {
      throw new GenericFirestoreException({
        message: "failed to complete transaction with Firestore due to error",
        data: { error: error },
      });
    }
  }

  async whereFieldHasValue(
    collectionName: string,
    fieldName: string,
    fieldValue: string | number | boolean | null
  ): Promise<FlatDatabaseRecord[]> {
    try {
      const documentQuery = this.client
        .collection(collectionName)
        .where(fieldName, "==", fieldValue);
      const snapShots = await documentQuery.get();
      const result: Array<{ [key: string]: any }> = [];
      snapShots.forEach((snapShot) => {
        const data = snapShot.data();
        result.push(data);
      });
      return result;
    } catch (error) {
      throw new GenericFirestoreException({
        message: "failed to retrieve Firestore documents with specific fields",
        data: {
          collection: collectionName,
          field_name: fieldName,
          field_value: fieldValue,
          error: error,
        },
      });
    }
  }

  async getRecordById(
    collection: string,
    entityId: Core.Entity.Id
  ): Promise<FlatDatabaseRecord[]> {
    try {
      const documentRef = this.client.collection(collection).doc(entityId);
      const docSnapshot = await documentRef.get();
      if (!docSnapshot.exists) {
        return [];
      }
      const data = docSnapshot.data();
      if (data === undefined) {
        return [];
      }
      return [data];
    } catch (error) {
      throw new GenericFirestoreException({
        message: "failed to retrieve Firestore document due to error",
        data: {
          collection: collection,
          entity_id: entityId,
          error: error,
        },
      });
    }
  }

  async getRecordsByIds(
    collection: string,
    entityIds: Core.Entity.Id[]
  ): Promise<FlatDatabaseRecord[]> {
    try {
      const refs = entityIds.map((entityId) => {
        return this.client.collection(collection).doc(entityId);
      });
      const snapShots = await this.client.getAll(...refs);
      const result: Array<DocumentData> = [];
      snapShots.forEach((snapShot) => {
        const data = snapShot.data();
        if (data === undefined) return;
        result.push(data);
      });
      return result;
    } catch (error) {
      throw new GenericFirestoreException({
        message: "failed to retrieve multiple Firestore documents due to error",
        data: {
          collection: collection,
          entity_ids: entityIds,
          error: error,
        },
      });
    }
  }

  updateRecord(
    collection: string,
    record: FlatDatabaseRecord
  ): DatabaseTransactionStep {
    return this.FirestoreHelper.createTransactionStep(
      this,
      "document.update",
      collection,
      record
    );
  }

  async useQuery(
    transactionableAction: DatabaseTransactionStep
  ): Promise<{ [key: string]: any }[]> {
    throw new LogicException({
      message: "method not yet implemented",
      data: { method: "Firestore:useQuery" },
    });
  }
}
