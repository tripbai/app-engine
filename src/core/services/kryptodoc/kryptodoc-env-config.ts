import { AppENV } from "../../helpers/env";
import { AbstractKryptodocConfig } from "./kryptodoc-config.interface";

export class KryptodocEnvConfig implements AbstractKryptodocConfig {
  
  getTopicId(): string {
    return AppENV.get('KRYPTODOC_INDEXER_TOPIC_ARN')
  }

  getMessageGroupId(): string {
    return AppENV.get('KRYPTODOC_MESSAGE_GROUP_ID')
  }

}