import { inject, injectable } from "inversify";
import { AbstractIndexerProvider, IndexTaskItem } from "../indexer.provider";
import { AbstractTopicPublisherProvider } from "../../topics/topic-publisher.provider";
import { AppLogger } from "../../../helpers/logger";
import { AppENV } from "../../../helpers/env";
import { KryptodocEnvConfig } from "../../../services/kryptodoc/kryptodoc-env-config";
import { AbstractKryptodocConfig } from "../../../services/kryptodoc/kryptodoc-config.interface";
const crypto = require('crypto')

@injectable()
export class KryptodocIndexerService implements AbstractIndexerProvider {

  constructor(
    @inject(KryptodocEnvConfig) public readonly kryptodocConfig: AbstractKryptodocConfig,
    @inject(AbstractTopicPublisherProvider) public readonly topicPublisherService: AbstractTopicPublisherProvider
  ){}

  async index(tasks: Array<IndexTaskItem>): Promise<void> {

    const deduplicationHash = this.createDeduplicationHash(tasks)
    const message = JSON.stringify(tasks)
    try {
      await this.topicPublisherService.publishTopic(
        this.kryptodocConfig.getTopicId(),
        message,
        {
          messageGroupId: this.kryptodocConfig.getMessageGroupId(),
          messageDeduplicationId: deduplicationHash
        }
      )
    } catch (error) {
      AppLogger.error({
        severity: 3,
        message: 'indexer publish tasks failed due to an error',
        data: {error: error }
      })
      throw error
    }

  }

  private createDeduplicationHash(tasks: Array<IndexTaskItem>){
    let hashable = ''
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]
      hashable += JSON.stringify(task)
    }
    return crypto.createHash('md5').update(hashable).digest('hex').toString()
  }

}