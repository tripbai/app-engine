import {
  AbstractDatabaseProvider,
  DatabaseTransactionStep,
  FlatDatabaseRecord,
} from "../database.provider";
import * as Core from "../../../module/types";

export class MockDatabaseProvider implements AbstractDatabaseProvider {
  async connect(): Promise<boolean> {
    return true;
  }
  async getRecordById(
    collectionName: string,
    id: Core.Entity.Id
  ): Promise<FlatDatabaseRecord[]> {
    return [];
  }
  async getRecordsByIds(
    collectionName: string,
    ids: Core.Entity.Id[]
  ): Promise<FlatDatabaseRecord[]> {
    return [];
  }
  async whereFieldHasValue(
    collectionName: string,
    fieldName: string,
    value: string | number | boolean | null
  ): Promise<FlatDatabaseRecord[]> {
    return [];
  }
  createRecord(
    collectionName: string,
    record: FlatDatabaseRecord
  ): DatabaseTransactionStep {
    return {
      executor: this,
      type: "create",
      query: "",
      data: {} as FlatDatabaseRecord,
    };
  }
  async beginTransaction(
    transactionableActions: DatabaseTransactionStep[]
  ): Promise<void> {
    return;
  }
  updateRecord(
    collectionName: string,
    record: FlatDatabaseRecord
  ): DatabaseTransactionStep {
    return {
      executor: this,
      type: "update",
      query: "",
      data: {} as FlatDatabaseRecord,
    };
  }
  async useQuery(
    transactionableAction: DatabaseTransactionStep
  ): Promise<{ [key: string]: any }[]> {
    return [];
  }
}
