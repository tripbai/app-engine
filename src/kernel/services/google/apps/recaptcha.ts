import axios from "axios"
import { handleAxiosError } from "../../axios/error.handler"
import { ExternalApiException, ResourceAccessForbiddenException } from "../../../exceptions/exceptions"
import { AppENV } from "../../../helpers/env"

export namespace GoogleReCAPTCHA {
  const serviceCode = 'GOOGRECPCHA'
  export const verify = (token: string, action: string): Promise<{}> => {
    return new Promise (async (resolve, reject) => {
      try {
        const payload = {
          event: {
            token: token,
            expectedAction: action,
            siteKey: '6LegqQYqAAAAAA18VSfBvi5O3xCisZBw-iPRicCB',
          }
        }

        const projectId = AppENV.get('RECAPTCHA_PROJECT_ID')
        const projectKey = AppENV.get('RECAPTCHA_PROJECT_KEY')
        const riskAnalysisLowerLimit = parseFloat(
          AppENV.get('RECAPTCHA_RISK_ANALYSIS_LOWER_LIMIT')
        )

        const uri = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${projectKey}`;
        const response = await axios.post<ReCAPTCHAResponse>(uri,payload)
        if (!response.data.tokenProperties.valid) {
          reject(new ResourceAccessForbiddenException({
            message: 'invalid token property data',
            data: { response: response.data }
          }))
          return
        }
        if (response.data.riskAnalysis.score < riskAnalysisLowerLimit) {
          reject(new ResourceAccessForbiddenException({
            message: 'did not pass risk analysis score',
            data: { response: response.data }
          }))
          return
        }
        resolve({})
      } catch (error) {
        const infos = handleAxiosError(error)
        reject(new ExternalApiException({
          message: 'invoking recaptcha endpoint failed',
          statusCode: infos.code,
          data: {error: error}
        }))
      }
    })
    
  }
}

type ReCAPTCHAResponse = {
  name: string,
  event: {
    token: string,
    siteKey: string,
    userAgent: string,
    userIpAddress: string,
    expectedAction: string,
    hashedAccountId: string,
    express: false,
    requestedUri: string,
    wafTokenAssessment: string,
    ja3: string,
    headers: [],
    firewallPolicyEvaluation: false,
    fraudPrevention: string
  },
  riskAnalysis: {
    score: number,
    reasons: [],
    extendedVerdictReasons: []
  },
  tokenProperties: {
    valid: boolean,
    invalidReason: string,
    hostname: string,
    androidPackageName: string,
    iosBundleId: string,
    action: string,
    createTime: string
  },
  accountDefenderAssessment: {
    labels: []
  }
}

type RecaptchaVaultConfig = {
  RECAPTCHA_PROJECT_ID: string
  RECAPTCHA_PROJECT_KEY: string
  RECAPTCHA_RISK_ANALYSIS_LOWER_LIMIT: number
}