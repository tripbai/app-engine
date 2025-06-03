import { inject, injectable } from "inversify";
import { AbstractMailProvider, SendMailParams } from "../mail.provider";
import { Core } from "../../../module/module";
import { JWTProviderInterface } from "../../jwt/jwt.provider";
import { JsonWebToken } from "../../jwt/jsonwebtoken/json-web-token.service";
import { AbstractTopicPublisherProvider } from "../../topics/topic-publisher.provider";
import { AppENV } from "../../../helpers/env";

@injectable()
export class MailmanMail implements AbstractMailProvider {

  constructor(
    @inject(JWTProviderInterface) public readonly jwtHelper: JWTProviderInterface,
    @inject(AbstractTopicPublisherProvider) public readonly topicPublisher: AbstractTopicPublisherProvider
  ){}

  async sendEmail(params: SendMailParams): Promise<void> {
    const secret = AppENV.get('JWT_SECRET')
    const token = this.jwtHelper.generate({
      secret: secret,
      untilMinutes: 60,
      data: params,
      issuer: 'kernel.services.mailman',
      audience: 'app.mailman'
    })
    const topic = AppENV.get('MAILMAN_TOPIC_ARN')
    await this.topicPublisher.publishTopic(
      topic,
      token
    )
  }

}