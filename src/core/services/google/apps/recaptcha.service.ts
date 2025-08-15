import { inject, injectable } from "inversify";
import { AxiosService } from "../../axios/axios.service";
import {
  ExternalApiException,
  ResourceAccessForbiddenException,
} from "../../../exceptions/exceptions";
import { getEnv } from "../../../application/appEnv";
import { handleAxiosError } from "../../../utilities/handleAxiosError";

@injectable()
export class GoogleReCAPTCHAService {
  constructor(
    @inject(AxiosService) public readonly AxiosService: AxiosService
  ) {}

  async verify(token: string, action: string): Promise<void> {
    const siteKey = getEnv("RECAPTCHA_SITE_KEY");
    const projectId = getEnv("RECAPTCHA_PROJECT_ID");
    const projectKey = getEnv("RECAPTCHA_PROJECT_KEY");
    const riskAnalysisLowerLimit = parseFloat(
      getEnv("RECAPTCHA_RISK_ANALYSIS_LOWER_LIMIT")
    );
    const payload = {
      event: {
        token: token,
        expectedAction: action,
        siteKey: siteKey,
      },
    };
    const uri = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${projectKey}`;
    try {
      const response = await this.AxiosService.post<ReCAPTCHAResponse>(
        uri,
        payload
      );
      if (!response.data.tokenProperties.valid) {
        throw new ResourceAccessForbiddenException({
          message: "invalid token property data",
          data: { response: response.data },
        });
      }
      if (response.data.riskAnalysis.score < riskAnalysisLowerLimit) {
        throw new ResourceAccessForbiddenException({
          message: "did not pass risk analysis score",
          data: { response: response.data },
        });
      }
      return;
    } catch (error) {
      if (error instanceof ResourceAccessForbiddenException) {
        throw error;
      }
      const infos = handleAxiosError(error);
      throw new ExternalApiException({
        message: "invoking recaptcha endpoint failed",
        statusCode: infos.code,
        data: { error: error },
      });
    }
  }
}
