import { injectable } from "inversify";
import { AbstractKryptodocConfig } from "./kryptodoc-config.interface";
import { getEnv } from "../../application/appEnv";

@injectable()
export class KryptodocEnvConfig implements AbstractKryptodocConfig {
  getTopicId(): string {
    return getEnv("KRYPTODOC_INDEXER_TOPIC_ARN");
  }

  getMessageGroupId(): string {
    return getEnv("KRYPTODOC_MESSAGE_GROUP_ID");
  }
}
