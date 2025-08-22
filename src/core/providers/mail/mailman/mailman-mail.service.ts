import { inject, injectable } from "inversify";
import { AbstractMailProvider, SendMailParams } from "../mail.provider";
import { AbstractJWTProvider } from "../../jwt/jwt.provider";
import { JsonWebToken } from "../../jwt/jsonwebtoken/json-web-token.service";
import { AbstractTopicPublisherProvider } from "../../topics/topic-publisher.provider";
import { getEnv } from "../../../application/appEnv";

@injectable()
export class MailmanMail implements AbstractMailProvider {
  constructor(
    @inject(AbstractJWTProvider) private jwtHelper: AbstractJWTProvider,
    @inject(AbstractTopicPublisherProvider)
    private topicPublisher: AbstractTopicPublisherProvider
  ) {}

  async sendEmail(params: SendMailParams): Promise<void> {
    const secret = getEnv("JWT_SECRET");
    const token = this.jwtHelper.generate({
      secret: secret,
      untilMinutes: 60,
      data: params,
      issuer: "kernel.services.mailman",
      audience: "app.mailman",
    });
    const topic = getEnv("MAILMAN_TOPIC_ARN");
    await this.topicPublisher.publishTopic(topic, token);
  }
}
